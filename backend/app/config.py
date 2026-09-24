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


class DevelopmentConfig(Config):
    ENV_NAME = "development"
    DEBUG = True


class TestingConfig(Config):
    ENV_NAME = "testing"
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get("TEST_DATABASE_URL")
    SECRET_KEY = "test-secret-key-at-least-32-bytes-long"
    JWT_SECRET_KEY = "test-jwt-secret-at-least-32-bytes-long"


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
