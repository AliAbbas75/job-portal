from app.extensions import db
from app.models import Job
from app.services.demo_seed_service import DEMO_JOBS, seed_demo_jobs


def test_demo_jobs_are_public_and_seed_is_idempotent(client):
    assert seed_demo_jobs() == len(DEMO_JOBS)
    assert seed_demo_jobs() == 0
    assert db.session.query(Job).count() == len(DEMO_JOBS)
    assert client.get("/api/jobs").get_json()["total"] == len(DEMO_JOBS)
