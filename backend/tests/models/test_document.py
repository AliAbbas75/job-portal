from datetime import UTC, datetime

import pytest
from sqlalchemy.exc import IntegrityError

from app.extensions import db
from app.models import Document


def add_document(profile, key, doc_type="cnic_copy"):
    document = Document(
        profile_id=profile.id,
        document_type_code=doc_type,
        original_filename="cnic.pdf",
        storage_key=key,
        content_type="application/pdf",
        size_bytes=1000,
    )
    db.session.add(document)
    db.session.flush()
    return document


def test_only_one_current_document_per_type(make_candidate):
    profile = make_candidate().profile
    add_document(profile, "a.pdf")
    with pytest.raises(IntegrityError):
        add_document(profile, "b.pdf")


def test_archived_document_allows_a_replacement(make_candidate):
    profile = make_candidate().profile
    old = add_document(profile, "a.pdf")
    old.archived_at = datetime.now(UTC)
    db.session.flush()
    add_document(profile, "b.pdf")
    assert db.session.query(Document).count() == 2


def test_unknown_document_type_is_rejected(make_candidate):
    with pytest.raises(IntegrityError):
        add_document(make_candidate().profile, "a.pdf", doc_type="passport")
