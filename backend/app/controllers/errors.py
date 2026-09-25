"""App-wide JSON error responses: { "code": ..., "message": ... }.

The frontend maps `code` to a translated message (frontend/src/i18n/en/errors.json).
Validation errors also include `fields`: { fieldName: [messages] }.
"""

from flask import jsonify
from marshmallow import ValidationError
from werkzeug.exceptions import HTTPException

from app.extensions import jwt
from app.utils.errors import AppError

HTTP_CODES = {
    400: "bad_request",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    405: "method_not_allowed",
    409: "conflict",
    413: "file_too_large",
    422: "validation_error",
    429: "too_many_requests",
}


def _unauthorized(message="Please log in."):
    return jsonify(code="unauthorized", message=message), 401


def register_error_handlers(app):
    @app.errorhandler(AppError)
    def handle_app_error(error):
        return jsonify(code=error.code, message=error.message), error.status

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        fields = error.messages if isinstance(error.messages, dict) else {"_schema": error.messages}
        return (
            jsonify(
                code="validation_error", message="Check the highlighted fields.", fields=fields
            ),
            422,
        )

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        code = HTTP_CODES.get(error.code, "http_error")
        return jsonify(code=code, message=error.description), error.code

    @app.errorhandler(Exception)
    def handle_unexpected(error):
        app.logger.exception("Unhandled error")
        return jsonify(code="server_error", message="Something went wrong."), 500

    # Missing, malformed or expired login tokens.
    jwt.unauthorized_loader(lambda reason: _unauthorized())
    jwt.invalid_token_loader(lambda reason: _unauthorized())
    jwt.expired_token_loader(lambda header, payload: _unauthorized("Your session has ended."))
    jwt.revoked_token_loader(lambda header, payload: _unauthorized("Your session has ended."))
