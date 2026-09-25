"""Lookup lists for the UI (GET /api/reference): DB reference tables plus fixed value sets."""

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.extensions import db
from app.models import Department, DocumentType, JobCategory, Province, QualificationLevel
from app.models.constants import BPS_RANGES, EMPLOYMENT_TYPE_NAMES, GENDER_NAMES


def reference_data():
    return {
        "departments": db.session.scalars(select(Department).order_by(Department.name)).all(),
        "provinces": db.session.scalars(
            select(Province).options(selectinload(Province.districts)).order_by(Province.name)
        ).all(),
        "qualification_levels": db.session.scalars(
            select(QualificationLevel).order_by(QualificationLevel.rank, QualificationLevel.code)
        ).all(),
        "document_types": db.session.scalars(
            select(DocumentType).order_by(DocumentType.name)
        ).all(),
        "job_categories": db.session.scalars(select(JobCategory).order_by(JobCategory.name)).all(),
        "employment_types": EMPLOYMENT_TYPE_NAMES,
        "bps_ranges": BPS_RANGES,
        "genders": GENDER_NAMES,
    }
