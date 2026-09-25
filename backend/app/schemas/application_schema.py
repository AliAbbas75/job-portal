"""Application JSON (T-062, T-064, T-065). Shapes match frontend/src/api/mocks/applicationsMock.js.

The public id of an application is its number (PR-2026-000123).
"""

import re

from marshmallow import EXCLUDE, fields, pre_load, validate

from app.extensions import ma
from app.models.constants import next_application_statuses
from app.models.enums import ApplicationStatus


class SubmitInput(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    declaration_accepted = fields.Bool(data_key="declarationAccepted", load_default=False)
    apply_pass = fields.Str(data_key="applyPass", load_default=None, allow_none=True)


class ApplyCodeRequestInput(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    cnic = fields.Str(required=True, validate=validate.Length(max=15))
    mobile = fields.Str(required=True, validate=validate.Length(max=13))

    @pre_load
    def normalize_mobile(self, data, **kwargs):
        if isinstance(data, dict) and isinstance(data.get("mobile"), str):
            data = {**data, "mobile": re.sub(r"[\s-]", "", data["mobile"])}
        return data


class ApplyCodeVerifyInput(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    otp = fields.Str(required=True, validate=validate.Regexp(r"^\d{6}$", error="Enter 6 digits."))


class StatusChangeInput(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    status = fields.Str(
        required=True, validate=validate.OneOf([s.value for s in ApplicationStatus])
    )
    note = fields.Str(load_default=None, allow_none=True, validate=validate.Length(max=1000))


class StatusListArgs(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    status = fields.Str(load_default="", validate=validate.Length(max=30))


def _events(application):
    return [
        {"status": e.status.value, "at": e.created_at.isoformat(), "note": e.note}
        for e in application.events
    ]


def _job_summary(application):
    job = application.job
    return {
        "id": job.id,
        "title": job.title,
        "department": job.department_code,
        "departmentName": job.department.name,
        "bps": job.bps,
        "location": job.location,
        "closingDate": job.closing_date.isoformat(),
    }


class ApplicationSchema(ma.Schema):
    id = fields.Str(attribute="application_no")
    job_id = fields.Int(attribute="job_id", data_key="jobId")
    submitted_at = fields.DateTime(data_key="submittedAt")
    status = fields.Function(lambda a: a.status.value)
    events = fields.Function(_events)
    job = fields.Function(_job_summary)


class StaffApplicationSchema(ApplicationSchema):
    """For staff: adds the candidate's details as frozen at submission."""

    candidate = fields.Function(
        lambda a: {
            "name": a.snapshot.profile_data["personal"]["fullName"],
            "cnic": a.snapshot.profile_data["personal"]["cnic"],
            "domicile": a.snapshot.profile_data["domicile"]["province"],
            "age": a.snapshot.profile_data.get("ageOnReferenceDate"),
        }
    )
    snapshot = fields.Function(lambda a: a.snapshot.profile_data)
    next_statuses = fields.Method("dump_next", data_key="nextStatuses")

    def dump_next(self, application):
        return [s.value for s in next_application_statuses(application.status)]
