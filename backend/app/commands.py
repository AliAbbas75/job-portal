"""Flask CLI commands: `flask seed` (reference data) and `flask seed-demo` (dev sample jobs)."""

import click
from flask import current_app

from app.services.demo_seed_service import seed_demo_jobs
from app.services.reference_seed_service import seed_reference_data


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
