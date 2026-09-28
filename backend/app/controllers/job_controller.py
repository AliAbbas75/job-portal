from flask import Blueprint, request, send_file

from app.schemas.job_schema import JobSchema, JobSearchArgsSchema, JobStatsSchema
from app.services import job_service
from app.services.storage_service import path_of

job_bp = Blueprint("jobs", __name__)


@job_bp.get("/jobs")
def search_jobs():
    args = JobSearchArgsSchema().load(request.args)
    jobs, total = job_service.search_jobs(**args)
    return {
        "items": JobSchema(many=True).dump(jobs),
        "total": total,
        "page": args["page"],
        "pageSize": args["page_size"],
    }


@job_bp.get("/jobs/stats")
def job_stats():
    return JobStatsSchema().dump(job_service.job_stats())


@job_bp.get("/jobs/<int:job_id>")
def get_job(job_id):
    return JobSchema().dump(job_service.get_public_job(job_id))


@job_bp.get("/jobs/<int:job_id>/advertisement")
def job_advertisement(job_id):
    key, filename = job_service.advertisement_of(job_id)
    return send_file(path_of(key), download_name=filename, max_age=0)
