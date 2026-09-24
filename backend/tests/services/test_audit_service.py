from app.extensions import db
from app.models import AuditLog
from app.services.audit_service import record


def test_record_adds_an_entry_for_the_actor(make_candidate):
    candidate = make_candidate()
    record(
        "profile.updated",
        "candidate_profile",
        candidate.profile.id,
        candidate=candidate,
        details={"section": "personal"},
    )
    db.session.flush()

    entry = db.session.query(AuditLog).one()
    assert entry.action == "profile.updated"
    assert entry.entity_id == str(candidate.profile.id)
    assert entry.actor_candidate_id == candidate.id
    assert entry.actor_staff_id is None
    assert entry.details == {"section": "personal"}
