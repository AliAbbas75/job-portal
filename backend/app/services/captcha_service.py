"""Server-side CAPTCHA check (Cloudflare Turnstile) for candidate signup (T-020)."""

import json
from urllib.error import URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from flask import current_app

from app.utils.errors import AppError

VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"


def verify(token, remote_ip=None):
    """Raises captcha_failed unless the token is valid. Skipped when no secret is configured,
    except in production, where a missing secret is a configuration error."""
    secret = current_app.config.get("CAPTCHA_SECRET_KEY")
    if not secret:
        if current_app.config.get("ENV_NAME") == "production":
            raise AppError("captcha_unavailable", "CAPTCHA isn't configured.", 503)
        return
    if not token:
        raise AppError("captcha_failed", "Please complete the CAPTCHA.")
    data = {"secret": secret, "response": token}
    if remote_ip:
        data["remoteip"] = remote_ip
    try:
        with urlopen(VERIFY_URL, data=urlencode(data).encode(), timeout=5) as response:
            result = json.load(response)
    except (URLError, TimeoutError, ValueError) as error:
        current_app.logger.warning("CAPTCHA check failed to run: %s", error)
        raise AppError(
            "captcha_unavailable", "Couldn't check the CAPTCHA. Try again.", 503
        ) from error
    if not result.get("success"):
        raise AppError("captcha_failed", "Please complete the CAPTCHA.")
