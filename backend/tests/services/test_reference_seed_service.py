from sqlalchemy import func

from app.extensions import db
from app.models import District, QualificationLevel
from app.services.reference_seed_service import seed_reference_data


def test_seed_is_idempotent():
    first = seed_reference_data()
    second = seed_reference_data()
    assert first == second
    assert first["departments"] == 9
    assert first["document_types"] == 16


def test_seed_links_districts_to_provinces():
    sukkur = db.session.query(District).filter_by(name="Sukkur").one()
    assert sukkur.province.code == "SD"


def test_seed_has_every_district_of_each_province():
    counts = dict(
        db.session.query(District.province_code, func.count()).group_by(District.province_code)
    )
    assert counts == {"PB": 41, "SD": 30, "KP": 40, "BA": 42, "IS": 1, "GB": 10, "AJK": 10}


def test_seed_retires_old_districts_unless_a_profile_uses_them(make_candidate):
    unused = District(province_code="SD", name="Old Unused District")
    used = District(province_code="SD", name="Old Used District")
    db.session.add_all([unused, used])
    db.session.flush()
    make_candidate().profile.domicile_district_id = used.id
    db.session.commit()

    seed_reference_data()

    names = {d.name for d in db.session.query(District).filter_by(province_code="SD")}
    assert "Old Unused District" not in names
    assert "Old Used District" in names


def test_qualification_ranks_order_levels():
    ranks = {q.code: q.rank for q in db.session.query(QualificationLevel)}
    assert ranks["matric"] < ranks["intermediate"] < ranks["bachelor16"] < ranks["phd"]
