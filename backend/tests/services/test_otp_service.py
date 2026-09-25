from datetime import timedelta

import pytest
from sqlalchemy import select

from app.extensions import db
from app.models import OtpChallenge
from app.models.enums import OtpPurpose
from app.services import otp_service
from app.utils.errors import AppError

CNIC = "00000-0000000-1"
MOBILE = "03000000000"
SIGNUP = OtpPurpose.SIGNUP


def _challenges():
    return db.session.scalars(select(OtpChallenge).order_by(OtpChallenge.id)).all()


def _age_all(seconds):
    """Pretend every code was sent `seconds` ago."""
    for challenge in _challenges():
        challenge.created_at -= timedelta(seconds=seconds)
        challenge.expires_at -= timedelta(seconds=seconds)
    db.session.flush()


def _error_code(fn, *args):
    with pytest.raises(AppError) as error:
        fn(*args)
    return error.value.code


def test_code_is_texted_and_only_its_hash_is_stored(sms_outbox, last_otp):
    assert otp_service.issue(SIGNUP, CNIC, MOBILE) == 300
    assert sms_outbox[-1][0] == MOBILE
    code = last_otp()
    [challenge] = _challenges()
    assert code not in challenge.code_hash and len(challenge.code_hash) == 64
    otp_service.verify(SIGNUP, CNIC, MOBILE, code)
    assert challenge.consumed_at is not None
    assert _error_code(otp_service.verify, SIGNUP, CNIC, MOBILE, code) == "otp_expired"


def test_wrong_code_counts_attempts_and_locks_after_five(sms_outbox, last_otp):
    otp_service.issue(SIGNUP, CNIC, MOBILE)
    wrong = "000000" if last_otp() != "000000" else "111111"
    for _ in range(5):
        assert _error_code(otp_service.verify, SIGNUP, CNIC, MOBILE, wrong) == "invalid_otp"
    assert _challenges()[0].attempts == 5
    code = last_otp()
    assert _error_code(otp_service.verify, SIGNUP, CNIC, MOBILE, code) == "otp_attempts_exceeded"


def test_code_expires(sms_outbox, last_otp):
    otp_service.issue(SIGNUP, CNIC, MOBILE)
    _age_all(301)
    assert _error_code(otp_service.verify, SIGNUP, CNIC, MOBILE, last_otp()) == "otp_expired"


def test_code_is_tied_to_purpose_and_mobile(sms_outbox, last_otp):
    otp_service.issue(SIGNUP, CNIC, MOBILE)
    code = last_otp()
    assert _error_code(otp_service.verify, OtpPurpose.LOGIN, CNIC, MOBILE, code) == "otp_expired"
    assert _error_code(otp_service.verify, SIGNUP, CNIC, "03009999999", code) == "otp_expired"


def test_resend_waits_a_minute_and_replaces_the_old_code(sms_outbox, last_otp):
    otp_service.issue(SIGNUP, CNIC, MOBILE)
    first = last_otp()
    assert _error_code(otp_service.issue, SIGNUP, CNIC, MOBILE) == "otp_too_soon"
    _age_all(61)
    otp_service.issue(SIGNUP, CNIC, MOBILE)
    old, new = _challenges()
    assert old.consumed_at is not None and new.consumed_at is None
    if first != last_otp():
        assert _error_code(otp_service.verify, SIGNUP, CNIC, MOBILE, first) == "invalid_otp"
    otp_service.verify(SIGNUP, CNIC, MOBILE, last_otp())


def test_at_most_five_codes_per_hour_per_cnic_or_mobile(sms_outbox):
    for _ in range(5):
        otp_service.issue(SIGNUP, CNIC, MOBILE)
        _age_all(61)
    assert _error_code(otp_service.issue, SIGNUP, CNIC, MOBILE) == "otp_rate_limited"
    # Same mobile, different CNIC: still limited.
    assert _error_code(otp_service.issue, SIGNUP, "00000-0000000-2", MOBILE) == "otp_rate_limited"
    _age_all(3600)
    otp_service.issue(SIGNUP, CNIC, MOBILE)


def test_sms_backend_must_be_configured(app, sms_outbox):
    app.config["SMS_BACKEND"] = None
    try:
        assert _error_code(otp_service.issue, SIGNUP, CNIC, MOBILE) == "sms_unavailable"
    finally:
        app.config["SMS_BACKEND"] = "memory"
    assert sms_outbox == []
