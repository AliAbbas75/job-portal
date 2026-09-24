import io

import pytest

from app.services.storage_service import delete_stored, save_upload
from app.utils.errors import AppError


@pytest.fixture
def upload_dir(app, tmp_path, monkeypatch):
    monkeypatch.setitem(app.config, "UPLOAD_FOLDER", str(tmp_path))
    return tmp_path


def test_saves_a_pdf_under_a_random_name(upload_dir):
    stored = save_upload(io.BytesIO(b"%PDF-1.7 test content"))
    assert stored.content_type == "application/pdf"
    assert stored.storage_key.endswith(".pdf")
    assert (upload_dir / stored.storage_key).read_bytes() == b"%PDF-1.7 test content"


@pytest.mark.parametrize(
    ("head", "content_type"),
    [(b"\xff\xd8\xff\xe0", "image/jpeg"), (b"\x89PNG\r\n\x1a\n", "image/png")],
)
def test_detects_images_by_content(upload_dir, head, content_type):
    assert save_upload(io.BytesIO(head + b"data")).content_type == content_type


def test_rejects_other_file_types_even_if_named_pdf(upload_dir):
    with pytest.raises(AppError) as error:
        save_upload(io.BytesIO(b"MZ\x90\x00 an exe"))
    assert error.value.code == "file_type_not_allowed"
    assert list(upload_dir.iterdir()) == []


def test_rejects_files_over_the_limit(app, upload_dir):
    too_big = b"%PDF-" + b"0" * app.config["MAX_UPLOAD_BYTES"]
    with pytest.raises(AppError) as error:
        save_upload(io.BytesIO(too_big))
    assert error.value.code == "file_too_large"


def test_delete_removes_the_file(upload_dir):
    stored = save_upload(io.BytesIO(b"%PDF-1.7"))
    delete_stored(stored.storage_key)
    assert not (upload_dir / stored.storage_key).exists()
