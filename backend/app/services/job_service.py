"""Public job listing and details (T-040, T-041). Candidates only ever see published jobs."""

from datetime import UTC, datetime

from sqlalchemy import func, or_, select
from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models import Department, Job, JobRequirement, QualificationLevel
from app.models.constants import BPS_RANGES, CLOSING_WINDOWS
from app.models.enums import EmploymentType, JobStatus
from app.utils.errors import AppError

LOAD_ALL = (
    selectinload(Job.department),
    selectinload(Job.requirement),
    selectinload(Job.quotas),
    selectinload(Job.required_documents),
    selectinload(Job.domicile_provinces),
)


def _now():
    return datetime.now(UTC)


def _open_jobs(now):
    """Published, past their opening date and not yet closed."""
    return select(Job).where(
        Job.status == JobStatus.PUBLISHED, Job.opening_date <= now, Job.closing_date > now
    )


def search_jobs(
    q="",
    sort="",
    bps="",
    department="",
    employment_type="",
    location="",
    qualification="",
    closing="",
    page=1,
    page_size=10,
):
    """Open jobs matching the filters. Returns (jobs on this page, total matches)."""
    now = _now()
    stmt = _open_jobs(now).join(Department).join(JobRequirement)

    for word in q.split():
        pattern = f"%{word}%"
        stmt = stmt.where(
            or_(
                Job.title.ilike(pattern),
                Job.summary.ilike(pattern),
                Department.name.ilike(pattern),
                Job.location.ilike(pattern),
                func.concat("bps-", Job.bps).ilike(pattern),
            )
        )
    if bps:
        low, high = next((r[2], r[3]) for r in BPS_RANGES if r[0] == bps)
        stmt = stmt.where(Job.bps.between(low, high))
    if department:
        stmt = stmt.where(Job.department_code == department)
    if employment_type:
        stmt = stmt.where(Job.employment_type == EmploymentType(employment_type))
    if location:
        stmt = stmt.where(Job.location == location)
    if qualification:
        # Jobs open to someone holding this qualification: required level ranks at or below it.
        candidate_rank = select(QualificationLevel.rank).where(
            QualificationLevel.code == qualification
        )
        required = QualificationLevel.__table__.alias("required_level")
        stmt = stmt.join(required, required.c.code == JobRequirement.min_qualification_code).where(
            required.c.rank <= candidate_rank.scalar_subquery()
        )
    if closing:
        stmt = stmt.where(Job.closing_date <= now + CLOSING_WINDOWS[closing])

    total = db.session.scalar(select(func.count()).select_from(stmt.subquery()))
    order = (
        Job.closing_date.asc()
        if sort == "closing"
        else func.coalesce(Job.published_at, Job.opening_date).desc()
    )
    jobs = db.session.scalars(
        stmt.options(*LOAD_ALL)
        .order_by(order, Job.id)
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()
    return jobs, total


def get_public_job(job_id):
    """A published (or published-then-closed) job. Drafts and unapproved jobs are never visible."""
    job = db.session.scalars(
        select(Job)
        .options(*LOAD_ALL)
        .where(Job.id == job_id, Job.status.in_([JobStatus.PUBLISHED, JobStatus.CLOSED]))
    ).first()
    if job is None:
        raise AppError("not_found", "Job not found.", status=404)
    return job


def job_stats():
    open_jobs = _open_jobs(_now()).subquery()
    counts = db.session.execute(
        select(
            func.count(open_jobs.c.id),
            func.coalesce(func.sum(open_jobs.c.vacancies), 0),
            func.count(func.distinct(open_jobs.c.department_code)),
        )
    ).one()
    locations = db.session.scalars(
        select(open_jobs.c.location).distinct().order_by(open_jobs.c.location)
    ).all()
    return {
        "open_jobs": counts[0],
        "vacancies": int(counts[1]),
        "departments": counts[2],
        "locations": locations,
    }
