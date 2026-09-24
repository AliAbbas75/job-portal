"""Profile JSON and per-section input validation.

Output shape matches frontend/src/api/mocks/profileMock.js.

Input schemas load into model attribute names, so services can apply them directly.
Unknown fields (e.g. the read-only cnic/mobile the form sends back) are ignored.
"""

from datetime import date

from marshmallow import EXCLUDE, ValidationError, fields, pre_load, validate, validates_schema

from app.extensions import ma
from app.models.enums import Gender

TEXT = validate.Length(min=1, max=120)


class _Input(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    @pre_load
    def blank_strings_to_none(self, data, **kwargs):
        """HTML forms send "" for empty fields; treat that as missing."""
        if isinstance(data, dict):
            return {k: (None if v == "" else v) for k, v in data.items()}
        return data


class PersonalInput(_Input):
    full_name = fields.Str(data_key="fullName", required=True, validate=TEXT)
    father_name = fields.Str(data_key="fatherName", required=True, validate=TEXT)
    dob = fields.Date(required=True)
    gender = fields.Str(required=True, validate=validate.OneOf([g.value for g in Gender]))
    nationality = fields.Str(load_default="Pakistani", validate=validate.Length(max=60))

    @validates_schema
    def dob_not_in_future(self, data, **kwargs):
        if data.get("dob") and data["dob"] > date.today():
            raise ValidationError("Date of birth can't be in the future.", "dob")


class ContactInput(_Input):
    email = fields.Email(load_default=None, allow_none=True)
    current_address = fields.Str(
        data_key="currentAddress", required=True, validate=validate.Length(1, 500)
    )
    permanent_address = fields.Str(
        data_key="permanentAddress", required=True, validate=validate.Length(1, 500)
    )


class DomicileInput(_Input):
    province = fields.Str(required=True, validate=validate.Length(max=10))
    district = fields.Str(required=True, validate=validate.Length(max=80))


class AdditionalInput(_Input):
    is_government_employee = fields.Bool(data_key="governmentEmployee", load_default=False)
    has_disability = fields.Bool(data_key="disability", load_default=False)
    is_minority = fields.Bool(data_key="minority", load_default=False)


SkillsInput = fields.List(fields.Str(validate=TEXT), validate=validate.Length(max=30))


class EducationInput(_Input):
    qualification_level_code = fields.Str(data_key="level", required=True)
    discipline = fields.Str(required=True, validate=TEXT)
    institution = fields.Str(required=True, validate=validate.Length(1, 160))
    passing_year = fields.Int(
        data_key="year", required=True, validate=validate.Range(1950, date.today().year)
    )
    marks_percent = fields.Decimal(
        data_key="marksPercent", required=True, places=2, validate=validate.Range(0, 100)
    )


class ExperienceInput(_Input):
    organization = fields.Str(required=True, validate=validate.Length(1, 160))
    designation = fields.Str(required=True, validate=TEXT)
    start_date = fields.Date(data_key="startDate", required=True)
    end_date = fields.Date(data_key="endDate", load_default=None, allow_none=True)
    is_current = fields.Bool(data_key="current", load_default=False)

    @validates_schema
    def dates_consistent(self, data, **kwargs):
        if data.get("is_current"):
            data["end_date"] = None
        elif not data.get("end_date"):
            raise ValidationError("End date is required unless you still work here.", "endDate")
        elif data["end_date"] < data["start_date"]:
            raise ValidationError("End date must be after the start date.", "endDate")


SECTION_INPUTS = {
    "personal": PersonalInput,
    "contact": ContactInput,
    "domicile": DomicileInput,
    "additional": AdditionalInput,
}
ITEM_INPUTS = {"education": EducationInput, "experience": ExperienceInput}


class EducationSchema(ma.Schema):
    id = fields.Int()
    level = fields.Str(attribute="qualification_level_code")
    discipline = fields.Str()
    institution = fields.Str()
    year = fields.Int(attribute="passing_year")
    marks_percent = fields.Float(attribute="marks_percent", data_key="marksPercent")


class ExperienceSchema(ma.Schema):
    id = fields.Int()
    organization = fields.Str()
    designation = fields.Str()
    start_date = fields.Date(data_key="startDate")
    end_date = fields.Date(data_key="endDate", allow_none=True)
    current = fields.Bool(attribute="is_current")


class ProfileSchema(ma.Schema):
    personal = fields.Function(
        lambda p: {
            "fullName": p.full_name or "",
            "fatherName": p.father_name or "",
            "cnic": p.account.cnic,
            "dob": p.dob.isoformat() if p.dob else "",
            "gender": p.gender.value if p.gender else "",
            "nationality": p.nationality,
        }
    )
    contact = fields.Function(
        lambda p: {
            "mobile": p.account.mobile,
            "email": p.email or "",
            "currentAddress": p.current_address or "",
            "permanentAddress": p.permanent_address or "",
        }
    )
    domicile = fields.Function(
        lambda p: {
            "province": p.domicile_province_code or "",
            "district": p.domicile_district.name if p.domicile_district else "",
        }
    )
    education = fields.List(fields.Nested(EducationSchema))
    experience = fields.List(fields.Nested(ExperienceSchema))
    skills = fields.List(fields.Str())
    additional = fields.Function(
        lambda p: {
            "governmentEmployee": p.is_government_employee,
            "disability": p.has_disability,
            "minority": p.is_minority,
        }
    )
