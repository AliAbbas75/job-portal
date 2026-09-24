"""Document vault (T-043): upload once, reuse across applications.

Replacing or removing a document archives it rather than deleting it, because submitted
application snapshots may still point to it. Only current (non-archived) documents are listed.
"""

from datetime import UTC, datetime

from marshmallow import ValidationError
from sqlalchemy import select
from werkzeug.utils import secure_filename

from app.extensions import db
from app.models import Document, DocumentType
from app.services import audit_service
from app.services.storage_service import save_upload
from app.utils.errors import AppError


def current_documents(profile):
    return db.session.scalars(
        select(Document)
        .where(Document.profile_id == profile.id, Document.archived_at.is_(None))
        .order_by(Document.uploaded_at)
    ).all()


def _current_of_type(profile, type_code):
    return db.session.scalar(
        select(Document).where(
            Document.profile_id == profile.id,
            Document.document_type_code == type_code,
            Document.archived_at.is_(None),
        )
    )


def upload(account, profile, type_code, file):
    """Stores `file` (a werkzeug FileStorage) as the candidate's current document of `type_code`."""
    if not type_code or db.session.get(DocumentType, type_code) is None:
        raise ValidationError({"type": ["Unknown document type."]})
    if file is None or not file.filename:
        raise ValidationError({"file": ["Choose a file to upload."]})

    stored = save_upload(file.stream)
    previous = _current_of_type(profile, type_code)
    if previous is not None:
        previous.archived_at = datetime.now(UTC)
        db.session.flush()  # free the "one current document per type" slot first

    document = Document(
        profile_id=profile.id,
        document_type_code=type_code,
        original_filename=secure_filename(file.filename)[:255] or "document",
        storage_key=stored.storage_key,
        content_type=stored.content_type,
        size_bytes=stored.size_bytes,
    )
    db.session.add(document)
    db.session.flush()
    audit_service.record(
        "document.uploaded",
        "document",
        document.id,
        candidate=account,
        details={"type": type_code, "replaced": previous.id if previous else None},
    )
    db.session.commit()
    return document


def remove(account, profile, document_id):
    document = db.session.get(Document, document_id)
    if document is None or document.profile_id != profile.id or document.archived_at is not None:
        raise AppError("not_found", "Document not found.", status=404)
    document.archived_at = datetime.now(UTC)
    audit_service.record("document.removed", "document", document.id, candidate=account)
    db.session.commit()
