"""Organisation profile shown and edited in the admin panel ("Employer Profile"): name, contact
details, policy notes and a logo. Stored as one settings row."""

from app.extensions import db
from app.models import Setting
from app.services import audit_service
from app.services.storage_service import delete_stored, path_of, save_upload
from app.utils.errors import AppError

KEY = "organization"
LOGO_TYPES = {"image/jpeg", "image/png"}

DEFAULTS = {
    "departmentName": "Pakistan Railways Headquarters",
    "cellId": "",
    "address": "Empress Road, Lahore, Punjab",
    "website": "https://pakrail.gov.pk",
    "officerName": "",
    "email": "info@pakrail.gov.pk",
    "phone": "042-99201938",
    "policyNotes": "",
    "logoKey": None,
}


def _row():
    return db.session.get(Setting, KEY)


def get_profile():
    row = _row()
    return {**DEFAULTS, **(row.value if row else {})}


def _save(staff, value, action, fields):
    row = _row() or Setting(key=KEY, value={})
    row.value = value
    row.updated_by_id = staff.id
    db.session.add(row)
    audit_service.record(action, "setting", KEY, staff=staff, details={"fields": sorted(fields)})
    db.session.commit()
    return value


def update_profile(staff, values):
    current = get_profile()
    changed = [key for key, value in values.items() if current.get(key) != value]
    return _save(staff, {**current, **values}, "organization.updated", changed)


def save_logo(staff, file):
    if file is None or not file.filename:
        raise AppError("validation_error", "Choose an image.", 422)
    stored = save_upload(file.stream, LOGO_TYPES)
    current = get_profile()
    if current["logoKey"]:
        delete_stored(current["logoKey"])
    return _save(staff, {**current, "logoKey": stored.storage_key}, "organization.logo", ["logo"])


def logo():
    """(path, content type) of the logo, or not_found."""
    key = get_profile()["logoKey"]
    if not key:
        raise AppError("not_found", "No logo uploaded.", 404)
    content_type = "image/png" if key.endswith(".png") else "image/jpeg"
    return path_of(key), content_type
