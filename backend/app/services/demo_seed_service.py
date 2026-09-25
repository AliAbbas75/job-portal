"""Sample published jobs for local development (`flask seed-demo`).

Used until M3's admin UI can create jobs. Safe to run repeatedly: jobs are keyed by
advertisement number. Never run it in production.
"""

from datetime import UTC, datetime, timedelta

from sqlalchemy import select

from app.extensions import db
from app.models import DocumentType, Job, JobQuota, JobRequirement, Province
from app.models.enums import EmploymentType, JobStatus, QuotaCategory

STANDARD_DOCS = ["cnic_copy", "photo", "domicile_certificate", "character_certificate"]

DEMO_JOBS = [
    dict(ad_no="DEMO/001", title="Assistant Station Master", dept="TRF", bps=11,
         cat="station_staff",
         location="Lahore", type="permanent", vacancies=24, opened=1, closes=21,
         level="intermediate", marks=45, age_max=28,
         docs=["matric_certificate", "intermediate_certificate"],
         summary="Run day-to-day station operations and train movements safely and on time."),
    dict(ad_no="DEMO/002", title="Assistant Executive Engineer (Civil)", dept="CIV", bps=17,
         cat="engineering",
         location="Rawalpindi", type="permanent", vacancies=6, opened=1, closes=28,
         level="bachelor16", marks=60, age_max=32, docs=["degree", "pec_registration"], fee=800,
         summary="Plan and supervise track, bridge and building works across the division."),
    dict(ad_no="DEMO/003", title="Ticket Checker", dept="COM", bps=7,
         cat="ticket_checker",
         location="Karachi", type="permanent", vacancies=40, opened=2, closes=5,
         level="matric", age_max=25, provinces=["SD"], docs=["matric_certificate"],
         summary="Check tickets on board and at stations, and help passengers."),
    dict(ad_no="DEMO/004", title="Junior Engineer (Signal & Telecom)", dept="SNT", bps=14,
         cat="engineering",
         location="Multan", type="permanent", vacancies=10, opened=3, closes=14,
         level="dae", marks=50, experience=1, docs=["dae_certificate", "experience_certificate"],
         summary="Maintain signalling, interlocking and telecom equipment on the line."),
    dict(ad_no="DEMO/005", title="Assistant Director (IT)", dept="ITD", bps=17,
         cat="it",
         location="Lahore", type="contract", vacancies=3, opened=4, closes=18,
         level="bachelor16", experience=2, age_max=35, docs=["degree", "experience_certificate"],
         fee=800, summary="Build and run the software behind ticketing, HR and operations."),
    dict(ad_no="DEMO/006", title="Staff Nurse", dept="MED", bps=16,
         cat="medical",
         location="Quetta", type="permanent", vacancies=8, opened=5, closes=12,
         level="bachelor14", age_max=35, provinces=["BA"], docs=["degree"],
         summary="Provide nursing care at the Pakistan Railways hospital, Quetta."),
]  # fmt: skip


def _build_job(spec, now):
    opened = now - timedelta(days=spec["opened"])
    job = Job(
        title=spec["title"],
        department_code=spec["dept"],
        category_code=spec["cat"],
        bps=spec["bps"],
        location=spec["location"],
        employment_type=EmploymentType(spec["type"]),
        vacancies=spec["vacancies"],
        summary=spec["summary"],
        description=f"{spec['summary']} Sample job for local development.",
        status=JobStatus.PUBLISHED,
        advertisement_no=spec["ad_no"],
        opening_date=opened,
        published_at=opened,
        closing_date=now + timedelta(days=spec["closes"]),
        fee_amount=spec.get("fee", 0),
    )
    job.requirement = JobRequirement(
        min_qualification_code=spec["level"],
        min_marks_percent=spec.get("marks"),
        min_experience_years=spec.get("experience", 0),
        age_min=18,
        age_max=spec.get("age_max", 30),
    )
    job.quotas = [JobQuota(category=QuotaCategory.OPEN_MERIT, seats=spec["vacancies"])]
    job.required_documents = [
        db.session.get(DocumentType, code) for code in STANDARD_DOCS + spec["docs"]
    ]
    job.domicile_provinces = [db.session.get(Province, code) for code in spec.get("provinces", [])]
    return job


def seed_demo_jobs():
    """Creates any missing demo jobs. Returns how many were added."""
    now = datetime.now(UTC)
    added = 0
    for spec in DEMO_JOBS:
        existing = db.session.scalar(select(Job).where(Job.advertisement_no == spec["ad_no"]))
        if existing:
            existing.category_code = existing.category_code or spec["cat"]
            continue
        db.session.add(_build_job(spec, now))
        added += 1
    db.session.commit()
    return added
