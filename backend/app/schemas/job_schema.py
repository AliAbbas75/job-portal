"""Job search arguments and job JSON. Shapes match frontend/src/api/mocks/jobsMock.js."""

from marshmallow import EXCLUDE, fields, validate

from app.extensions import ma
from app.models.constants import BPS_RANGES, CLOSING_WINDOWS

EMPTY_OR = lambda *choices: validate.OneOf(["", *choices])  # noqa: E731


class JobSearchArgsSchema(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    q = fields.Str(load_default="", validate=validate.Length(max=100))
    sort = fields.Str(load_default="", validate=EMPTY_OR("newest", "closing"))
    bps = fields.Str(load_default="", validate=EMPTY_OR(*[r[0] for r in BPS_RANGES]))
    scale = fields.Int(load_default=None, allow_none=True, validate=validate.Range(1, 22))
    department = fields.Str(load_default="", validate=validate.Length(max=10))
    category = fields.Str(load_default="", validate=validate.Length(max=20))
    employment_type = fields.Str(
        data_key="employmentType", load_default="", validate=EMPTY_OR("permanent", "contract")
    )
    location = fields.Str(load_default="", validate=validate.Length(max=80))
    qualification = fields.Str(load_default="", validate=validate.Length(max=20))
    closing = fields.Str(load_default="", validate=EMPTY_OR(*CLOSING_WINDOWS))
    page = fields.Int(load_default=1, validate=validate.Range(min=1))
    page_size = fields.Int(data_key="pageSize", load_default=10, validate=validate.Range(1, 50))


class JobSchema(ma.Schema):
    id = fields.Int()
    title = fields.Str()
    department = fields.Str(attribute="department_code")
    department_name = fields.Function(lambda job: job.department.name, data_key="departmentName")
    category = fields.Str(attribute="category_code", allow_none=True)
    category_name = fields.Function(
        lambda job: job.category.name if job.category else None, data_key="categoryName"
    )
    bps = fields.Int()
    location = fields.Str()
    employment_type = fields.Function(
        lambda job: job.employment_type.value, data_key="employmentType"
    )
    vacancies = fields.Int()
    advertisement_no = fields.Str(data_key="advertisementNo")
    summary = fields.Str()
    description = fields.Str()
    status = fields.Function(lambda job: "published" if job.is_open() else "closed")
    published_at = fields.Function(
        lambda job: (job.published_at or job.opening_date).isoformat(), data_key="publishedAt"
    )
    opening_date = fields.DateTime(data_key="openingDate")
    closing_date = fields.DateTime(data_key="closingDate")
    fee = fields.Function(lambda job: float(job.fee_amount))
    requirements = fields.Method("dump_requirements")
    quotas = fields.Function(
        lambda job: [{"category": q.category.value, "seats": q.seats} for q in job.quotas]
    )

    def dump_requirements(self, job):
        req = job.requirement
        return {
            "minQualification": req.min_qualification_code,
            "minMarksPercent": float(req.min_marks_percent) if req.min_marks_percent else None,
            "experienceYears": float(req.min_experience_years),
            "ageMin": req.age_min,
            "ageMax": req.age_max,
            "domicileProvinces": sorted(p.code for p in job.domicile_provinces),
            "documents": sorted(d.code for d in job.required_documents),
        }


class JobStatsSchema(ma.Schema):
    open_jobs = fields.Int(data_key="openJobs")
    vacancies = fields.Int()
    departments = fields.Int()
    locations = fields.List(fields.Str())
    by_category = fields.List(fields.Dict(), data_key="byCategory")
    by_bps = fields.List(fields.Dict(), data_key="byBps")
