from datetime import UTC, datetime, timedelta

import pytest

from app.extensions import db
from app.models.enums import JobStatus, StaffRole
from app.services import admin_job_service
from app.utils.errors import AppError


@pytest.fixture
def pending_job(make_job, make_staff):
    creator = make_staff(role=StaffRole.JOB_CREATOR, email="creator@example.com")
    job = make_job(status=JobStatus.PENDING_APPROVAL, created_by_id=creator.id)
    db.session.commit()
    return job


def _approver(make_staff, n):
    return make_staff(role=StaffRole.APPROVER, email=f"approver{n}@example.com")


def _code(fn, *args):
    with pytest.raises(AppError) as error:
        fn(*args)
    return error.value.code


def test_n_of_m_approvals(app, pending_job, make_staff):
    app.config["JOB_APPROVALS_REQUIRED"] = 2
    try:
        first, second = _approver(make_staff, 1), _approver(make_staff, 2)
        admin_job_service.decide(first, pending_job, "approved")
        assert pending_job.status == JobStatus.PENDING_APPROVAL
        assert _code(admin_job_service.decide, first, pending_job, "approved") == "already_decided"
        admin_job_service.decide(second, pending_job, "approved")
        assert pending_job.status == JobStatus.APPROVED and pending_job.approved_at
    finally:
        app.config["JOB_APPROVALS_REQUIRED"] = 1


def test_return_starts_a_new_round(app, pending_job, make_staff):
    app.config["JOB_APPROVALS_REQUIRED"] = 2
    try:
        first, second = _approver(make_staff, 1), _approver(make_staff, 2)
        admin_job_service.decide(first, pending_job, "approved")
        admin_job_service.decide(second, pending_job, "returned", "Fix the fee.")
        assert pending_job.status == JobStatus.RETURNED

        pending_job.status = JobStatus.PENDING_APPROVAL  # resubmitted
        admin_job_service.decide(first, pending_job, "approved")  # allowed again: new round
        assert pending_job.status == JobStatus.PENDING_APPROVAL
    finally:
        app.config["JOB_APPROVALS_REQUIRED"] = 1


def test_creator_cannot_approve_own_job(pending_job, make_staff):
    admin = make_staff(role=StaffRole.ADMIN)
    pending_job.created_by_id = admin.id
    assert _code(admin_job_service.decide, admin, pending_job, "approved") == "own_job"


def test_close_expired_jobs(make_job):
    now = datetime.now(UTC)
    expired = make_job(
        status=JobStatus.PUBLISHED,
        opening_date=now - timedelta(days=30),
        closing_date=now - timedelta(minutes=1),
    )
    live = make_job(status=JobStatus.PUBLISHED)
    draft = make_job(closing_date=now - timedelta(days=1), opening_date=now - timedelta(days=9))
    assert admin_job_service.close_expired_jobs() == 1
    assert expired.status == JobStatus.CLOSED
    assert live.status == JobStatus.PUBLISHED and draft.status == JobStatus.DRAFT


def test_publish_rejects_duplicate_advertisement_number(make_job, make_staff):
    from marshmallow import ValidationError

    admin = make_staff(role=StaffRole.ADMIN)
    make_job(status=JobStatus.PUBLISHED, advertisement_no="PR/REC/2026/001")
    job = make_job(status=JobStatus.APPROVED)
    with pytest.raises(ValidationError):
        admin_job_service.publish(admin, job, "PR/REC/2026/001")
    assert _code(admin_job_service.publish, admin, make_job()) == "invalid_status"
