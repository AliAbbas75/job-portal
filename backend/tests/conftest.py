"""Test setup (T-006).

The test database (TEST_DATABASE_URL) is rebuilt once per run from the real migrations, then
seeded with reference data. After each test every non-reference table is truncated.
"""

import re
from datetime import UTC, date, datetime, timedelta

import pytest
from flask_jwt_extended import create_access_token
from flask_migrate import upgrade
from sqlalchemy import text

from app import create_app
from app.extensions import db
from app.models import (
    CandidateAccount,
    CandidateProfile,
    Document,
    DocumentType,
    EducationRecord,
    Job,
    JobQuota,
    JobRequirement,
    Province,
)
from app.models.enums import EmploymentType, JobStatus, QuotaCategory, StaffRole
from app.services.reference_seed_service import seed_reference_data
from app.services.staff_service import create_staff

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
    db.session.remove()  # forget this test's objects; ids restart at 1


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


@pytest.fixture
def publish_job(make_job):
    """Creates a job that is live on the public portal (published, opened yesterday)."""

    def _publish(**overrides):
        now = datetime.now(UTC)
        fields = {
            "status": JobStatus.PUBLISHED,
            "opening_date": now - timedelta(days=1),
            "published_at": now - timedelta(days=1),
        }
        fields.update(overrides)
        job = make_job(**fields)
        job.required_documents = [db.session.get(DocumentType, "cnic_copy")]
        job.domicile_provinces = [db.session.get(Province, "PB")]
        db.session.flush()
        return job

    return _publish


@pytest.fixture
def auth_headers():
    """Authorization header for a candidate, in the token format the M2 login must issue."""

    def _headers(account):
        token = create_access_token(
            identity=str(account.id), additional_claims={"role": "candidate"}
        )
        return {"Authorization": f"Bearer {token}"}

    return _headers


@pytest.fixture
def sms_outbox(app):
    """SMS sent during the test as (mobile, message) pairs (SMS_BACKEND=memory in tests)."""
    outbox = app.extensions.setdefault("sms_outbox", [])
    outbox.clear()
    yield outbox
    outbox.clear()


@pytest.fixture
def last_otp(sms_outbox):
    """The 6-digit code in the most recent SMS."""
    return lambda: re.search(r"\b(\d{6})\b", sms_outbox[-1][1]).group(1)


STAFF_PASSWORD = "correct-horse-battery"


@pytest.fixture
def make_staff():
    def _make(role=StaffRole.ADMIN, email="admin@example.com"):
        return create_staff("Test Staff", email, STAFF_PASSWORD, role)

    return _make


@pytest.fixture
def staff_headers(client):
    """Logs a staff user in through the API and returns the Authorization header."""

    def _headers(user):
        body = client.post(
            "/api/admin/auth/login", json={"email": user.email, "password": STAFF_PASSWORD}
        ).get_json()
        return {"Authorization": f"Bearer {body['token']}"}

    return _headers


@pytest.fixture
def eligible_candidate(make_candidate):
    """A candidate who meets `publish_job`'s defaults: intermediate 70%, age 22, Punjab
    domicile and a CNIC copy in the vault."""

    def _make(cnic="00000-0000000-1", mobile="03000000000"):
        account = make_candidate(cnic=cnic, mobile=mobile)
        profile = account.profile
        today = date.today()
        profile.full_name = "Test Candidate"
        profile.dob = date(today.year - 22, 1, 1)
        profile.domicile_province_code = "PB"
        profile.education = [
            EducationRecord(
                qualification_level_code="intermediate",
                discipline="Pre-Engineering",
                institution="Test College",
                passing_year=today.year - 3,
                marks_percent=70,
            )
        ]
        db.session.add(
            Document(
                profile_id=profile.id,
                document_type_code="cnic_copy",
                original_filename="cnic.pdf",
                storage_key=f"test/{cnic}/cnic.pdf",
                content_type="application/pdf",
                size_bytes=1000,
            )
        )
        db.session.commit()
        return account

    return _make
