"""Application package. create_app() is the Flask app factory. See docs/PROJECT_STRUCTURE.md."""

from pathlib import Path

from flask import Flask

from app.config import get_config
from app.extensions import db, jwt, ma, migrate

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"


def create_app(config_name=None):
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))

    db.init_app(app)
    migrate.init_app(app, db, directory=str(MIGRATIONS_DIR))
    ma.init_app(app)
    jwt.init_app(app)

    from app import models  # noqa: F401  (registers every model with SQLAlchemy/Alembic)
    from app.commands import register_commands
    from app.controllers import register_blueprints
    from app.controllers.errors import register_error_handlers

    register_blueprints(app)
    register_error_handlers(app)
    register_commands(app)
    return app
