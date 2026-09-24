"""Test setup (T-006).

The test database (TEST_DATABASE_URL) is rebuilt once per run from the real migrations, then
seeded with reference data. After each test every non-reference table is truncated.
"""

from datetime import UTC, datetime, timedelta

import pytest
from flask_migrate import upgrade
from sqlalchemy import text

from app import create_app
from app.extensions import db
from app.models import (
    CandidateAccount,
    CandidateProfile,
    Job,
    JobQuota,
    JobRequirement,
)
from app.models.enums import EmploymentType, QuotaCategory
from app.services.reference_seed_service import seed_reference_data

REFERENCE_TABLES = {
    "departments",
    "provinces",
    "districts",
    "qualification_levels",
    "document_types",
}


@pytest.fixture(scope="session")
def app():
    app = create_app("testing")
    with app.app_context():
        db.session.execute(text("DROP SCHEMA public CASCADE"))
        db.session.execute(text("CREATE SCHEMA public"))
        db.session.commit()
        upgrade()
        seed_reference_data()
        yield app
        db.session.remove()


@pytest.fixture(autouse=True)
def _clean_tables(app):
    yield
    db.session.rollback()
    tables = [t.name for t in db.metadata.sorted_tables if t.name not in REFERENCE_TABLES]
    db.session.execute(text(f"TRUNCATE {', '.join(tables)} RESTART IDENTITY CASCADE"))
    db.session.commit()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def make_candidate():
    """Creates an account + empty profile. CNICs are obviously fake test values."""

    def _make(cnic="00000-0000000-1", mobile="03000000000"):
        account = CandidateAccount(cnic=cnic, mobile=mobile)
        account.profile = CandidateProfile()
        db.session.add(account)
        db.session.flush()
        return account

    return _make


@pytest.fixture
def make_job():
    def _make(**overrides):
        now = datetime.now(UTC)
        fields = {
            "title": "Assistant Station Master",
            "department_code": "TRF",
            "bps": 11,
            "location": "Lahore",
            "employment_type": EmploymentType.PERMANENT,
            "vacancies": 10,
            "summary": "Run station operations.",
            "description": "Full description.",
            "opening_date": now,
            "closing_date": now + timedelta(days=21),
        }
        fields.update(overrides)
        job = Job(**fields)
        job.requirement = JobRequirement(
            min_qualification_code="intermediate", age_min=18, age_max=28
        )
        job.quotas = [JobQuota(category=QuotaCategory.OPEN_MERIT, seats=fields["vacancies"])]
        db.session.add(job)
        db.session.flush()
        return job

    return _make
