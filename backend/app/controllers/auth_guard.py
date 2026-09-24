"""Access control for candidate endpoints.

Token contract (issued by the M2 login endpoints, T-022): a Flask-JWT-Extended access token whose
identity is the candidate account id as a string, with the claim {"role": "candidate"}.
"""

from functools import wraps

from flask import g
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from app.services.candidate_service import get_active_account
from app.utils.errors import AppError

CANDIDATE_ROLE = "candidate"


def candidate_required(view):
    """Requires a candidate token; loads the active account into `g.candidate`."""

    @wraps(view)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        if get_jwt().get("role") != CANDIDATE_ROLE:
            raise AppError("forbidden", "Candidates only.", status=403)
        account = get_active_account(int(get_jwt_identity()))
        if account is None:
            raise AppError("unauthorized", "Please log in.", status=401)
        g.candidate = account
        return view(*args, **kwargs)

    return wrapper
