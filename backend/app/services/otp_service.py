"""One-time codes for candidate signup and login (T-021): expiry, rate limits, SMS."""

import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta

from flask import current_app
from sqlalchemy import func, or_, select

from app.extensions import db
from app.models import OtpChallenge
from app.services import sms_service
from app.utils.errors import AppError


def _hash(purpose, cnic, code):
    key = current_app.config["SECRET_KEY"].encode()
    return hmac.new(key, f"{purpose}:{cnic}:{code}".encode(), hashlib.sha256).hexdigest()


def _check_rate_limits(purpose, cnic, mobile, now):
    """Per purpose, so signing up and then applying straight away both work."""
    config = current_app.config
    recent = OtpChallenge.created_at > now - timedelta(hours=1)
    same_person = or_(OtpChallenge.cnic == cnic, OtpChallenge.mobile == mobile)
    count, last_sent = db.session.execute(
        select(func.count(), func.max(OtpChallenge.created_at)).where(
            recent, same_person, OtpChallenge.purpose == purpose
        )
    ).one()
    if last_sent and last_sent > now - timedelta(seconds=config["OTP_RESEND_SECONDS"]):
        raise AppError("otp_too_soon", "Please wait a minute before asking for a new code.", 429)
    if count >= config["OTP_MAX_SENDS_PER_HOUR"]:
        raise AppError("otp_rate_limited", "Too many codes requested. Try again later.", 429)


def issue(purpose, cnic, mobile):
    """Sends a new code by SMS, replacing any unused one. Returns its lifetime in seconds.
    The caller commits."""
    now = datetime.now(UTC)
    _check_rate_limits(purpose, cnic, mobile, now)

    for old in db.session.scalars(
        select(OtpChallenge).where(
            OtpChallenge.purpose == purpose,
            OtpChallenge.cnic == cnic,
            OtpChallenge.consumed_at.is_(None),
        )
    ):
        old.consumed_at = now

    ttl = current_app.config["OTP_TTL_SECONDS"]
    code = f"{secrets.randbelow(10**6):06d}"
    db.session.add(
        OtpChallenge(
            purpose=purpose,
            cnic=cnic,
            mobile=mobile,
            code_hash=_hash(purpose, cnic, code),
            expires_at=now + timedelta(seconds=ttl),
            created_at=now,
        )
    )
    sms_service.send(
        mobile,
        f"Your Pakistan Railways verification code is {code}. "
        f"It expires in {ttl // 60} minutes.",
    )
    return ttl


def verify(purpose, cnic, mobile, code):
    """Uses up the current code, or raises. Wrong guesses are saved even though this raises."""
    now = datetime.now(UTC)
    challenge = db.session.scalar(
        select(OtpChallenge)
        .where(
            OtpChallenge.purpose == purpose,
            OtpChallenge.cnic == cnic,
            OtpChallenge.mobile == mobile,
            OtpChallenge.consumed_at.is_(None),
        )
        .order_by(OtpChallenge.created_at.desc())
        .limit(1)
    )
    if challenge is None or challenge.expires_at <= now:
        raise AppError("otp_expired", "This code has expired. Ask for a new one.")
    if challenge.attempts >= current_app.config["OTP_MAX_ATTEMPTS"]:
        raise AppError("otp_attempts_exceeded", "Too many wrong codes. Ask for a new one.")

    challenge.attempts += 1
    if not hmac.compare_digest(challenge.code_hash, _hash(purpose, cnic, code)):
        db.session.commit()
        raise AppError("invalid_otp", "That code isn't right.")
    challenge.consumed_at = now
