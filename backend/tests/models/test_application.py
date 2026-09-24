import re
from datetime import UTC, datetime

import pytest
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Application, ApplicationSnapshot, StatusEvent
from app.models.enums import ApplicationStatus


def apply(profile, job):
    application = Application(profile_id=profile.id, job_id=job.id)
    db.session.add(application)
    db.session.flush()
    return application


def test_application_no_is_generated(make_candidate, make_job):
    application = apply(make_candidate().profile, make_job())
    db.session.refresh(application)
    year = datetime.now(UTC).year
    assert re.fullmatch(rf"PR-{year}-\d{{6}}", application.application_no)
    assert application.status is ApplicationStatus.SUBMITTED


def test_one_application_per_candidate_per_job(make_candidate, make_job):
    profile, job = make_candidate().profile, make_job()
    apply(profile, job)
    with pytest.raises(IntegrityError):
        apply(profile, job)


def test_same_candidate_can_apply_to_different_jobs(make_candidate, make_job):
    profile = make_candidate().profile
    apply(profile, make_job())
    apply(profile, make_job(title="Ticket Checker"))
    assert db.session.query(Application).count() == 2


def test_snapshot_and_status_history(make_candidate, make_job):
    application = apply(make_candidate().profile, make_job())
    application.snapshot = ApplicationSnapshot(profile_data={"full_name": "Test Candidate"})
    db.session.add_all(
        [
            StatusEvent(application_id=application.id, status=ApplicationStatus.SUBMITTED),
            StatusEvent(application_id=application.id, status=ApplicationStatus.UNDER_REVIEW),
        ]
    )
    db.session.flush()
    db.session.expire_all()

    assert application.snapshot.profile_data == {"full_name": "Test Candidate"}
    assert [e.status for e in application.events] == [
        ApplicationStatus.SUBMITTED,
        ApplicationStatus.UNDER_REVIEW,
    ]


def test_withdrawn_is_not_a_valid_status(make_candidate, make_job):
    # Submitted applications are final: there is no withdrawn status.
    application = apply(make_candidate().profile, make_job())
    with pytest.raises(IntegrityError):
        db.session.execute(
            db.text("UPDATE applications SET status = 'withdrawn' WHERE id = :id"),
            {"id": application.id},
        )
