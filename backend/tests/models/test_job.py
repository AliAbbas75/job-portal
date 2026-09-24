from datetime import UTC, datetime, timedelta

import pytest
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import DocumentType, Province
from app.models.enums import JobStatus


def test_job_saves_with_requirement_quotas_and_documents(make_job):
    job = make_job()
    job.required_documents = [db.session.get(DocumentType, "cnic_copy")]
    job.domicile_provinces = [db.session.get(Province, "SD")]
    db.session.flush()
    db.session.expire_all()

    assert job.status is JobStatus.DRAFT
    assert job.requirement.min_qualification_code == "intermediate"
    assert [q.seats for q in job.quotas] == [10]
    assert [d.code for d in job.required_documents] == ["cnic_copy"]
    assert [p.code for p in job.domicile_provinces] == ["SD"]


@pytest.mark.parametrize("bps", [0, 23])
def test_bps_must_be_1_to_22(make_job, bps):
    with pytest.raises(IntegrityError):
        make_job(bps=bps)


def test_closing_date_must_follow_opening(make_job):
    now = datetime.now(UTC)
    with pytest.raises(IntegrityError):
        make_job(opening_date=now, closing_date=now - timedelta(days=1))


def test_age_range_must_be_valid(make_job):
    job = make_job()
    job.requirement.age_min, job.requirement.age_max = 30, 25
    with pytest.raises(IntegrityError):
        db.session.flush()


def test_unknown_department_is_rejected(make_job):
    with pytest.raises(IntegrityError):
        make_job(department_code="XXX")
