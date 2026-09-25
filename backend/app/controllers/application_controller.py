"""Candidate applications: check, submit, track (T-061, T-062, T-064)."""

from flask import Blueprint, g, request

from app.controllers.auth_guard import candidate_required
from app.schemas.application_schema import ApplicationSchema, SubmitInput
from app.services import application_service

application_bp = Blueprint("applications", __name__)


@application_bp.get("/jobs/<int:job_id>/application-check")
@candidate_required
def application_check(job_id):
    return application_service.application_check(g.candidate, job_id)


@application_bp.post("/jobs/<int:job_id>/applications")
@candidate_required
def submit(job_id):
    data = SubmitInput().load(request.get_json(silent=True) or {})
    application = application_service.submit(g.candidate, job_id, data["declaration_accepted"])
    return ApplicationSchema().dump(application), 201


@application_bp.get("/applications")
@candidate_required
def my_applications():
    applications = application_service.list_for_candidate(g.candidate)
    return ApplicationSchema(many=True).dump(applications)


@application_bp.get("/applications/<application_no>")
@candidate_required
def get_application(application_no):
    application = application_service.get_for_candidate(g.candidate, application_no)
    return ApplicationSchema().dump(application)
