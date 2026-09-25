"""Staff job workflow (T-030 to T-032, master flow §3.1-3.3).

draft/returned --submit--> pending_approval --N approvals--> approved --publish--> published
pending_approval --return--> returned (editable again) · --reject--> rejected (closed for good)
published --closing date passes--> closed

Approved and published jobs are locked: there is no edit path for them (no corrigendum).
"""

from datetime import UTC, datetime

from flask import current_app
from marshmallow import ValidationError
from sqlalchemy import select

from app.extensions import db
from app.models import (
    ApprovalRecord,
    Department,
    DocumentType,
    Job,
    JobQuota,
    JobRequirement,
    Province,
    QualificationLevel,
)
from app.models.enums import ApprovalAction, EmploymentType, JobStatus, QuotaCategory
from app.services import audit_service
from app.services.job_service import LOAD_ALL
from app.utils.errors import AppError

EDITABLE = {JobStatus.DRAFT, JobStatus.RETURNED}


def _now():
    return datetime.now(UTC)


def list_jobs(status=""):
    stmt = select(Job).options(*LOAD_ALL).order_by(Job.updated_at.desc(), Job.id.desc())
    if status:
        if status not in {s.value for s in JobStatus}:
            raise ValidationError({"status": ["Unknown status."]})
        stmt = stmt.where(Job.status == status)
    return db.session.scalars(stmt).all()


def get_job(job_id):
    job = db.session.get(Job, job_id)
    if job is None:
        raise AppError("not_found", "Job not found.", 404)
    return job


def _lookup(model, codes, field):
    found = {
        row.code: row for row in db.session.scalars(select(model).where(model.code.in_(codes)))
    }
    missing = [code for code in codes if code not in found]
    if missing:
        raise ValidationError({field: [f"Unknown: {', '.join(missing)}."]})
    return [found[code] for code in codes]


def _apply(job, values):
    """Copies validated JobInput values onto the job, checking reference codes exist."""
    req = values["requirements"]
    _lookup(Department, [values["department"]], "department")
    _lookup(QualificationLevel, [req["min_qualification"]], "requirements")
    job.title = values["title"]
    job.department_code = values["department"]
    job.bps = values["bps"]
    job.location = values["location"]
    job.employment_type = EmploymentType(values["employment_type"])
    job.vacancies = values["vacancies"]
    job.summary = values["summary"]
    job.description = values["description"]
    job.requisition_ref = values["requisition_ref"]
    job.opening_date = values["opening_date"]
    job.closing_date = values["closing_date"]
    job.age_cutoff_date = values["age_cutoff_date"]
    job.fee_amount = values["fee"]

    requirement = job.requirement or JobRequirement()
    requirement.min_qualification_code = req["min_qualification"]
    requirement.min_marks_percent = req["min_marks_percent"]
    requirement.min_experience_years = req["experience_years"]
    requirement.age_min = req["age_min"]
    requirement.age_max = req["age_max"]
    job.requirement = requirement

    job.domicile_provinces = _lookup(
        Province, sorted(set(req["domicile_provinces"])), "requirements"
    )
    job.required_documents = _lookup(DocumentType, sorted(set(req["documents"])), "requirements")

    # Replace quotas; on an existing job, flush the removals first so the (job, category)
    # unique key can't clash.
    if job.id is not None:
        job.quotas = []
        db.session.flush()
    job.quotas = [
        JobQuota(category=QuotaCategory(q["category"]), seats=q["seats"]) for q in values["quotas"]
    ]


def create_draft(staff, values):
    job = Job(status=JobStatus.DRAFT, created_by_id=staff.id)
    _apply(job, values)
    db.session.add(job)
    db.session.flush()
    audit_service.record("job.created", "job", job.id, staff=staff)
    db.session.commit()
    return job


def update_draft(staff, job, values):
    if job.status not in EDITABLE:
        raise AppError("job_locked", "Only draft or returned jobs can be edited.", 409)
    _apply(job, values)
    audit_service.record("job.updated", "job", job.id, staff=staff)
    db.session.commit()
    return job


def submit(staff, job):
    if job.status not in EDITABLE:
        raise AppError("invalid_status", "Only draft or returned jobs can be submitted.", 409)
    if job.closing_date <= _now():
        raise ValidationError({"closingDate": ["Closing date has already passed."]})
    job.status = JobStatus.PENDING_APPROVAL
    audit_service.record("job.submitted", "job", job.id, staff=staff)
    db.session.commit()
    return job


def _current_round(job):
    """Decisions since the job was last returned (a returned job starts a fresh round)."""
    records = []
    for record in job.approvals:
        if record.action == ApprovalAction.RETURNED:
            records = []
        else:
            records.append(record)
    return records


def decide(staff, job, action, comments=None):
    """An approver approves, returns (with comments) or rejects a job waiting for approval."""
    action = ApprovalAction(action)
    if job.status != JobStatus.PENDING_APPROVAL:
        raise AppError("invalid_status", "This job isn't waiting for approval.", 409)
    if job.created_by_id == staff.id:
        raise AppError("own_job", "You can't approve a job you created.", 403)
    if any(r.approver_id == staff.id for r in _current_round(job)):
        raise AppError("already_decided", "You've already approved this job.", 409)
    comments = (comments or "").strip() or None
    if action != ApprovalAction.APPROVED and not comments:
        raise ValidationError({"comments": ["Say why the job is being returned or rejected."]})

    db.session.add(ApprovalRecord(job=job, approver_id=staff.id, action=action, comments=comments))
    db.session.flush()
    db.session.refresh(job, ["approvals"])

    if action == ApprovalAction.RETURNED:
        job.status = JobStatus.RETURNED
    elif action == ApprovalAction.REJECTED:
        job.status = JobStatus.REJECTED
    else:
        approvals = len(_current_round(job))
        if approvals >= current_app.config["JOB_APPROVALS_REQUIRED"]:
            job.status = JobStatus.APPROVED
            job.approved_at = _now()
    audit_service.record(
        f"job.{action.value}", "job", job.id, staff=staff, details={"status": job.status.value}
    )
    db.session.commit()
    return job


def publish(staff, job, advertisement_no=None):
    """Publishes an approved job. It shows on the portal from its opening date."""
    if job.status != JobStatus.APPROVED:
        raise AppError("invalid_status", "Only approved jobs can be published.", 409)
    now = _now()
    if job.closing_date <= now:
        raise AppError("job_closed", "The closing date has already passed.", 409)
    number = (advertisement_no or "").strip() or f"PR/REC/{now.year}/{job.id:03d}"
    taken = db.session.scalar(
        select(Job.id).where(Job.advertisement_no == number, Job.id != job.id)
    )
    if taken:
        raise ValidationError({"advertisementNo": ["This advertisement number is already used."]})
    job.advertisement_no = number
    job.status = JobStatus.PUBLISHED
    job.published_at = now
    audit_service.record("job.published", "job", job.id, staff=staff)
    db.session.commit()
    return job


def close_expired_jobs(now=None):
    """Closes published jobs whose closing date has passed. Run on a schedule. Returns count."""
    now = now or _now()
    jobs = db.session.scalars(
        select(Job).where(Job.status == JobStatus.PUBLISHED, Job.closing_date <= now)
    ).all()
    for job in jobs:
        job.status = JobStatus.CLOSED
        audit_service.record("job.closed", "job", job.id, details={"reason": "closing date"})
    db.session.commit()
    return len(jobs)
