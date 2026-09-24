import pytest
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import CandidateAccount, CandidateProfile


def test_cnic_is_unique(make_candidate):
    make_candidate(cnic="00000-0000000-1")
    with pytest.raises(IntegrityError):
        make_candidate(cnic="00000-0000000-1")


@pytest.mark.parametrize("cnic", ["0000000000001", "00000-000000-1", "abcde-0000000-1"])
def test_cnic_format_is_enforced(cnic):
    db.session.add(CandidateAccount(cnic=cnic, mobile="03000000000"))
    with pytest.raises(IntegrityError):
        db.session.flush()


def test_mobile_format_is_enforced():
    db.session.add(CandidateAccount(cnic="00000-0000000-2", mobile="13000000000"))
    with pytest.raises(IntegrityError):
        db.session.flush()


def test_one_profile_per_account(make_candidate):
    account = make_candidate()
    db.session.add(CandidateProfile(account_id=account.id))
    with pytest.raises(IntegrityError):
        db.session.flush()


def test_new_profile_defaults(make_candidate):
    profile = make_candidate().profile
    assert profile.nationality == "Pakistani"
    assert profile.skills == []
    assert profile.is_government_employee is False
