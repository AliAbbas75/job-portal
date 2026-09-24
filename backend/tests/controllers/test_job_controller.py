from datetime import UTC, datetime, timedelta

from app.models.enums import EmploymentType, JobStatus


def titles(response):
    return [job["title"] for job in response.get_json()["items"]]


def test_lists_only_open_published_jobs(client, make_job, publish_job):
    publish_job(title="Open job")
    make_job(title="Draft job")
    publish_job(
        title="Not yet open",
        opening_date=datetime.now(UTC) + timedelta(days=2),
        closing_date=datetime.now(UTC) + timedelta(days=9),
    )
    publish_job(
        title="Closed job",
        opening_date=datetime.now(UTC) - timedelta(days=30),
        closing_date=datetime.now(UTC) - timedelta(days=1),
    )

    response = client.get("/api/jobs")
    assert response.status_code == 200
    body = response.get_json()
    assert titles(response) == ["Open job"]
    assert body["total"] == 1 and body["page"] == 1 and body["pageSize"] == 10


def test_job_json_matches_frontend_shape(client, publish_job):
    publish_job(title="Assistant Station Master", fee_amount=800)
    job = client.get("/api/jobs").get_json()["items"][0]
    assert job["departmentName"] == "Traffic & Operations"
    assert job["employmentType"] == "permanent"
    assert job["status"] == "published"
    assert job["fee"] == 800.0
    assert job["requirements"] == {
        "minQualification": "intermediate",
        "minMarksPercent": None,
        "experienceYears": 0.0,
        "ageMin": 18,
        "ageMax": 28,
        "domicileProvinces": ["PB"],
        "documents": ["cnic_copy"],
    }
    assert job["quotas"] == [{"category": "open_merit", "seats": 10}]


def test_keyword_search_matches_title_department_location_and_bps(client, publish_job):
    publish_job(title="Staff Nurse", department_code="MED", location="Quetta", bps=16)
    publish_job(title="Gateman", bps=2)
    assert titles(client.get("/api/jobs?q=nurse")) == ["Staff Nurse"]
    assert titles(client.get("/api/jobs?q=medical")) == ["Staff Nurse"]
    assert titles(client.get("/api/jobs?q=quetta")) == ["Staff Nurse"]
    assert titles(client.get("/api/jobs?q=bps-2")) == ["Gateman"]


def test_filters(client, publish_job):
    publish_job(title="A", bps=7, department_code="COM", employment_type=EmploymentType.CONTRACT)
    publish_job(title="B", bps=17, location="Karachi")
    assert titles(client.get("/api/jobs?bps=5-10")) == ["A"]
    assert titles(client.get("/api/jobs?department=COM")) == ["A"]
    assert titles(client.get("/api/jobs?employmentType=contract")) == ["A"]
    assert titles(client.get("/api/jobs?location=Karachi")) == ["B"]


def test_qualification_filter_shows_jobs_open_to_that_level(client, publish_job):
    job = publish_job(title="Needs degree")
    job.requirement.min_qualification_code = "bachelor16"
    publish_job(title="Needs intermediate")
    assert titles(client.get("/api/jobs?qualification=intermediate")) == ["Needs intermediate"]
    assert sorted(titles(client.get("/api/jobs?qualification=master"))) == [
        "Needs degree",
        "Needs intermediate",
    ]


def test_closing_filter_and_sort(client, publish_job):
    now = datetime.now(UTC)
    publish_job(title="Soon", closing_date=now + timedelta(days=3))
    publish_job(title="Later", closing_date=now + timedelta(days=20))
    assert titles(client.get("/api/jobs?closing=week")) == ["Soon"]
    assert titles(client.get("/api/jobs?sort=closing")) == ["Soon", "Later"]


def test_pagination(client, publish_job):
    for n in range(3):
        publish_job(title=f"Job {n}")
    body = client.get("/api/jobs?pageSize=2&page=2").get_json()
    assert body["total"] == 3 and len(body["items"]) == 1


def test_invalid_filter_is_rejected(client):
    response = client.get("/api/jobs?bps=99")
    assert response.status_code == 422
    assert response.get_json()["code"] == "validation_error"
    assert "bps" in response.get_json()["fields"]


def test_job_details(client, make_job, publish_job):
    job = publish_job(title="Visible")
    draft = make_job(title="Draft")
    assert client.get(f"/api/jobs/{job.id}").get_json()["title"] == "Visible"
    assert client.get(f"/api/jobs/{draft.id}").status_code == 404
    assert client.get("/api/jobs/999999").get_json()["code"] == "not_found"


def test_closed_job_details_still_visible_as_closed(client, publish_job):
    job = publish_job(
        opening_date=datetime.now(UTC) - timedelta(days=30),
        closing_date=datetime.now(UTC) - timedelta(days=1),
    )
    assert client.get(f"/api/jobs/{job.id}").get_json()["status"] == "closed"
    job.status = JobStatus.CLOSED
    assert client.get(f"/api/jobs/{job.id}").get_json()["status"] == "closed"


def test_stats(client, publish_job):
    publish_job(vacancies=10, location="Lahore")
    publish_job(vacancies=5, location="Karachi", department_code="MED")
    assert client.get("/api/jobs/stats").get_json() == {
        "openJobs": 2,
        "vacancies": 15,
        "departments": 2,
        "locations": ["Karachi", "Lahore"],
    }
