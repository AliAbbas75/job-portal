import io

from app.extensions import db
from app.models import AuditLog
from app.services import eligibility_service
from app.services.document_service import current_documents

SUMMARY = {
    "fullName": "Test Candidate",
    "fatherName": "Test Father",
    "dob": "2001-05-10",
    "gender": "male",
    "province": "PB",
    "district": "Lahore",
    "email": "",
    "address": "House 1, Street 1, Lahore",
    "highestQualification": "intermediate",
    "tradeCertificate": "carpenter",
    "quota": "railway_employee_child",
    "ageRelaxation": "none",
}


def test_summary_form_saves_everything_at_once(client, make_candidate, auth_headers):
    account = make_candidate()
    body = client.put(
        "/api/profile/summary", json=SUMMARY, headers=auth_headers(account)
    ).get_json()
    assert body["personal"]["fullName"] == "Test Candidate"
    assert body["domicile"] == {"province": "PB", "district": "Lahore"}
    assert body["contact"]["currentAddress"] == body["contact"]["permanentAddress"]
    assert body["claims"] == {
        "highestQualification": "intermediate",
        "tradeCertificate": "carpenter",
        "quota": "railway_employee_child",
        "ageRelaxation": "none",
    }
    entry = db.session.query(AuditLog).filter_by(action="profile.updated").one()
    assert entry.details["section"] == "summary"
    assert "Test" not in str(entry.details)  # field names only, never values


def test_summary_validation(client, make_candidate, auth_headers):
    bad = {**SUMMARY, "district": "Karachi", "quota": "vip", "highestQualification": "nope"}
    response = client.put("/api/profile/summary", json=bad, headers=auth_headers(make_candidate()))
    assert response.status_code == 422
    assert "quota" in response.get_json()["fields"]


def test_reference_lists_for_the_form(client):
    ref = client.get("/api/reference").get_json()
    assert {"code": "railway_employee_child", "name": "Railway employee child"} in ref[
        "quotaClaims"
    ]
    assert ref["ageRelaxations"][0] == {"code": "none", "name": "None"}
    assert {"code": "carpenter", "name": "Carpenter certificate"} in ref["tradeCertificates"]


def test_highest_education_counts_when_no_full_record(publish_job, make_candidate):
    job = publish_job()  # needs intermediate, no minimum marks
    profile = make_candidate().profile
    profile.highest_qualification_code = "bachelor16"
    db.session.flush()

    def education():
        result = eligibility_service.check(job, profile, current_documents(profile))
        return next(item for item in result["items"] if item["key"] == "education")

    assert education()["status"] == "met"
    job.requirement.min_marks_percent = 50  # marks can only come from the full record
    db.session.flush()
    assert education() == {**education(), "status": "missing", "fix": "education"}
    profile.highest_qualification_code = "matric"
    db.session.flush()
    assert education()["status"] == "not_met"


def test_download_own_document_only(client, make_candidate, auth_headers):
    owner = auth_headers(make_candidate())
    other = auth_headers(make_candidate(cnic="00000-0000000-2", mobile="03000000002"))
    png = b"\x89PNG\r\n\x1a\n" + b"0" * 32
    uploaded = client.post(
        "/api/documents",
        data={"type": "photo", "file": (io.BytesIO(png), "me.png")},
        headers=owner,
        content_type="multipart/form-data",
    ).get_json()
    response = client.get(f"/api/documents/{uploaded['id']}/file", headers=owner)
    assert response.status_code == 200 and response.data == png
    assert response.mimetype == "image/png"
    assert client.get(f"/api/documents/{uploaded['id']}/file", headers=other).status_code == 404
