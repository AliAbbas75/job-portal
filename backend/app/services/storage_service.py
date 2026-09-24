"""File storage for the document vault (T-013).

Files are checked by their first bytes (not the name or the browser's content type),
limited to MAX_UPLOAD_BYTES, and saved under UPLOAD_FOLDER with a random name.
"""

import uuid
from dataclasses import dataclass
from pathlib import Path

from flask import current_app

from app.utils.errors import AppError

SIGNATURES = {
    b"%PDF-": ("application/pdf", ".pdf"),
    b"\xff\xd8\xff": ("image/jpeg", ".jpg"),
    b"\x89PNG\r\n\x1a\n": ("image/png", ".png"),
}


@dataclass(frozen=True)
class StoredFile:
    storage_key: str
    content_type: str
    size_bytes: int


def detect_type(head):
    for signature, file_type in SIGNATURES.items():
        if head.startswith(signature):
            return file_type
    return None


def _upload_dir():
    folder = Path(current_app.config["UPLOAD_FOLDER"])
    if not folder.is_absolute():
        folder = Path(current_app.root_path).parent / folder
    folder.mkdir(parents=True, exist_ok=True)
    return folder


def save_upload(stream):
    """Validates and stores an uploaded file (any object with .read()). Returns a StoredFile."""
    max_bytes = current_app.config["MAX_UPLOAD_BYTES"]
    data = stream.read(max_bytes + 1)
    if len(data) > max_bytes:
        raise AppError("file_too_large", "Files can be at most 2 MB.", status=413)
    file_type = detect_type(data[:8])
    if file_type is None:
        raise AppError("file_type_not_allowed", "Only PDF, JPG or PNG files.", status=422)

    content_type, extension = file_type
    storage_key = f"{uuid.uuid4().hex}{extension}"
    (_upload_dir() / storage_key).write_bytes(data)
    return StoredFile(storage_key=storage_key, content_type=content_type, size_bytes=len(data))


def delete_stored(storage_key):
    (_upload_dir() / storage_key).unlink(missing_ok=True)
