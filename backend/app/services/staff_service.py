"""Staff accounts and login (T-023). Passwords are hashed with Argon2id.

Staff tokens: identity = staff user id as a string, claims {"role": "staff", "staffRole": ...}.
"""

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from flask_jwt_extended import create_access_token
from sqlalchemy import func, select

from app.extensions import db
from app.models import StaffUser
from app.services import audit_service
from app.utils.errors import AppError

STAFF_ROLE = "staff"
MIN_PASSWORD_LENGTH = 12

_hasher = PasswordHasher()  # argon2id with the library's recommended parameters
# Checked against when the email is unknown, so both failures take the same time.
_DUMMY_HASH = _hasher.hash("not-a-real-password")


def _by_email(email):
    return db.session.scalar(select(StaffUser).where(func.lower(StaffUser.email) == email.lower()))


def get_active_staff(staff_id):
    user = db.session.get(StaffUser, staff_id)
    return user if user is not None and user.is_active else None


def create_staff(name, email, password, role, department_code=None):
    if len(password) < MIN_PASSWORD_LENGTH:
        raise AppError("weak_password", f"Use at least {MIN_PASSWORD_LENGTH} characters.")
    if _by_email(email):
        raise AppError("email_taken", "A staff account with this email already exists.", 409)
    user = StaffUser(
        name=name,
        email=email.lower(),
        password_hash=_hasher.hash(password),
        role=role,
        department_code=department_code,
    )
    db.session.add(user)
    db.session.commit()
    return user


def login(email, password):
    """Returns the staff user, or raises invalid_credentials (same error for every failure)."""
    user = _by_email(email)
    try:
        _hasher.verify(user.password_hash if user else _DUMMY_HASH, password)
    except (VerificationError, InvalidHashError):
        user = None
    if user is None or not user.is_active:
        raise AppError("invalid_credentials", "Email or password is incorrect.", 401)

    if _hasher.check_needs_rehash(user.password_hash):
        user.password_hash = _hasher.hash(password)
    audit_service.record("staff.logged_in", "staff_user", user.id, staff=user)
    db.session.commit()
    return user


def staff_token(user):
    return create_access_token(
        identity=str(user.id), additional_claims={"role": STAFF_ROLE, "staffRole": user.role.value}
    )
