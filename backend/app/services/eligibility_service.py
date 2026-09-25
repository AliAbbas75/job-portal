"""Eligibility engine (T-060): a job's structured requirements vs. a candidate's profile.

Only structured profile data is used (never uploaded resumes). Each rule gives one item:
  met      the profile satisfies it
  missing  the profile doesn't have the data yet; `fix` names the profile section to fill in
  not_met  the data is there and doesn't satisfy it, so the candidate can't apply
The output matches frontend/src/api/mocks/eligibilityMock.js.
"""

from datetime import UTC, datetime

from sqlalchemy import select

from app.extensions import db
from app.models import QualificationLevel
from app.utils.dates import age_on

DAYS_PER_YEAR = 365.25


def _ranks():
    return dict(db.session.execute(select(QualificationLevel.code, QualificationLevel.rank)).all())


def _education(req, profile, ranks):
    required = {
        "level": req.min_qualification_code,
        "marks": float(req.min_marks_percent) if req.min_marks_percent is not None else None,
    }
    item = {"key": "education", "required": required}
    if not profile.education:
        return {**item, "status": "missing", "fix": "education"}
    needed = ranks.get(req.min_qualification_code, 0)
    qualifying = [
        e for e in profile.education if ranks.get(e.qualification_level_code, 0) >= needed
    ]
    if not qualifying:
        return {**item, "status": "not_met"}
    if req.min_marks_percent is not None and all(
        e.marks_percent < req.min_marks_percent for e in qualifying
    ):
        return {**item, "status": "not_met", "reason": "marks"}
    return {**item, "status": "met"}


def experience_years(records, today):
    """Total years of experience, to one decimal, rounded down. Current jobs count up to today."""
    days = 0
    for record in records:
        end = today if record.is_current or record.end_date is None else record.end_date
        days += max(0, (end - record.start_date).days)
    return int(days / DAYS_PER_YEAR * 10) / 10


def _experience(req, profile, today):
    needed = float(req.min_experience_years)
    actual = experience_years(profile.experience, today)
    item = {"key": "experience", "required": {"years": needed}, "actual": actual}
    if actual >= needed:
        return {**item, "status": "met"}
    return {**item, "status": "missing", "fix": "experience"}


def age_reference_date(job):
    """Age is calculated on the advertisement's cutoff date if set, else the closing date."""
    return job.age_cutoff_date or job.closing_date.astimezone(UTC).date()


def _age(req, job, profile):
    item = {"key": "age", "required": {"min": req.age_min, "max": req.age_max}}
    if profile.dob is None:
        return {**item, "status": "missing", "fix": "personal"}
    actual = age_on(profile.dob, age_reference_date(job))
    status = "met" if req.age_min <= actual <= req.age_max else "not_met"
    return {**item, "status": status, "actual": actual}


def _domicile(job, profile):
    provinces = sorted(job.domicile_provinces, key=lambda p: p.code)
    item = {"key": "domicile", "required": {"provinces": [p.name for p in provinces]}}
    if not profile.domicile_province_code:
        return {**item, "status": "missing", "fix": "domicile"}
    allowed = {p.code for p in provinces}
    return {**item, "status": "met" if profile.domicile_province_code in allowed else "not_met"}


def check(job, profile, documents, today=None):
    """Returns {items, eligible, complete}. `documents` are the candidate's current documents."""
    today = today or datetime.now(UTC).date()
    req = job.requirement
    items = [_education(req, profile, _ranks())]
    if req.min_experience_years > 0:
        items.append(_experience(req, profile, today))
    items.append(_age(req, job, profile))
    if job.domicile_provinces:
        items.append(_domicile(job, profile))

    by_type = {doc.document_type_code: doc for doc in documents}
    for doc_type in sorted(job.required_documents, key=lambda d: d.code):
        doc = by_type.get(doc_type.code)
        items.append(
            {
                "key": "document",
                "documentType": doc_type.code,
                "status": "met" if doc else "missing",
                "documentId": doc.id if doc else None,
            }
        )
    return {
        "items": items,
        "eligible": all(item["status"] != "not_met" for item in items),
        "complete": all(item["status"] == "met" for item in items),
    }
