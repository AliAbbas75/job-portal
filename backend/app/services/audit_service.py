"""Audit helper (T-017). Adds an entry to the current session; the caller's commit saves it."""

from app.extensions import db
from app.models.audit_log import AuditLog


def record(action, entity_type, entity_id, *, staff=None, candidate=None, details=None):
    """Record `action` on an entity, e.g. record("job.approved", "job", job.id, staff=user).

    Keep `details` free of personal data (CNIC, phone numbers, document contents).
    """
    entry = AuditLog(
        action=action,
        entity_type=entity_type,
        entity_id=str(entity_id),
        actor_staff_id=staff.id if staff else None,
        actor_candidate_id=candidate.id if candidate else None,
        details=details or {},
    )
    db.session.add(entry)
    return entry
