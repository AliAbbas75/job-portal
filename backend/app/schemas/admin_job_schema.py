"""Staff-side job input and JSON (T-030 to T-032).

The output extends the public JobSchema with the real workflow status and approval history.
Shapes match frontend/src/api/mocks/adminJobsMock.js.
"""

from marshmallow import EXCLUDE, ValidationError, fields, validate, validates_schema

from app.extensions import ma
from app.models.enums import ApprovalAction, EmploymentType, QuotaCategory
from app.schemas.job_schema import JobSchema

CODE = validate.Length(min=1, max=40)


class _Input(ma.Schema):
    class Meta:
        unknown = EXCLUDE


class RequirementsInput(_Input):
    min_qualification = fields.Str(data_key="minQualification", required=True, validate=CODE)
    min_marks_percent = fields.Decimal(
        data_key="minMarksPercent",
        load_default=None,
        allow_none=True,
        validate=validate.Range(0, 100),
    )
    experience_years = fields.Decimal(
        data_key="experienceYears", load_default=0, validate=validate.Range(0, 50)
    )
    age_min = fields.Int(data_key="ageMin", required=True, validate=validate.Range(15, 70))
    age_max = fields.Int(data_key="ageMax", required=True, validate=validate.Range(15, 70))
    domicile_provinces = fields.List(
        fields.Str(validate=CODE), data_key="domicileProvinces", load_default=list
    )
    documents = fields.List(fields.Str(validate=CODE), load_default=list)

    @validates_schema
    def age_range(self, data, **kwargs):
        age_min, age_max = data.get("age_min"), data.get("age_max")
        if age_min is not None and age_max is not None and age_max < age_min:
            raise ValidationError("Maximum age must be at least the minimum age.", "ageMax")


class QuotaInput(_Input):
    category = fields.Str(required=True, validate=validate.OneOf([c.value for c in QuotaCategory]))
    seats = fields.Int(required=True, validate=validate.Range(min=1))


class JobInput(_Input):
    title = fields.Str(required=True, validate=validate.Length(1, 160))
    department = fields.Str(required=True, validate=CODE)
    bps = fields.Int(required=True, validate=validate.Range(1, 22))
    location = fields.Str(required=True, validate=validate.Length(1, 80))
    employment_type = fields.Str(
        data_key="employmentType",
        required=True,
        validate=validate.OneOf([t.value for t in EmploymentType]),
    )
    vacancies = fields.Int(required=True, validate=validate.Range(min=1))
    summary = fields.Str(required=True, validate=validate.Length(1, 300))
    description = fields.Str(required=True, validate=validate.Length(1, 20000))
    requisition_ref = fields.Str(
        data_key="requisitionRef",
        load_default=None,
        allow_none=True,
        validate=validate.Length(max=60),
    )
    opening_date = fields.AwareDateTime(data_key="openingDate", required=True)
    closing_date = fields.AwareDateTime(data_key="closingDate", required=True)
    age_cutoff_date = fields.Date(data_key="ageCutoffDate", load_default=None, allow_none=True)
    fee = fields.Decimal(load_default=0, validate=validate.Range(min=0, max=100000))
    requirements = fields.Nested(RequirementsInput, required=True)
    quotas = fields.List(fields.Nested(QuotaInput), required=True, validate=validate.Length(min=1))

    @validates_schema
    def dates_and_quotas(self, data, **kwargs):
        errors = {}
        opening, closing = data.get("opening_date"), data.get("closing_date")
        if opening and closing and closing <= opening:
            errors["closingDate"] = ["Closing date must be after the opening date."]
        quotas = data.get("quotas") or []
        categories = [q["category"] for q in quotas]
        if len(categories) != len(set(categories)):
            errors["quotas"] = ["Each quota category can appear only once."]
        elif (
            quotas
            and data.get("vacancies")
            and sum(q["seats"] for q in quotas) != data["vacancies"]
        ):
            errors["quotas"] = ["Quota seats must add up to the number of vacancies."]
        if errors:
            raise ValidationError(errors)


class DecisionInput(_Input):
    action = fields.Str(required=True, validate=validate.OneOf([a.value for a in ApprovalAction]))
    comments = fields.Str(load_default=None, allow_none=True, validate=validate.Length(max=2000))


class PublishInput(_Input):
    advertisement_no = fields.Str(
        data_key="advertisementNo",
        load_default=None,
        allow_none=True,
        validate=validate.Length(max=40),
    )


class AdminJobListArgs(_Input):
    status = fields.Str(load_default="", validate=validate.Length(max=30))


class AdminJobSchema(JobSchema):
    status = fields.Function(lambda job: job.status.value)
    live = fields.Function(lambda job: job.is_open())
    published_at = fields.DateTime(data_key="publishedAt", allow_none=True)
    approved_at = fields.DateTime(data_key="approvedAt", allow_none=True)
    requisition_ref = fields.Str(data_key="requisitionRef", allow_none=True)
    age_cutoff_date = fields.Date(data_key="ageCutoffDate", allow_none=True)
    created_by = fields.Function(
        lambda job: str(job.created_by_id) if job.created_by_id else None, data_key="createdBy"
    )
    approvals = fields.Function(
        lambda job: [
            {
                "approver": record.approver.name,
                "approverId": str(record.approver_id),
                "action": record.action.value,
                "comments": record.comments,
                "at": record.created_at.isoformat(),
            }
            for record in job.approvals
        ]
    )
