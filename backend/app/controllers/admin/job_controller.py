"""Staff job endpoints under /api/admin (T-030 to T-032).

Job creators (and admins) draft and submit, approvers (and admins) decide, admins publish.
"""

from flask import Blueprint, g, request

from app.controllers.auth_guard import staff_required
from app.models.enums import StaffRole
from app.schemas.admin_job_schema import (
    AdminJobListArgs,
    AdminJobSchema,
    DecisionInput,
    JobInput,
    PublishInput,
)
from app.services import admin_job_service

admin_job_bp = Blueprint("admin_jobs", __name__)

CREATORS = (StaffRole.JOB_CREATOR, StaffRole.ADMIN)
APPROVERS = (StaffRole.APPROVER, StaffRole.ADMIN)


def _body(schema):
    return schema().load(request.get_json(silent=True) or {})


def _job(job):
    return AdminJobSchema().dump(job)


@admin_job_bp.get("/jobs")
@staff_required()
def list_jobs():
    args = AdminJobListArgs().load(request.args)
    return {"items": AdminJobSchema(many=True).dump(admin_job_service.list_jobs(args["status"]))}


@admin_job_bp.post("/jobs")
@staff_required(*CREATORS)
def create_job():
    return _job(admin_job_service.create_draft(g.staff, _body(JobInput))), 201


@admin_job_bp.get("/jobs/<int:job_id>")
@staff_required()
def get_job(job_id):
    return _job(admin_job_service.get_job(job_id))


@admin_job_bp.put("/jobs/<int:job_id>")
@staff_required(*CREATORS)
def update_job(job_id):
    job = admin_job_service.get_job(job_id)
    return _job(admin_job_service.update_draft(g.staff, job, _body(JobInput)))


@admin_job_bp.post("/jobs/<int:job_id>/submit")
@staff_required(*CREATORS)
def submit_job(job_id):
    return _job(admin_job_service.submit(g.staff, admin_job_service.get_job(job_id)))


@admin_job_bp.post("/jobs/<int:job_id>/decision")
@staff_required(*APPROVERS)
def decide(job_id):
    data = _body(DecisionInput)
    job = admin_job_service.get_job(job_id)
    return _job(admin_job_service.decide(g.staff, job, data["action"], data["comments"]))


@admin_job_bp.post("/jobs/<int:job_id>/publish")
@staff_required(StaffRole.ADMIN)
def publish(job_id):
    data = _body(PublishInput)
    job = admin_job_service.get_job(job_id)
    return _job(admin_job_service.publish(g.staff, job, data["advertisement_no"]))
