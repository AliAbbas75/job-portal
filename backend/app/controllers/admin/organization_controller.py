"""Organisation profile for the admin panel. Any staff member can read it; admins edit it."""

from flask import Blueprint, g, request, send_file

from app.controllers.auth_guard import staff_required
from app.models.enums import StaffRole
from app.schemas.organization_schema import OrganizationInput
from app.services import organization_service

admin_organization_bp = Blueprint("admin_organization", __name__)


def _public(profile):
    return {
        **{k: v for k, v in profile.items() if k != "logoKey"},
        "hasLogo": bool(profile["logoKey"]),
    }


@admin_organization_bp.get("/organization")
@staff_required()
def get_organization():
    return _public(organization_service.get_profile())


@admin_organization_bp.put("/organization")
@staff_required(StaffRole.ADMIN)
def update_organization():
    values = OrganizationInput().load(request.get_json(silent=True) or {})
    return _public(organization_service.update_profile(g.staff, values))


@admin_organization_bp.post("/organization/logo")
@staff_required(StaffRole.ADMIN)
def upload_logo():
    return _public(organization_service.save_logo(g.staff, request.files.get("file")))


@admin_organization_bp.get("/organization/logo")
@staff_required()
def get_logo():
    path, content_type = organization_service.logo()
    return send_file(path, mimetype=content_type, max_age=0)
