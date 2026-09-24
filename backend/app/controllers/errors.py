"""App-wide JSON error responses: { "code": ..., "message": ... }.

The frontend maps `code` to a translated message (frontend/src/i18n/en.json, `errors.<code>`).
"""

from flask import jsonify
from werkzeug.exceptions import HTTPException

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


def register_error_handlers(app):
    @app.errorhandler(AppError)
    def handle_app_error(error):
        return jsonify(code=error.code, message=error.message), error.status

    @app.errorhandler(HTTPException)
    def handle_http_error(error):
        code = HTTP_CODES.get(error.code, "http_error")
        return jsonify(code=code, message=error.description), error.code

    @app.errorhandler(Exception)
    def handle_unexpected(error):
        app.logger.exception("Unhandled error")
        return jsonify(code="server_error", message="Something went wrong."), 500
