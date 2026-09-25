import re
from datetime import UTC, datetime, timedelta

from app.extensions import db
from app.models import Application, AuditLog, StatusEvent
from app.models.enums import StaffRole


def _apply_pass(client, job, headers):
    """Wizard steps 1-2: confirm CNIC + mobile, then the SMS code, for the submit pass."""
    contact = client.get("/api/profile", headers=headers).get_json()
    identity = {"cnic": contact["personal"]["cnic"], "mobile": contact["contact"]["mobile"]}
    client.post(f"/api/jobs/{job.id}/apply-code", json=identity, headers=headers)
    outbox = client.application.extensions.get("sms_outbox", [])
    code = re.search(r"\b(\d{6})\b", outbox[-1][1]).group(1) if outbox else "000000"
    body = client.post(
        f"/api/jobs/{job.id}/apply-code/verify", json={"otp": code}, headers=headers
    ).get_json()
    return body.get("applyPass")


def _submit(client, job, headers, declaration=True, apply_pass=None):
    apply_pass = apply_pass or _apply_pass(client, job, headers)
    return client.post(
        f"/api/jobs/{job.id}/applications",
        json={"declarationAccepted": declaration, "applyPass": apply_pass},
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
    incomplete = auth_headers(make_candidate(cnic="00000-0000000-9", mobile="03000000009"))
    assert _submit(client, job, incomplete).get_json()["code"] == "requirements_incomplete"

    headers = auth_headers(eligible_candidate())
    assert _submit(client, job, headers, apply_pass="forged").get_json()["code"] == (
        "identity_check_required"
    )
    apply_pass = _apply_pass(client, job, headers)  # valid for 30 minutes
    no_declaration = _submit(client, job, headers, declaration=False, apply_pass=apply_pass)
    assert no_declaration.get_json()["code"] == "declaration_required"
    assert _submit(client, job, headers, apply_pass=apply_pass).status_code == 201
    second = _submit(client, job, headers, apply_pass=apply_pass)
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


def test_apply_code_needs_the_registered_identity(
    client, publish_job, eligible_candidate, auth_headers, sms_outbox
):
    job = publish_job()
    headers = auth_headers(eligible_candidate())
    wrong = client.post(
        f"/api/jobs/{job.id}/apply-code",
        json={"cnic": "00000-0000000-1", "mobile": "0300-1111111"},
        headers=headers,
    )
    assert wrong.status_code == 422 and wrong.get_json()["code"] == "identity_mismatch"
    assert sms_outbox == []
    ok = client.post(
        f"/api/jobs/{job.id}/apply-code",
        json={"cnic": "00000-0000000-1", "mobile": "0300-0000000"},
        headers=headers,
    )
    assert ok.get_json() == {"expiresInSeconds": 300}
    real = re.search(r"(\d{6})", sms_outbox[-1][1]).group(1)
    wrong_code = "000000" if real != "000000" else "111111"
    bad = client.post(
        f"/api/jobs/{job.id}/apply-code/verify", json={"otp": wrong_code}, headers=headers
    )
    assert bad.get_json()["code"] == "invalid_otp"


def test_pass_is_for_one_job(client, publish_job, eligible_candidate, auth_headers):
    first, second = publish_job(), publish_job(title="Other job")
    headers = auth_headers(eligible_candidate())
    apply_pass = _apply_pass(client, first, headers)
    response = _submit(client, second, headers, apply_pass=apply_pass)
    assert response.get_json()["code"] == "identity_check_required"


def test_fee_challan_and_staff_confirmation(
    client, publish_job, eligible_candidate, auth_headers, make_staff, staff_headers
):
    job = publish_job(fee_amount=500)
    candidate = auth_headers(eligible_candidate())
    body = _submit(client, job, candidate).get_json()
    assert body["fee"] == {
        "amount": 500.0,
        "status": "unpaid",
        "challanNo": f"CH-{body['id']}",
        "paidAt": None,
    }

    challan = client.get(f"/api/applications/{body['id']}/challan", headers=candidate).get_json()
    assert challan["amount"] == 500.0 and challan["status"] == "unpaid"
    assert challan["candidate"] == {"name": "Test Candidate", "cnic": "00000-0000000-1"}
    assert challan["bank"]["name"] and challan["dueDate"]

    url = f"/api/admin/applications/{body['id']}/fee"
    creator = staff_headers(make_staff(role=StaffRole.JOB_CREATOR, email="c@example.com"))
    assert client.post(url, json={"reference": "TXN-1"}, headers=creator).status_code == 403
    admin = staff_headers(make_staff())
    paid = client.post(url, json={"reference": "TXN-1"}, headers=admin).get_json()
    assert paid["fee"]["status"] == "paid" and paid["feeReference"] == "TXN-1"
    assert client.post(url, json={"reference": "TXN-2"}, headers=admin).status_code == 409
    assert db.session.query(AuditLog).filter_by(action="application.fee_paid").count() == 1

    after = client.get(f"/api/applications/{body['id']}", headers=candidate).get_json()
    assert after["fee"]["status"] == "paid" and after["fee"]["paidAt"]


def test_no_fee_means_no_challan(client, publish_job, eligible_candidate, auth_headers):
    job = publish_job()  # fee 0
    candidate = auth_headers(eligible_candidate())
    body = _submit(client, job, candidate).get_json()
    assert body["fee"]["status"] == "not_required"
    response = client.get(f"/api/applications/{body['id']}/challan", headers=candidate)
    assert response.status_code == 404 and response.get_json()["code"] == "no_fee"
