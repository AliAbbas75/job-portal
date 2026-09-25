"""Flask CLI commands: `flask seed` (reference data), `flask seed-demo` (dev sample jobs) and
`flask create-staff` (staff accounts; there is no admin screen for this yet) and
`flask close-jobs` (run on a schedule)."""

import click
from flask import current_app

from app.models.enums import StaffRole
from app.services.admin_job_service import close_expired_jobs
from app.services.demo_seed_service import seed_demo_jobs
from app.services.reference_seed_service import seed_reference_data
from app.services.staff_service import create_staff
from app.utils.errors import AppError


def register_commands(app):
    @app.cli.command("seed")
    def seed():
        """Load or refresh reference data (departments, provinces, qualifications, ...)."""
        counts = seed_reference_data()
        for table, count in counts.items():
            click.echo(f"{table}: {count}")

    @app.cli.command("seed-demo")
    def seed_demo():
        """Add sample published jobs for local development. Refuses to run in other environments."""
        if current_app.config.get("ENV_NAME") != "development":
            raise click.ClickException(
                "seed-demo only runs in development (FLASK_ENV=development)."
            )
        click.echo(f"demo jobs added: {seed_demo_jobs()}")

    @app.cli.command("close-jobs")
    def close_jobs():
        """Close published jobs whose closing date has passed. Run it every few minutes (cron)."""
        click.echo(f"jobs closed: {close_expired_jobs()}")

    @app.cli.command("create-staff")
    @click.option("--name", prompt=True)
    @click.option("--email", prompt=True)
    @click.option("--role", prompt=True, type=click.Choice([r.value for r in StaffRole]))
    @click.option("--department", default=None, help="Department code, e.g. TRF.")
    @click.password_option(help="At least 12 characters. Prompted if omitted.")
    def create_staff_command(name, email, role, department, password):
        """Create a staff account (job creator, approver or admin)."""
        try:
            user = create_staff(name, email, password, StaffRole(role), department)
        except AppError as error:
            raise click.ClickException(error.message) from None
        click.echo(f"created {user.role.value} {user.email} (id {user.id})")
