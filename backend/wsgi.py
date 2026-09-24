"""WSGI entry point: `flask run` (via FLASK_APP=wsgi.py) or a WSGI server in production."""

from app import create_app

app = create_app()
