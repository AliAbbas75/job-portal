"""Staff login input and the staff session JSON (T-023)."""

from marshmallow import EXCLUDE, fields, validate

from app.extensions import ma


class StaffLoginInput(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=1, max=200))


class PasswordChangeInput(ma.Schema):
    class Meta:
        unknown = EXCLUDE

    current_password = fields.Str(
        data_key="currentPassword", required=True, validate=validate.Length(1, 200)
    )
    new_password = fields.Str(
        data_key="newPassword", required=True, validate=validate.Length(1, 200)
    )


class StaffSchema(ma.Schema):
    id = fields.Function(lambda user: str(user.id))
    name = fields.Str()
    email = fields.Str()
    role = fields.Function(lambda user: user.role.value)
    department = fields.Str(attribute="department_code", allow_none=True)
