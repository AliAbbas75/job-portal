"""Organisation profile input (admin panel "Employer Profile"). Keys are the JSON names."""

from marshmallow import EXCLUDE, Schema, fields, validate

TEXT = validate.Length(max=200)


class OrganizationInput(Schema):
    class Meta:
        unknown = EXCLUDE

    departmentName = fields.Str(required=True, validate=validate.Length(1, 200))  # noqa: N815
    cellId = fields.Str(load_default="", validate=TEXT)  # noqa: N815
    address = fields.Str(load_default="", validate=TEXT)
    website = fields.Str(load_default="", validate=TEXT)
    officerName = fields.Str(load_default="", validate=TEXT)  # noqa: N815
    email = fields.Str(load_default="", validate=TEXT)
    phone = fields.Str(load_default="", validate=validate.Length(max=40))
    policyNotes = fields.Str(load_default="", validate=validate.Length(max=4000))  # noqa: N815
