from datetime import UTC, datetime, timedelta

import pytest

from app.extensions import db
from app.models import AuditLog
from app.models.enums import StaffRole


def job_payload(**overrides):
    now = datetime.now(UTC)
    payload = {
        "title": "Ticket Checker",
        "department": "COM",
        "bps": 7,
        "location": "Karachi",
        "employmentType": "permanent",
        "vacancies": 10,
        "summary": "Check tickets on board and at stations.",
        "description": "Full description.",
        "openingDate": (now - timedelta(days=1)).isoformat(),
        "closingDate": (now + timedelta(days=20)).isoformat(),
        "fee": 0,
        "requirements": {
            "minQualification": "matric",
            "minMarksPercent": 45,
            "experienceYears": 0,
            "ageMin": 18,
            "ageMax": 25,
            "domicileProvinces": ["SD"],
            "documents": ["cnic_copy", "matric_certificate"],
        },
        "quotas": [
            {"category": "open_merit", "seats": 8},
            {"category": "women", "seats": 2},
        ],
    }
    payload.update(overrides)
    return payload


@pytest.fixture
def staff(make_staff, staff_headers):
    """Headers for one staff user per role."""
    return {
        role: staff_headers(make_staff(role=role, email=f"{role.value}@example.com"))
        for role in StaffRole
    }


def _create(client, headers, **overrides):
    response = client.post("/api/admin/jobs", json=job_payload(**overrides), headers=headers)
    assert response.status_code == 201, response.get_json()
    return response.get_json()


def test_full_workflow_draft_to_public(client, staff):
    creator, approver, admin = (staff[r] for r in StaffRole)
    job = _create(client, creator)
    assert job["status"] == "draft" and job["live"] is False
    assert job["requirements"]["domicileProvinces"] == ["SD"]
    assert job["quotas"] == [
        {"category": "open_merit", "seats": 8},
        {"category": "women", "seats": 2},
    ]
    assert client.get("/api/jobs").get_json()["total"] == 0

    url = f"/api/admin/jobs/{job['id']}"
    assert client.post(f"{url}/submit", headers=creator).get_json()["status"] == "pending_approval"

    approved = client.post(f"{url}/decision", json={"action": "approved"}, headers=approver)
    assert approved.get_json()["status"] == "approved"
    assert approved.get_json()["approvals"][0]["action"] == "approved"

    published = client.post(f"{url}/publish", json={}, headers=admin).get_json()
    assert published["status"] == "published" and published["live"] is True
    assert published["advertisementNo"].startswith("PR/REC/")
    assert client.get("/api/jobs").get_json()["total"] == 1

    actions = {a.action for a in db.session.query(AuditLog)}
    assert {"job.created", "job.submitted", "job.approved", "job.published"} <= actions


def test_published_job_cannot_be_edited(client, staff):
    creator, approver, admin = (staff[r] for r in StaffRole)
    job_id = _create(client, creator)["id"]
    url = f"/api/admin/jobs/{job_id}"
    client.post(f"{url}/submit", headers=creator)
    client.post(f"{url}/decision", json={"action": "approved"}, headers=approver)
    response = client.put(url, json=job_payload(title="Changed"), headers=creator)
    assert response.status_code == 409 and response.get_json()["code"] == "job_locked"
    client.post(f"{url}/publish", json={}, headers=admin)
    assert client.put(url, json=job_payload(), headers=admin).status_code == 409


def test_return_with_comments_then_resubmit(client, staff):
    creator, approver = staff[StaffRole.JOB_CREATOR], staff[StaffRole.APPROVER]
    url = f"/api/admin/jobs/{_create(client, creator)['id']}"
    client.post(f"{url}/submit", headers=creator)

    no_reason = client.post(f"{url}/decision", json={"action": "returned"}, headers=approver)
    assert no_reason.status_code == 422 and "comments" in no_reason.get_json()["fields"]

    body = {"action": "returned", "comments": "Fix the age limit."}
    returned = client.post(f"{url}/decision", json=body, headers=approver).get_json()
    assert returned["status"] == "returned"
    assert returned["approvals"][0]["comments"] == "Fix the age limit."

    edited = client.put(url, json=job_payload(title="Ticket Examiner"), headers=creator).get_json()
    assert edited["title"] == "Ticket Examiner" and edited["status"] == "returned"
    assert client.post(f"{url}/submit", headers=creator).get_json()["status"] == "pending_approval"


def test_reject_closes_the_job(client, staff):
    creator, approver = staff[StaffRole.JOB_CREATOR], staff[StaffRole.APPROVER]
    url = f"/api/admin/jobs/{_create(client, creator)['id']}"
    client.post(f"{url}/submit", headers=creator)
    body = {"action": "rejected", "comments": "Post not sanctioned."}
    assert client.post(f"{url}/decision", json=body, headers=approver).get_json()["status"] == (
        "rejected"
    )
    assert client.post(f"{url}/submit", headers=creator).status_code == 409


@pytest.mark.parametrize(
    ("role", "method", "path", "status"),
    [
        (StaffRole.APPROVER, "post", "", 403),  # approvers can't create jobs
        (StaffRole.JOB_CREATOR, "post", "/{id}/decision", 403),  # creators can't approve
        (StaffRole.APPROVER, "post", "/{id}/publish", 403),  # only admins publish
    ],
)
def test_roles(client, staff, role, method, path, status):
    job_id = _create(client, staff[StaffRole.ADMIN])["id"]
    response = getattr(client, method)(
        "/api/admin/jobs" + path.format(id=job_id),
        json=job_payload() if not path else {"action": "approved"},
        headers=staff[role],
    )
    assert response.status_code == status


def test_input_validation(client, staff):
    now = datetime.now(UTC)
    payload = job_payload(
        department="XXX",
        closingDate=(now - timedelta(days=5)).isoformat(),
        quotas=[{"category": "open_merit", "seats": 3}],
    )
    response = client.post("/api/admin/jobs", json=payload, headers=staff[StaffRole.ADMIN])
    assert response.status_code == 422
    assert set(response.get_json()["fields"]) == {"closingDate", "quotas"}

    response = client.post(
        "/api/admin/jobs", json=job_payload(department="XXX"), headers=staff[StaffRole.ADMIN]
    )
    assert response.status_code == 422 and "department" in response.get_json()["fields"]


def test_list_filters_by_status(client, staff):
    admin = staff[StaffRole.ADMIN]
    first = _create(client, admin)["id"]
    _create(client, admin, title="Gateman")
    client.post(f"/api/admin/jobs/{first}/submit", headers=admin)
    items = client.get("/api/admin/jobs?status=pending_approval", headers=admin).get_json()["items"]
    assert [job["id"] for job in items] == [first]
    assert len(client.get("/api/admin/jobs", headers=admin).get_json()["items"]) == 2
    assert client.get("/api/admin/jobs?status=nope", headers=admin).status_code == 422
