from flask import Blueprint

from app.services.health_service import database_is_up

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def health():
    database_ok = database_is_up()
    body = {"status": "ok" if database_ok else "degraded", "database": database_ok}
    return body, 200 if database_ok else 503
