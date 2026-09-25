from flask import Blueprint, abort, g, request

from app.controllers.auth_guard import candidate_required
from app.schemas.profile_schema import (
    ITEM_INPUTS,
    SECTION_INPUTS,
    ProfileSchema,
    SkillsInput,
    SummaryInput,
)
from app.services import profile_service
from app.services.candidate_service import profile_of

profile_bp = Blueprint("profile", __name__)


def _profile_response(profile):
    return ProfileSchema().dump(profile)


@profile_bp.get("/profile")
@candidate_required
def get_profile():
    return _profile_response(profile_of(g.candidate))


@profile_bp.put("/profile/<section>")
@candidate_required
def update_section(section):
    profile = profile_of(g.candidate)
    if section == "summary":
        values = SummaryInput().load(request.get_json(silent=True) or {})
        return _profile_response(profile_service.update_summary(g.candidate, profile, values))
    if section == "skills":
        skills = SkillsInput.deserialize(request.get_json(silent=True))
        return _profile_response(profile_service.update_skills(g.candidate, profile, skills))
    if section not in SECTION_INPUTS:
        abort(404)
    values = SECTION_INPUTS[section]().load(request.get_json(silent=True) or {})
    return _profile_response(profile_service.update_section(g.candidate, profile, section, values))


@profile_bp.post("/profile/<section>")
@candidate_required
def add_item(section):
    if section not in ITEM_INPUTS:
        abort(404)
    values = ITEM_INPUTS[section]().load(request.get_json(silent=True) or {})
    profile = profile_service.save_item(g.candidate, profile_of(g.candidate), section, values)
    return _profile_response(profile), 201


@profile_bp.put("/profile/<section>/<int:item_id>")
@candidate_required
def update_item(section, item_id):
    if section not in ITEM_INPUTS:
        abort(404)
    values = ITEM_INPUTS[section]().load(request.get_json(silent=True) or {})
    profile = profile_service.save_item(
        g.candidate, profile_of(g.candidate), section, values, item_id
    )
    return _profile_response(profile)


@profile_bp.delete("/profile/<section>/<int:item_id>")
@candidate_required
def delete_item(section, item_id):
    if section not in ITEM_INPUTS:
        abort(404)
    profile = profile_service.delete_item(g.candidate, profile_of(g.candidate), section, item_id)
    return _profile_response(profile)
