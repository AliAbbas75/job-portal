import re
from datetime import UTC, datetime, timedelta

from app.extensions import db
from app.models import Application, AuditLog, StatusEvent
from app.models.enums import StaffRole


def _submit(client, job, headers, declaration=True):
    return client.post(
        f"/api/jobs/{job.id}/applications",
        json={"declarationAccepted": declaration},
        headers=headers,
    )


def test_check_lists_items_and_state(client, publish_job, make_candidate, auth_headers):
    job = publish_job()
    body = client.get(
        f"/api/jobs/{job.id}/application-check", headers=auth_headers(make_candidate())
    ).get_json()
    assert body["complete"] is False and body["eligible"] is True
    assert body["alreadyAppliedId"] is None and body["jobClosed"] is False
    assert {item["key"] for item in body["items"]} == {"education", "age", "domicile", "document"}


def test_check_hides_unpublished_jobs(client, make_job, make_candidate, auth_headers):
    job = make_job()  # draft
    response = client.get(
        f"/api/jobs/{job.id}/application-check", headers=auth_headers(make_candidate())
    )
    assert response.status_code == 404


def test_submit_creates_application_snapshot_and_event(
    client, publish_job, eligible_candidate, auth_headers
):
    job = publish_job()
    account = eligible_candidate()
    headers = auth_headers(account)
    response = _submit(client, job, headers)
    assert response.status_code == 201
    body = response.get_json()
    assert re.fullmatch(r"PR-\d{4}-\d{6}", body["id"])
    assert body["status"] == "submitted" and body["jobId"] == job.id
    assert [e["status"] for e in body["events"]] == ["submitted"]
    assert body["job"]["title"] == job.title and body["job"]["departmentName"]

    application = db.session.query(Application).one()
    snapshot = application.snapshot.profile_data
    assert snapshot["personal"]["fullName"] == "Test Candidate"
    assert snapshot["ageOnReferenceDate"] == 22
    assert [d.document_type_code for d in application.snapshot.documents] == ["cnic_copy"]
    assert db.session.query(AuditLog).filter_by(action="application.submitted").count() == 1

    # Later profile edits don't change the submitted application.
    client.put(
        "/api/profile/personal",
        json={"fullName": "Changed Name", "fatherName": "F", "dob": "2001-01-01", "gender": "male"},
        headers=headers,
    )
    db.session.expire_all()
    assert application.snapshot.profile_data["personal"]["fullName"] == "Test Candidate"

    check = client.get(f"/api/jobs/{job.id}/application-check", headers=headers).get_json()
    assert check["alreadyAppliedId"] == body["id"]


def test_submit_rules(client, publish_job, make_candidate, eligible_candidate, auth_headers):
    job = publish_job()
    incomplete = auth_headers(make_candidate(cnic="00000-0000000-9"))
    assert _submit(client, job, incomplete).get_json()["code"] == "requirements_incomplete"

    headers = auth_headers(eligible_candidate())
    assert _submit(client, job, headers, declaration=False).get_json()["code"] == (
        "declaration_required"
    )
    assert _submit(client, job, headers).status_code == 201
    second = _submit(client, job, headers)
    assert second.status_code == 409 and second.get_json()["code"] == "already_applied"


def test_submit_to_closed_job(client, publish_job, eligible_candidate, auth_headers):
    now = datetime.now(UTC)
    job = publish_job(opening_date=now - timedelta(days=30), closing_date=now - timedelta(hours=1))
    response = _submit(client, job, auth_headers(eligible_candidate()))
    assert response.status_code == 409 and response.get_json()["code"] == "job_closed"


def test_list_and_get_only_own_applications(client, publish_job, eligible_candidate, auth_headers):
    job = publish_job()
    mine = auth_headers(eligible_candidate())
    other = auth_headers(eligible_candidate(cnic="00000-0000000-2", mobile="03000000002"))
    number = _submit(client, job, mine).get_json()["id"]

    listed = client.get("/api/applications", headers=mine).get_json()
    assert [a["id"] for a in listed] == [number]
    assert client.get("/api/applications", headers=other).get_json() == []
    assert client.get(f"/api/applications/{number}", headers=mine).status_code == 200
    assert client.get(f"/api/applications/{number}", headers=other).status_code == 404


def test_staff_move_application_through_statuses(
    client, publish_job, eligible_candidate, auth_headers, make_staff, staff_headers
):
    job = publish_job()
    candidate = auth_headers(eligible_candidate())
    number = _submit(client, job, candidate).get_json()["id"]
    admin = staff_headers(make_staff())
    creator = staff_headers(make_staff(role=StaffRole.JOB_CREATOR, email="c@example.com"))

    listed = client.get(f"/api/admin/jobs/{job.id}/applications", headers=creator).get_json()
    [row] = listed["items"]
    assert row["candidate"] == {
        "name": "Test Candidate",
        "cnic": "00000-0000000-1",
        "domicile": "PB",
        "age": 22,
    }
    assert row["nextStatuses"][0] == "under_review" and row["nextStatuses"][-1] == "rejected"

    url = f"/api/admin/applications/{number}/status"
    assert client.post(url, json={"status": "under_review"}, headers=creator).status_code == 403
    moved = client.post(
        url, json={"status": "shortlisted", "note": "Test on 3 Oct."}, headers=admin
    ).get_json()
    assert moved["status"] == "shortlisted"
    back = client.post(url, json={"status": "under_review"}, headers=admin)
    assert back.status_code == 409 and back.get_json()["code"] == "invalid_status_change"
    client.post(url, json={"status": "rejected"}, headers=admin)
    assert client.post(url, json={"status": "offer"}, headers=admin).status_code == 409

    events = client.get(f"/api/applications/{number}", headers=candidate).get_json()["events"]
    assert [e["status"] for e in events] == ["submitted", "shortlisted", "rejected"]
    assert events[1]["note"] == "Test on 3 Oct."
    assert db.session.query(StatusEvent).count() == 3
    assert db.session.query(AuditLog).filter_by(action="application.status_changed").count() == 2


def test_status_list_filter(client, publish_job, make_staff, staff_headers):
    job = publish_job()
    headers = staff_headers(make_staff())
    ok = client.get(f"/api/admin/jobs/{job.id}/applications?status=submitted", headers=headers)
    assert ok.get_json() == {"items": []}
    assert (
        client.get(f"/api/admin/jobs/{job.id}/applications?status=x", headers=headers).status_code
        == 422
    )
