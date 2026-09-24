import io

import pytest

from app.extensions import db
from app.models import Document

PDF = b"%PDF-1.7 test"


@pytest.fixture(autouse=True)
def upload_dir(app, tmp_path, monkeypatch):
    monkeypatch.setitem(app.config, "UPLOAD_FOLDER", str(tmp_path))


def upload(client, headers, doc_type="cnic_copy", data=PDF, name="cnic.pdf"):
    return client.post(
        "/api/documents",
        data={"type": doc_type, "file": (io.BytesIO(data), name)},
        headers=headers,
        content_type="multipart/form-data",
    )


def test_documents_require_login(client):
    assert client.get("/api/documents").status_code == 401


def test_upload_and_list(client, make_candidate, auth_headers):
    headers = auth_headers(make_candidate())
    response = upload(client, headers)
    assert response.status_code == 201
    doc = response.get_json()
    assert doc["type"] == "cnic_copy" and doc["fileName"] == "cnic.pdf" and doc["size"] == len(PDF)
    assert [d["id"] for d in client.get("/api/documents", headers=headers).get_json()] == [
        doc["id"]
    ]


def test_new_upload_replaces_but_keeps_the_old_file(client, make_candidate, auth_headers):
    headers = auth_headers(make_candidate())
    first = upload(client, headers).get_json()
    second = upload(client, headers, name="cnic-new.pdf").get_json()

    listed = client.get("/api/documents", headers=headers).get_json()
    assert [d["id"] for d in listed] == [second["id"]]
    # The old one is archived, not deleted: submitted applications may still point to it.
    assert db.session.get(Document, first["id"]).archived_at is not None


def test_rejects_bad_files_and_types(client, make_candidate, auth_headers):
    headers = auth_headers(make_candidate())
    assert upload(client, headers, data=b"MZ\x90 exe").get_json()["code"] == "file_type_not_allowed"
    bad_type = upload(client, headers, doc_type="passport")
    assert bad_type.status_code == 422 and "type" in bad_type.get_json()["fields"]


def test_remove_archives_the_document(client, make_candidate, auth_headers):
    headers = auth_headers(make_candidate())
    doc = upload(client, headers).get_json()
    assert client.delete(f"/api/documents/{doc['id']}", headers=headers).status_code == 204
    assert client.get("/api/documents", headers=headers).get_json() == []
    assert client.delete(f"/api/documents/{doc['id']}", headers=headers).status_code == 404


def test_cannot_remove_another_candidates_document(client, make_candidate, auth_headers):
    doc = upload(client, auth_headers(make_candidate(cnic="00000-0000000-1"))).get_json()
    other = auth_headers(make_candidate(cnic="00000-0000000-2"))
    assert client.delete(f"/api/documents/{doc['id']}", headers=other).status_code == 404
