"""Flask CLI commands, e.g. `flask seed`."""

import click

from app.services.reference_seed_service import seed_reference_data


def register_commands(app):
    @app.cli.command("seed")
    def seed():
        """Load or refresh reference data (departments, provinces, qualifications, ...)."""
        counts = seed_reference_data()
        for table, count in counts.items():
            click.echo(f"{table}: {count}")
