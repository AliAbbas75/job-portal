"""Staff login, session and logout under /api/admin (T-023)."""

from flask import Blueprint, g, request
from flask_jwt_extended import get_jwt

from app.controllers.auth_guard import staff_required
from app.schemas.staff_schema import PasswordChangeInput, StaffLoginInput, StaffSchema
from app.services import auth_service, staff_service

admin_auth_bp = Blueprint("admin_auth", __name__)


@admin_auth_bp.post("/auth/login")
def login():
    data = StaffLoginInput().load(request.get_json(silent=True) or {})
    user = staff_service.login(data["email"], data["password"])
    return {"token": staff_service.staff_token(user), "staff": StaffSchema().dump(user)}


@admin_auth_bp.get("/auth/session")
@staff_required()
def session():
    return {"staff": StaffSchema().dump(g.staff)}


@admin_auth_bp.post("/auth/logout")
@staff_required()
def logout():
    auth_service.revoke_token(get_jwt())
    return "", 204


@admin_auth_bp.post("/auth/password")
@staff_required()
def change_password():
    data = PasswordChangeInput().load(request.get_json(silent=True) or {})
    staff_service.change_password(g.staff, data["current_password"], data["new_password"])
    return "", 204
