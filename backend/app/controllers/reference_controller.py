from flask import Blueprint

from app.schemas.reference_schema import dump_reference
from app.services.reference_service import reference_data

reference_bp = Blueprint("reference", __name__)


@reference_bp.get("/reference")
def get_reference():
    return dump_reference(reference_data())
