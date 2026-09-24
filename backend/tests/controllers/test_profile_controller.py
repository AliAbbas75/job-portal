from app.extensions import db
from app.models import AuditLog


def test_profile_requires_login(client):
    response = client.get("/api/profile")
    assert response.status_code == 401
    assert response.get_json()["code"] == "unauthorized"


def test_new_profile_matches_frontend_shape(client, make_candidate, auth_headers):
    account = make_candidate(cnic="00000-0000000-1", mobile="03000000000")
    body = client.get("/api/profile", headers=auth_headers(account)).get_json()
    assert body["personal"]["cnic"] == "00000-0000000-1"
    assert body["personal"]["nationality"] == "Pakistani"
    assert body["contact"]["mobile"] == "03000000000"
    assert body["domicile"] == {"province": "", "district": ""}
    assert body["education"] == [] and body["experience"] == [] and body["skills"] == []
    assert body["additional"] == {
        "governmentEmployee": False,
        "disability": False,
        "minority": False,
    }


def test_update_personal_and_record_edit_history(client, make_candidate, auth_headers):
    account = make_candidate()
    payload = {
        "fullName": "Test Candidate",
        "fatherName": "Test Father",
        "dob": "2001-05-10",
        "gender": "male",
        "cnic": "99999-9999999-9",  # read-only: ignored
    }
    body = client.put(
        "/api/profile/personal", json=payload, headers=auth_headers(account)
    ).get_json()
    assert body["personal"]["fullName"] == "Test Candidate"
    assert body["personal"]["dob"] == "2001-05-10"
    assert body["personal"]["cnic"] == account.cnic

    entry = db.session.query(AuditLog).one()
    assert entry.action == "profile.updated"
    assert entry.details == {
        "section": "personal",
        "fields": ["dob", "father_name", "full_name", "gender"],
    }


def test_validation_errors_are_per_field(client, make_candidate, auth_headers):
    response = client.put(
        "/api/profile/personal",
        json={"fullName": "", "dob": "2999-01-01", "gender": "other"},
        headers=auth_headers(make_candidate()),
    )
    assert response.status_code == 422
    fields = response.get_json()["fields"]
    assert {"fullName", "fatherName", "gender"} <= set(fields)


def test_domicile_district_must_belong_to_province(client, make_candidate, auth_headers):
    headers = auth_headers(make_candidate())
    ok = client.put(
        "/api/profile/domicile", json={"province": "PB", "district": "Lahore"}, headers=headers
    )
    assert ok.get_json()["domicile"] == {"province": "PB", "district": "Lahore"}
    bad = client.put(
        "/api/profile/domicile", json={"province": "PB", "district": "Karachi"}, headers=headers
    )
    assert bad.status_code == 422 and "district" in bad.get_json()["fields"]


def test_skills_are_trimmed_and_deduplicated(client, make_candidate, auth_headers):
    body = client.put(
        "/api/profile/skills",
        json=["Typing 40 wpm", " Typing 40 wpm ", "Driving licence"],
        headers=auth_headers(make_candidate()),
    ).get_json()
    assert body["skills"] == ["Typing 40 wpm", "Driving licence"]


def test_education_add_edit_delete(client, make_candidate, auth_headers):
    headers = auth_headers(make_candidate())
    entry = {
        "level": "intermediate",
        "discipline": "Pre-Engineering",
        "institution": "Test Board",
        "year": "2019",
        "marksPercent": "62.5",
    }

    created = client.post("/api/profile/education", json=entry, headers=headers)
    assert created.status_code == 201
    item = created.get_json()["education"][0]
    assert item["year"] == 2019 and item["marksPercent"] == 62.5

    updated = client.put(
        f"/api/profile/education/{item['id']}", json={**entry, "marksPercent": 70}, headers=headers
    )
    assert updated.get_json()["education"][0]["marksPercent"] == 70.0

    deleted = client.delete(f"/api/profile/education/{item['id']}", headers=headers)
    assert deleted.get_json()["education"] == []


def test_education_rejects_unknown_level(client, make_candidate, auth_headers):
    response = client.post(
        "/api/profile/education",
        json={
            "level": "diploma-x",
            "discipline": "X",
            "institution": "Y",
            "year": 2019,
            "marksPercent": 50,
        },
        headers=auth_headers(make_candidate()),
    )
    assert response.status_code == 422 and "level" in response.get_json()["fields"]


def test_experience_current_job_has_no_end_date(client, make_candidate, auth_headers):
    headers = auth_headers(make_candidate())
    body = client.post(
        "/api/profile/experience",
        json={
            "organization": "Org",
            "designation": "Clerk",
            "startDate": "2020-01-01",
            "endDate": "",
            "current": True,
        },
        headers=headers,
    ).get_json()
    assert body["experience"][0]["endDate"] is None
    missing_end = client.post(
        "/api/profile/experience",
        json={
            "organization": "Org",
            "designation": "Clerk",
            "startDate": "2020-01-01",
            "current": False,
        },
        headers=headers,
    )
    assert missing_end.status_code == 422 and "endDate" in missing_end.get_json()["fields"]


def test_cannot_edit_another_candidates_entry(client, make_candidate, auth_headers):
    owner = make_candidate(cnic="00000-0000000-1")
    other = make_candidate(cnic="00000-0000000-2")
    entry = {
        "level": "matric",
        "discipline": "Science",
        "institution": "Board",
        "year": 2017,
        "marksPercent": 80,
    }
    item_id = client.post(
        "/api/profile/education", json=entry, headers=auth_headers(owner)
    ).get_json()["education"][0]["id"]

    response = client.delete(f"/api/profile/education/{item_id}", headers=auth_headers(other))
    assert response.status_code == 404
