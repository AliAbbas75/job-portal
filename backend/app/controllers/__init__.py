"""CONTROLLER layer: public/candidate Flask blueprints, one module per resource (e.g.
job_controller.py). Keep thin: parse request, call a service, return a schema-serialized
response. Staff blueprints live in admin/ and are served under /api/admin.
"""


def register_blueprints(app):
    # Keep imports and registrations in alphabetical order (fewer merge conflicts).
    from app.controllers.admin.auth_controller import admin_auth_bp
    from app.controllers.admin.job_controller import admin_job_bp
    from app.controllers.auth_controller import auth_bp
    from app.controllers.document_controller import document_bp
    from app.controllers.health_controller import health_bp
    from app.controllers.job_controller import job_bp
    from app.controllers.profile_controller import profile_bp
    from app.controllers.reference_controller import reference_bp

    for blueprint in (auth_bp, document_bp, health_bp, job_bp, profile_bp, reference_bp):
        app.register_blueprint(blueprint, url_prefix="/api")

    for blueprint in (admin_auth_bp, admin_job_bp):
        app.register_blueprint(blueprint, url_prefix="/api/admin")
