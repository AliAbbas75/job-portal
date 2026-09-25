"""Reference lists JSON. Shape matches frontend/src/api/mocks/referenceData.js."""

from marshmallow import fields

from app.extensions import ma


class CodeNameSchema(ma.Schema):
    code = fields.Str()
    name = fields.Str()


class ProvinceSchema(CodeNameSchema):
    districts = fields.Function(lambda province: [d.name for d in province.districts])


class QualificationLevelSchema(CodeNameSchema):
    rank = fields.Int()


def dump_reference(data):
    pairs = lambda rows: [{"code": code, "name": name} for code, name in rows]  # noqa: E731
    return {
        "departments": CodeNameSchema(many=True).dump(data["departments"]),
        "provinces": ProvinceSchema(many=True).dump(data["provinces"]),
        "qualificationLevels": QualificationLevelSchema(many=True).dump(
            data["qualification_levels"]
        ),
        "documentTypes": CodeNameSchema(many=True).dump(data["document_types"]),
        "jobCategories": CodeNameSchema(many=True).dump(data["job_categories"]),
        "employmentTypes": pairs(data["employment_types"]),
        "bpsRanges": [
            {"code": code, "name": name, "min": low, "max": high}
            for code, name, low, high in data["bps_ranges"]
        ],
        "genders": pairs(data["genders"]),
        "quotaClaims": pairs(data["quota_claims"]),
        "ageRelaxations": pairs(data["age_relaxations"]),
        "tradeCertificates": pairs(data["trade_certificates"]),
    }
