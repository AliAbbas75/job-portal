"""Staff view of applications and manual status changes (T-065).

Any staff member can view; admins change statuses until automated screening (deferred) exists.
"""

from flask import Blueprint, g, request

from app.controllers.auth_guard import staff_required
from app.models.enums import StaffRole
from app.schemas.application_schema import (
    FeeConfirmInput,
    StaffApplicationSchema,
    StatusChangeInput,
    StatusListArgs,
)
from app.services import application_service

admin_application_bp = Blueprint("admin_applications", __name__)


@admin_application_bp.get("/jobs/<int:job_id>/applications")
@staff_required()
def list_for_job(job_id):
    args = StatusListArgs().load(request.args)
    applications = application_service.list_for_job(job_id, args["status"])
    return {"items": StaffApplicationSchema(many=True).dump(applications)}


@admin_application_bp.get("/applications/<application_no>")
@staff_required()
def get_application(application_no):
    return StaffApplicationSchema().dump(application_service.get_by_number(application_no))


@admin_application_bp.post("/applications/<application_no>/status")
@staff_required(StaffRole.ADMIN)
def change_status(application_no):
    data = StatusChangeInput().load(request.get_json(silent=True) or {})
    application = application_service.get_by_number(application_no)
    application = application_service.change_status(
        g.staff, application, data["status"], data["note"]
    )
    return StaffApplicationSchema().dump(application)


@admin_application_bp.post("/applications/<application_no>/fee")
@staff_required(StaffRole.ADMIN)
def confirm_fee(application_no):
    data = FeeConfirmInput().load(request.get_json(silent=True) or {})
    application = application_service.get_by_number(application_no)
    application = application_service.confirm_fee(g.staff, application, data["reference"])
    return StaffApplicationSchema().dump(application)
