"""Configuration classes. Every secret and connection string comes from the environment."""

import os
from datetime import timedelta

from dotenv import load_dotenv

load_dotenv()

MAX_UPLOAD_BYTES = 2 * 1024 * 1024


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=8)
    SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL")
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}
    UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
    MAX_UPLOAD_BYTES = MAX_UPLOAD_BYTES
    # Reject request bodies well above the largest allowed file before they reach a view.
    MAX_CONTENT_LENGTH = MAX_UPLOAD_BYTES + 512 * 1024

    # OTP (T-021): a code lives 5 minutes; resend after 60 s; at most 5 codes per CNIC or
    # mobile number per hour; 5 wrong guesses end a code.
    OTP_TTL_SECONDS = 300
    OTP_RESEND_SECONDS = 60
    OTP_MAX_SENDS_PER_HOUR = 5
    OTP_MAX_ATTEMPTS = 5
    # "console" logs the SMS (development), "memory" keeps it for tests. No real gateway yet:
    # anything else makes sending fail with sms_unavailable.
    SMS_BACKEND = os.environ.get("SMS_BACKEND")
    # Cloudflare Turnstile secret. Without it the CAPTCHA check is skipped, except in production.
    CAPTCHA_SECRET_KEY = os.environ.get("CAPTCHA_SECRET_KEY")

    # Job approval (T-031): how many different approvers must approve a job before it's locked.
    JOB_APPROVALS_REQUIRED = int(os.environ.get("JOB_APPROVALS_REQUIRED", "1"))


class DevelopmentConfig(Config):
    ENV_NAME = "development"
    DEBUG = True
    SMS_BACKEND = os.environ.get("SMS_BACKEND", "console")


class TestingConfig(Config):
    ENV_NAME = "testing"
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL")
    SECRET_KEY = "test-secret-key-at-least-32-bytes-long"
    JWT_SECRET_KEY = "test-jwt-secret-at-least-32-bytes-long"
    SMS_BACKEND = "memory"
    CAPTCHA_SECRET_KEY = None


class ProductionConfig(Config):
    ENV_NAME = "production"


CONFIGS = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}


def get_config(name=None):
    name = name or os.environ.get("FLASK_ENV", "production")
    config = CONFIGS[name]
    missing = [
        key
        for key in ("SECRET_KEY", "JWT_SECRET_KEY", "SQLALCHEMY_DATABASE_URI")
        if not getattr(config, key)
    ]
    if missing:
        raise RuntimeError(f"Missing configuration for {name}: {', '.join(missing)}")
    return config
