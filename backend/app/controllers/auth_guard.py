"""Access control for candidate and staff endpoints.

Candidate token (issued by auth_service): identity = candidate account id as a string, claim
{"role": "candidate"}. Staff token (staff_service): identity = staff user id as a string, claims
{"role": "staff", "staffRole": "job_creator" | "approver" | "admin"}. Logged-out tokens are refused.
"""

from functools import wraps

from flask import g
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.extensions import jwt
from app.services.auth_service import CANDIDATE_ROLE, is_token_revoked
from app.services.candidate_service import get_active_account
from app.services.staff_service import STAFF_ROLE, get_active_staff
from app.utils.errors import AppError


@jwt.token_in_blocklist_loader
def _token_revoked(jwt_header, jwt_payload):
    return is_token_revoked(jwt_payload)


def _please_log_in():
    return AppError("unauthorized", "Please log in.", status=401)


def candidate_required(view):
    """Requires a candidate token; loads the active account into `g.candidate`."""

    @wraps(view)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        if get_jwt().get("role") != CANDIDATE_ROLE:
            raise AppError("forbidden", "Candidates only.", status=403)
        account = get_active_account(int(get_jwt_identity()))
        if account is None:
            raise _please_log_in()
        g.candidate = account
        return view(*args, **kwargs)

    return wrapper


def staff_required(*roles):
    """Requires a staff token, and one of `roles` if given (StaffRole values). Loads the active
    staff user into `g.staff`. The role is read from the database, so a role change applies at
    once."""
    allowed = {str(role) for role in roles}

    def decorator(view):
        @wraps(view)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            if get_jwt().get("role") != STAFF_ROLE:
                raise AppError("forbidden", "Staff only.", status=403)
            user = get_active_staff(int(get_jwt_identity()))
            if user is None:
                raise _please_log_in()
            if allowed and user.role.value not in allowed:
                raise AppError("forbidden", "Your role can't do this.", status=403)
            g.staff = user
            return view(*args, **kwargs)

        return wrapper

    return decorator
