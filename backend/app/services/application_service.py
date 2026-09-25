"""Applications (T-061, T-062, T-064, T-065, master flow §4.6-4.9).

- The check lists what a job needs; items the candidate fills in are saved to the profile
  (through the profile and document endpoints), never to the application.
- Submitting freezes the relevant profile data in an ApplicationSnapshot. Later profile edits
  don't change it. Submitted applications can't be edited or withdrawn.
- One application per candidate per job (unique constraint).
- Every status change writes a StatusEvent and an audit entry.
"""

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models import Application, ApplicationSnapshot, Job, StatusEvent
from app.models.constants import next_application_statuses
from app.models.enums import ApplicationStatus
from app.schemas.profile_schema import ProfileSchema
from app.services import audit_service, eligibility_service
from app.services.candidate_service import profile_of
from app.services.document_service import current_documents
from app.utils.dates import age_on
from app.utils.errors import AppError

SNAPSHOT_SECTIONS = ("personal", "contact", "domicile", "education", "experience", "additional")


def _job(job_id):
    job = db.session.get(Job, job_id)
    if job is None:
        raise AppError("not_found", "Job not found.", 404)
    return job


def _existing(profile, job):
    return db.session.scalar(
        select(Application).where(
            Application.profile_id == profile.id, Application.job_id == job.id
        )
    )


def application_check(account, job_id):
    """What this job needs from the candidate, and whether they can apply now."""
    job = _job(job_id)
    if not job.is_open() and job.published_at is None:
        raise AppError("not_found", "Job not found.", 404)  # drafts stay invisible
    profile = profile_of(account)
    result = eligibility_service.check(job, profile, current_documents(profile))
    existing = _existing(profile, job)
    return {
        **result,
        "alreadyAppliedId": existing.application_no if existing else None,
        "jobClosed": not job.is_open(),
    }


def _snapshot_data(profile, job, check):
    dumped = ProfileSchema().dump(profile)
    data = {section: dumped[section] for section in SNAPSHOT_SECTIONS}
    reference_date = eligibility_service.age_reference_date(job)
    data["ageOnReferenceDate"] = age_on(profile.dob, reference_date) if profile.dob else None
    data["ageReferenceDate"] = reference_date.isoformat()
    data["eligibility"] = check["items"]
    return data


def submit(account, job_id, declaration_accepted):
    job = _job(job_id)
    if not job.is_open():
        raise AppError("job_closed", "Applications for this job have closed.", 409)
    profile = profile_of(account)
    if _existing(profile, job):
        raise AppError("already_applied", "You've already applied for this job.", 409)
    if not declaration_accepted:
        raise AppError("declaration_required", "Please accept the declaration.", 422)

    documents = current_documents(profile)
    check = eligibility_service.check(job, profile, documents)
    if not (check["complete"] and check["eligible"]):
        raise AppError("requirements_incomplete", "Some requirements are still missing.", 422)

    required = {d.code for d in job.required_documents}
    application = Application(profile=profile, job=job, status=ApplicationStatus.SUBMITTED)
    application.snapshot = ApplicationSnapshot(
        profile_data=_snapshot_data(profile, job, check),
        documents=[d for d in documents if d.document_type_code in required],
    )
    application.events = [StatusEvent(status=ApplicationStatus.SUBMITTED)]
    db.session.add(application)
    try:
        db.session.flush()
    except IntegrityError:
        # Two submits at once: the unique (profile, job) constraint stops the second.
        db.session.rollback()
        raise AppError("already_applied", "You've already applied for this job.", 409) from None
    audit_service.record("application.submitted", "application", application.id, candidate=account)
    db.session.commit()
    return application


def _with_details():
    return (
        selectinload(Application.job).selectinload(Job.department),
        selectinload(Application.events),
    )


def list_for_candidate(account):
    profile = profile_of(account)
    return db.session.scalars(
        select(Application)
        .options(*_with_details())
        .where(Application.profile_id == profile.id)
        .order_by(Application.submitted_at.desc())
    ).all()


def get_for_candidate(account, application_no):
    application = db.session.scalar(
        select(Application).where(
            Application.application_no == application_no,
            Application.profile_id == profile_of(account).id,
        )
    )
    if application is None:
        raise AppError("not_found", "Application not found.", 404)
    return application


# ---- Staff (T-065) ----


def list_for_job(job_id, status=""):
    _job(job_id)
    stmt = (
        select(Application)
        .options(selectinload(Application.snapshot), selectinload(Application.events))
        .where(Application.job_id == job_id)
        .order_by(Application.submitted_at)
    )
    if status:
        if status not in {s.value for s in ApplicationStatus}:
            raise AppError("validation_error", "Unknown status.", 422)
        stmt = stmt.where(Application.status == status)
    return db.session.scalars(stmt).all()


def get_by_number(application_no):
    application = db.session.scalar(
        select(Application).where(Application.application_no == application_no)
    )
    if application is None:
        raise AppError("not_found", "Application not found.", 404)
    return application


def change_status(staff, application, status, note=None):
    status = ApplicationStatus(status)
    if status not in next_application_statuses(application.status):
        raise AppError("invalid_status_change", "The application can't move to that status.", 409)
    previous = application.status
    application.status = status
    db.session.add(
        StatusEvent(
            application=application,
            status=status,
            note=(note or "").strip() or None,
            actor_staff_id=staff.id,
        )
    )
    audit_service.record(
        "application.status_changed",
        "application",
        application.id,
        staff=staff,
        details={"from": previous.value, "to": status.value},
    )
    db.session.commit()
    return application
