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
    karachi = db.session.query(District).filter_by(name="Karachi").one()
    assert karachi.province.code == "SD"


def test_qualification_ranks_order_levels():
    ranks = {q.code: q.rank for q in db.session.query(QualificationLevel)}
    assert ranks["matric"] < ranks["intermediate"] < ranks["bachelor16"] < ranks["phd"]
