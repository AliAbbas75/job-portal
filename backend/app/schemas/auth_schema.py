"""Candidate signup/login input and the session JSON (T-020, T-022).

Shapes match frontend/src/api/mocks/authMock.js.
"""

import re

from marshmallow import EXCLUDE, fields, pre_load, validate

from app.extensions import ma

CNIC = validate.Regexp(r"^\d{5}-\d{7}-\d$", error="Enter the CNIC as 12345-1234567-1.")
MOBILE = validate.Regexp(r"^03\d{9}$", error="Enter a mobile number like 0300-1234567.")


class OtpRequestInput(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    cnic = fields.Str(required=True, validate=CNIC)
    mobile = fields.Str(required=True, validate=MOBILE)
    captcha_token = fields.Str(data_key="captchaToken", load_default=None, allow_none=True)

    @pre_load
    def normalize_mobile(self, data, **kwargs):
        """Accept 0300-1234567 or 0300 1234567; store 03001234567."""
        if isinstance(data, dict) and isinstance(data.get("mobile"), str):
            data = {**data, "mobile": re.sub(r"[\s-]", "", data["mobile"])}
        return data


class OtpVerifyInput(OtpRequestInput):
    otp = fields.Str(required=True, validate=validate.Regexp(r"^\d{6}$", error="Enter 6 digits."))


class CandidateSessionSchema(ma.Schema):
    id = fields.Function(lambda account: str(account.id))
    cnic = fields.Str()
    name = fields.Function(lambda account: (account.profile and account.profile.full_name) or "")
