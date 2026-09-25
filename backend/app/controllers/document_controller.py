from flask import Blueprint, g, request, send_file

from app.controllers.auth_guard import candidate_required
from app.schemas.document_schema import DocumentSchema
from app.services import document_service
from app.services.candidate_service import profile_of
from app.services.storage_service import path_of

document_bp = Blueprint("documents", __name__)


@document_bp.get("/documents")
@candidate_required
def list_documents():
    documents = document_service.current_documents(profile_of(g.candidate))
    return DocumentSchema(many=True).dump(documents)


@document_bp.post("/documents")
@candidate_required
def upload_document():
    document = document_service.upload(
        g.candidate,
        profile_of(g.candidate),
        request.form.get("type"),
        request.files.get("file"),
    )
    return DocumentSchema().dump(document), 201


@document_bp.delete("/documents/<int:document_id>")
@candidate_required
def delete_document(document_id):
    document_service.remove(g.candidate, profile_of(g.candidate), document_id)
    return "", 204


@document_bp.get("/documents/<int:document_id>/file")
@candidate_required
def download_document(document_id):
    """The candidate's own file, e.g. the photo shown as the profile picture."""
    document = document_service.own_document(profile_of(g.candidate), document_id)
    return send_file(
        path_of(document.storage_key),
        mimetype=document.content_type,
        download_name=document.original_filename,
        max_age=0,
    )
