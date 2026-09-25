import io
from datetime import UTC, datetime, timedelta

from app.extensions import db
from app.models import AuditLog, StaffUser
from app.models.enums import StaffRole
from app.services import staff_service
from tests.conftest import STAFF_PASSWORD
from tests.controllers.admin.test_admin_job_controller import job_payload

REQUISITION = {
    "title": "Sub Engineer (Civil)",
    "department": "CIV",
    "bps": 11,
    "vacancies": 10,
    "closingDate": (datetime.now(UTC) + timedelta(days=30)).date().isoformat(),
    "quotaSelection": ["open_merit", "railway_employee_child", "punjab"],
    "kpis": [{"title": "Scrutiny turnaround", "target": "14 days"}],
}


def test_requisition_is_a_draft_that_must_be_completed(client, make_staff, staff_headers):
    admin = staff_headers(make_staff())
    job = client.post("/api/admin/jobs/requisitions", json=REQUISITION, headers=admin).get_json()
    assert job["status"] == "draft" and job["requirements"] is None
    assert job["requisition"]["kpis"][0]["target"] == "14 days"
    assert job["closingDate"].startswith(REQUISITION["closingDate"])  # 23:59:59 PKT, same day

    incomplete = client.post(f"/api/admin/jobs/{job['id']}/submit", headers=admin)
    assert incomplete.status_code == 422
    missing = incomplete.get_json()["fields"]["incomplete"]
    assert {"location", "summary", "requirements", "quotas", "category"} <= set(missing)

    # Completing it in the full job form keeps the requisition notes and allows submitting.
    done = client.put(f"/api/admin/jobs/{job['id']}", json=job_payload(), headers=admin).get_json()
    assert done["requisition"]["quotaSelection"] == REQUISITION["quotaSelection"]
    submitted = client.post(f"/api/admin/jobs/{job['id']}/submit", headers=admin).get_json()
    assert submitted["status"] == "pending_approval"


def test_requisition_validation_and_roles(client, make_staff, staff_headers):
    admin = staff_headers(make_staff())
    bad = {**REQUISITION, "quotaSelection": ["vip"], "department": "XXX"}
    assert client.post("/api/admin/jobs/requisitions", json=bad, headers=admin).status_code == 422
    approver = staff_headers(make_staff(role=StaffRole.APPROVER, email="a@example.com"))
    response = client.post("/api/admin/jobs/requisitions", json=REQUISITION, headers=approver)
    assert response.status_code == 403


def test_job_list_has_applicant_counts_and_drafts(client, make_staff, staff_headers, publish_job):
    admin = staff_headers(make_staff())
    publish_job()
    client.post("/api/admin/jobs/requisitions", json=REQUISITION, headers=admin)
    items = client.get("/api/admin/jobs", headers=admin).get_json()["items"]
    assert sorted(i["status"] for i in items) == ["draft", "published"]
    assert all(i["applicantsCount"] == 0 for i in items)
    # Drafts never reach the public portal.
    assert client.get("/api/jobs").get_json()["total"] == 1


def test_staff_change_their_password(client, make_staff, staff_headers):
    user = make_staff()
    headers = staff_headers(user)
    url = "/api/admin/auth/password"
    wrong = client.post(
        url, json={"currentPassword": "nope", "newPassword": "x" * 12}, headers=headers
    )
    assert wrong.status_code == 401
    short = client.post(
        url, json={"currentPassword": STAFF_PASSWORD, "newPassword": "short"}, headers=headers
    )
    assert short.get_json()["code"] == "weak_password"
    ok = client.post(
        url,
        json={"currentPassword": STAFF_PASSWORD, "newPassword": "a-new-long-password"},
        headers=headers,
    )
    assert ok.status_code == 204
    db.session.expire_all()
    assert (
        staff_service.login(user.email, "a-new-long-password").id
        == db.session.get(StaffUser, user.id).id
    )
    assert db.session.query(AuditLog).filter_by(action="staff.password_changed").count() == 1


def test_organization_profile_and_logo(client, make_staff, staff_headers):
    admin = staff_headers(make_staff())
    creator = staff_headers(make_staff(role=StaffRole.JOB_CREATOR, email="c@example.com"))
    profile = client.get("/api/admin/organization", headers=creator).get_json()
    assert (
        profile["departmentName"] == "Pakistan Railways Headquarters"
        and profile["hasLogo"] is False
    )

    update = {**profile, "cellId": "PR-HQ-LHR", "officerName": "Recruitment Officer"}
    assert client.put("/api/admin/organization", json=update, headers=creator).status_code == 403
    saved = client.put("/api/admin/organization", json=update, headers=admin).get_json()
    assert saved["cellId"] == "PR-HQ-LHR"

    png = b"\x89PNG\r\n\x1a\n" + b"0" * 32
    logo = client.post(
        "/api/admin/organization/logo",
        data={"file": (io.BytesIO(png), "logo.png")},
        headers=admin,
        content_type="multipart/form-data",
    ).get_json()
    assert logo["hasLogo"] is True
    image = client.get("/api/admin/organization/logo", headers=creator)
    assert image.status_code == 200 and image.data == png
