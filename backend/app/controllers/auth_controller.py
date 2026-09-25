"""Candidate signup, login and logout (T-020, T-022)."""

from flask import Blueprint, abort, g, request
from flask_jwt_extended import get_jwt, jwt_required

from app.controllers.auth_guard import candidate_required
from app.models.enums import OtpPurpose
from app.schemas.auth_schema import CandidateSessionSchema, OtpRequestInput, OtpVerifyInput
from app.services import auth_service

auth_bp = Blueprint("auth", __name__)


def _purpose(value):
    if value not in {p.value for p in OtpPurpose}:
        abort(404)
    return OtpPurpose(value)


@auth_bp.post("/auth/<purpose>/otp")
def request_otp(purpose):
    purpose = _purpose(purpose)
    data = OtpRequestInput().load(request.get_json(silent=True) or {})
    ttl = auth_service.request_otp(
        purpose,
        data["cnic"],
        data["mobile"],
        data["captcha_token"],
        request.remote_addr,
        data["operator"],
    )
    return {"expiresInSeconds": ttl}


@auth_bp.post("/auth/<purpose>/verify")
def verify_otp(purpose):
    purpose = _purpose(purpose)
    data = OtpVerifyInput().load(request.get_json(silent=True) or {})
    account = auth_service.verify_otp(
        purpose, data["cnic"], data["mobile"], data["otp"], data["operator"]
    )
    session = {
        "token": auth_service.candidate_token(account, data["remember"]),
        "candidate": CandidateSessionSchema().dump(account),
    }
    return session, 201 if purpose == OtpPurpose.SIGNUP else 200


@auth_bp.get("/auth/session")
@candidate_required
def session():
    return {"candidate": CandidateSessionSchema().dump(g.candidate)}


@auth_bp.post("/auth/logout")
@jwt_required()
def logout():
    auth_service.revoke_token(get_jwt())
    return "", 204
