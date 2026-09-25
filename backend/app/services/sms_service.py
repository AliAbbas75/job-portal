"""Outgoing SMS (T-021 stub). A real gateway is plugged in here when one is chosen."""

from flask import current_app

from app.utils.errors import AppError


def _masked(mobile):
    return f"{mobile[:4]}*****{mobile[-2:]}"


def send(mobile, message):
    backend = current_app.config.get("SMS_BACKEND")
    if backend == "console":
        # Development only: shows the code in the `flask run` output. Number masked.
        current_app.logger.warning("SMS to %s: %s", _masked(mobile), message)
    elif backend == "memory":
        current_app.extensions.setdefault("sms_outbox", []).append((mobile, message))
    else:
        raise AppError("sms_unavailable", "We can't send SMS right now. Try again later.", 503)
