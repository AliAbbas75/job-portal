"""Document vault JSON. Shape matches frontend/src/api/mocks/documentsMock.js."""

from marshmallow import fields

from app.extensions import ma


class DocumentSchema(ma.Schema):
    id = fields.Int()
    type = fields.Str(attribute="document_type_code")
    file_name = fields.Str(attribute="original_filename", data_key="fileName")
    size = fields.Int(attribute="size_bytes")
    uploaded_at = fields.DateTime(data_key="uploadedAt")
