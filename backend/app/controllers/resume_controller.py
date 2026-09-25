"""Resume upload + parse and PDF export for the BPS-15+ tier (T-050, T-052).

The builder (T-051) uses the normal profile endpoints: /api/profile/<section> and
/api/profile/<registrations|publications|references>, and /api/profile/statement.
"""

from io import BytesIO

from flask import Blueprint, g, request, send_file

from app.controllers.auth_guard import candidate_required
from app.services import reference_service, resume_service
from app.services.candidate_service import profile_of

resume_bp = Blueprint("resume", __name__)


@resume_bp.post("/resume")
@candidate_required
def upload_resume():
    """Stores the resume and returns suggested profile values (nothing is saved to the profile)."""
    result = resume_service.upload_and_parse(
        g.candidate, profile_of(g.candidate), request.files.get("file")
    )
    return result, 201


@resume_bp.get("/resume/pdf")
@candidate_required
def resume_pdf():
    names = {q.code: q.name for q in reference_service.reference_data()["qualification_levels"]}
    pdf = resume_service.build_resume_pdf(profile_of(g.candidate), names)
    return send_file(
        BytesIO(pdf), mimetype="application/pdf", download_name="resume.pdf", max_age=0
    )
