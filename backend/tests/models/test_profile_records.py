from datetime import date

import pytest
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import EducationRecord, ExperienceRecord


def education(profile, **overrides):
    fields = {
        "profile_id": profile.id,
        "qualification_level_code": "intermediate",
        "discipline": "Pre-Engineering",
        "institution": "Test Board",
        "passing_year": 2019,
        "marks_percent": 62,
    }
    fields.update(overrides)
    return EducationRecord(**fields)


def test_education_saves_and_orders_by_year(make_candidate):
    profile = make_candidate().profile
    db.session.add_all(
        [education(profile, passing_year=2019), education(profile, passing_year=2017)]
    )
    db.session.flush()
    db.session.expire_all()
    assert [e.passing_year for e in profile.education] == [2017, 2019]


def test_marks_must_be_a_percentage(make_candidate):
    db.session.add(education(make_candidate().profile, marks_percent=120))
    with pytest.raises(IntegrityError):
        db.session.flush()


@pytest.mark.parametrize(
    ("is_current", "end_date"),
    [(True, date(2024, 1, 1)), (False, None), (False, date(2019, 1, 1))],
)
def test_experience_dates_must_be_consistent(make_candidate, is_current, end_date):
    db.session.add(
        ExperienceRecord(
            profile_id=make_candidate().profile.id,
            organization="Org",
            designation="Clerk",
            start_date=date(2020, 1, 1),
            end_date=end_date,
            is_current=is_current,
        )
    )
    with pytest.raises(IntegrityError):
        db.session.flush()


def test_deleting_profile_removes_its_records(make_candidate):
    account = make_candidate()
    db.session.add(education(account.profile))
    db.session.flush()
    db.session.delete(account.profile)
    db.session.flush()
    assert db.session.query(EducationRecord).count() == 0
