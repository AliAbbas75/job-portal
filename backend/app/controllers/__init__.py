"""CONTROLLER layer: public/candidate Flask blueprints, one module per resource (e.g.
job_controller.py). Keep thin: parse request, call a service, return a schema-serialized
response.
"""


def register_blueprints(app):
    from app.controllers.health_controller import health_bp

    app.register_blueprint(health_bp, url_prefix="/api")
