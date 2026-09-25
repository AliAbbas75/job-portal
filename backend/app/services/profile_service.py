"""Candidate profile editing (T-042). Every change is recorded in the audit log as edit history.

Edits only change the permanent profile; submitted applications keep their own snapshot.
"""

from marshmallow import ValidationError
from sqlalchemy import select

from app.extensions import db
from app.models import District, EducationRecord, ExperienceRecord, Province, QualificationLevel
from app.services import audit_service
from app.utils.errors import AppError

ITEM_MODELS = {"education": EducationRecord, "experience": ExperienceRecord}


def _record_edit(account, profile, section, fields):
    # Edit history: which section and fields changed, never the values (no personal data in logs).
    audit_service.record(
        "profile.updated",
        "candidate_profile",
        profile.id,
        candidate=account,
        details={"section": section, "fields": sorted(fields)},
    )


def _invalid(field, message):
    return ValidationError({field: [message]})


def update_section(account, profile, section, values):
    """Applies validated values for personal, contact, domicile or additional."""
    if section == "domicile":
        values = _resolve_domicile(values)
    changed = [name for name, value in values.items() if getattr(profile, name) != value]
    for name, value in values.items():
        setattr(profile, name, value)
    if changed:
        _record_edit(account, profile, section, changed)
    db.session.commit()
    return profile


def _resolve_domicile(values):
    province = db.session.get(Province, values["province"])
    if province is None:
        raise _invalid("province", "Unknown province.")
    district = db.session.scalar(
        select(District).where(
            District.province_code == province.code, District.name == values["district"]
        )
    )
    if district is None:
        raise _invalid("district", "Choose a district in the selected province.")
    return {"domicile_province_code": province.code, "domicile_district_id": district.id}


def update_summary(account, profile, values):
    """Saves the one-page profile form. The single address fills the current address, and the
    permanent address too when it is still empty."""
    if not db.session.get(QualificationLevel, values["highest_qualification"]):
        raise _invalid("highestQualification", "Unknown qualification level.")
    domicile = _resolve_domicile({"province": values["province"], "district": values["district"]})
    updates = {
        "full_name": values["full_name"],
        "father_name": values["father_name"],
        "dob": values["dob"],
        "gender": values["gender"],
        "email": values["email"],
        "current_address": values["address"],
        "permanent_address": profile.permanent_address or values["address"],
        "highest_qualification_code": values["highest_qualification"],
        "trade_certificate": values["trade_certificate"],
        "quota_claim": values["quota"],
        "age_relaxation_claim": values["age_relaxation"],
        **domicile,
    }
    changed = [name for name, value in updates.items() if getattr(profile, name) != value]
    for name, value in updates.items():
        setattr(profile, name, value)
    if changed:
        _record_edit(account, profile, "summary", changed)
    db.session.commit()
    return profile


def update_skills(account, profile, skills):
    cleaned = list(dict.fromkeys(s.strip() for s in skills if s.strip()))  # dedupe, keep order
    if cleaned != profile.skills:
        profile.skills = cleaned
        _record_edit(account, profile, "skills", ["skills"])
    db.session.commit()
    return profile


def _own_item(profile, section, item_id):
    model = ITEM_MODELS[section]
    item = db.session.get(model, item_id)
    if item is None or item.profile_id != profile.id:
        raise AppError("not_found", "Entry not found.", status=404)
    return item


def save_item(account, profile, section, values, item_id=None):
    """Creates (item_id=None) or updates an education/experience entry."""
    if section == "education" and not db.session.get(
        QualificationLevel, values["qualification_level_code"]
    ):
        raise _invalid("level", "Unknown qualification level.")
    if item_id is None:
        item = ITEM_MODELS[section](profile_id=profile.id, **values)
        db.session.add(item)
        db.session.flush()
    else:
        item = _own_item(profile, section, item_id)
        for name, value in values.items():
            setattr(item, name, value)
    _record_edit(account, profile, section, [f"{section}:{item.id}"])
    db.session.commit()
    db.session.refresh(profile)
    return profile


def delete_item(account, profile, section, item_id):
    item = _own_item(profile, section, item_id)
    db.session.delete(item)
    _record_edit(account, profile, section, [f"{section}:{item_id}:deleted"])
    db.session.commit()
    db.session.refresh(profile)
    return profile
