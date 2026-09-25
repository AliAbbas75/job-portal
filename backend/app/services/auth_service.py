"""Candidate signup and login with a CNIC, mobile number and SMS code (T-020, T-022).

Signup creates the candidate's permanent profile. Logins issue the token that
`@candidate_required` accepts: identity = account id as a string, claim {"role": "candidate"}.
"""

from datetime import UTC, datetime, timedelta

from flask_jwt_extended import create_access_token
from marshmallow import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import CandidateAccount, CandidateProfile, RevokedToken
from app.models.enums import MobileOperator, OtpPurpose
from app.services import audit_service, captcha_service, otp_service
from app.utils.errors import AppError

CANDIDATE_ROLE = "candidate"
REMEMBER_ME = timedelta(days=30)


def _account_by_cnic(cnic):
    return db.session.scalar(select(CandidateAccount).where(CandidateAccount.cnic == cnic))


def _cnic_taken():
    return AppError("cnic_taken", "An account with this CNIC already exists.", 409)


def _login_account(cnic, mobile):
    account = _account_by_cnic(cnic)
    if account is None or not account.is_active or account.mobile != mobile:
        raise AppError("account_not_found", "No account matches this CNIC and mobile.", 404)
    return account


def _require_operator(operator):
    if not operator:
        raise ValidationError({"operator": ["Select your mobile network."]})


def request_otp(purpose, cnic, mobile, captcha_token=None, remote_ip=None, operator=None):
    """Checks the request makes sense, then texts a code. Returns the code's lifetime."""
    captcha_service.verify(captcha_token, remote_ip)
    if purpose == OtpPurpose.SIGNUP:
        _require_operator(operator)
        if _account_by_cnic(cnic):
            raise _cnic_taken()
    else:
        _login_account(cnic, mobile)
    ttl = otp_service.issue(purpose, cnic, mobile)
    db.session.commit()
    return ttl


def verify_otp(purpose, cnic, mobile, code, operator=None):
    """Signs up or logs in. Returns the candidate account. A login may update the operator
    (numbers can move between networks)."""
    if purpose == OtpPurpose.LOGIN:
        account = _login_account(cnic, mobile)
    else:
        _require_operator(operator)
        if _account_by_cnic(cnic):
            raise _cnic_taken()
    otp_service.verify(purpose, cnic, mobile, code)

    now = datetime.now(UTC)
    if purpose == OtpPurpose.SIGNUP:
        account = CandidateAccount(cnic=cnic, mobile=mobile)
        account.profile = CandidateProfile()
        db.session.add(account)
        db.session.flush()
        audit_service.record(
            "candidate.signed_up", "candidate_account", account.id, candidate=account
        )
    if operator:
        account.mobile_operator = MobileOperator(operator)
    account.last_login_at = now
    try:
        db.session.commit()
    except IntegrityError:
        # Two signups for the same CNIC at once: the unique constraint stops the second.
        db.session.rollback()
        raise _cnic_taken() from None
    return account


def candidate_token(account, remember=False):
    """8 hours by default; 30 days when the candidate ticks "Remember me"."""
    return create_access_token(
        identity=str(account.id),
        additional_claims={"role": CANDIDATE_ROLE},
        expires_delta=REMEMBER_ME if remember else None,
    )


def revoke_token(jwt_payload):
    """Ends a login token early (logout)."""
    if db.session.get(RevokedToken, jwt_payload["jti"]) is None:
        expires_at = datetime.fromtimestamp(jwt_payload["exp"], UTC)
        db.session.add(RevokedToken(jti=jwt_payload["jti"], expires_at=expires_at))
        db.session.commit()


def is_token_revoked(jwt_payload):
    return db.session.get(RevokedToken, jwt_payload["jti"]) is not None
