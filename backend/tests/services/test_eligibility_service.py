from datetime import date, timedelta

from app.extensions import db
from app.models import EducationRecord, ExperienceRecord, Province
from app.services import eligibility_service
from app.services.document_service import current_documents


def _items(job, account):
    profile = account.profile
    result = eligibility_service.check(job, profile, current_documents(profile))
    return result, {item.get("documentType", item["key"]): item for item in result["items"]}


def test_empty_profile_lists_what_is_missing(publish_job, make_candidate):
    result, items = _items(publish_job(), make_candidate())
    assert items["education"]["status"] == "missing" and items["education"]["fix"] == "education"
    assert items["age"] == {
        "key": "age",
        "required": {"min": 18, "max": 28},
        "status": "missing",
        "fix": "personal",
    }
    assert items["domicile"]["status"] == "missing"
    assert items["domicile"]["required"] == {"provinces": ["Punjab"]}
    assert items["cnic_copy"]["status"] == "missing"
    assert "experience" not in items  # the job asks for none
    assert result["eligible"] is True and result["complete"] is False


def test_complete_profile_meets_everything(publish_job, eligible_candidate):
    result, items = _items(publish_job(), eligible_candidate())
    assert result == {**result, "eligible": True, "complete": True}
    assert items["age"]["actual"] == 22
    assert items["cnic_copy"]["documentId"] is not None


def test_not_met_rules_block_the_application(publish_job, eligible_candidate):
    job = publish_job()
    account = eligible_candidate()
    profile = account.profile
    profile.dob = date(date.today().year - 40, 1, 1)
    profile.domicile_province_code = "SD"
    profile.education[0].marks_percent = 30
    job.requirement.min_marks_percent = 45
    db.session.flush()
    result, items = _items(job, account)
    assert items["age"]["status"] == "not_met"
    assert items["domicile"]["status"] == "not_met"
    assert items["education"] == {**items["education"], "status": "not_met", "reason": "marks"}
    assert result["eligible"] is False


def test_lower_qualification_is_not_met_and_higher_counts(publish_job, eligible_candidate):
    job = publish_job()
    account = eligible_candidate()
    account.profile.education[0].qualification_level_code = "matric"
    db.session.flush()
    assert _items(job, account)[1]["education"]["status"] == "not_met"
    account.profile.education.append(
        EducationRecord(
            qualification_level_code="bachelor16",
            discipline="CS",
            institution="Test University",
            passing_year=2020,
            marks_percent=65,
        )
    )
    db.session.flush()
    assert _items(job, account)[1]["education"]["status"] == "met"


def test_experience_is_summed_and_can_be_missing(publish_job, eligible_candidate):
    job = publish_job()
    job.requirement.min_experience_years = 2
    account = eligible_candidate()
    today = date.today()
    account.profile.experience = [
        ExperienceRecord(
            organization="A",
            designation="Clerk",
            start_date=today - timedelta(days=400),
            end_date=today - timedelta(days=35),
            is_current=False,
        )
    ]
    db.session.flush()
    item = _items(job, account)[1]["experience"]
    assert item["status"] == "missing" and item["actual"] == 0.9 and item["fix"] == "experience"

    account.profile.experience.append(
        ExperienceRecord(
            organization="B",
            designation="Clerk",
            start_date=today - timedelta(days=30) - timedelta(days=365 * 2),
            is_current=True,
        )
    )
    db.session.flush()
    assert _items(job, account)[1]["experience"]["status"] == "met"


def test_age_uses_cutoff_date_when_set(publish_job, eligible_candidate):
    job = publish_job()
    account = eligible_candidate()
    account.profile.dob = date(2000, 6, 15)
    job.requirement.age_max = 25
    job.age_cutoff_date = date(2025, 6, 14)  # the day before the 25th birthday
    db.session.flush()
    assert _items(job, account)[1]["age"]["actual"] == 24


def test_domicile_rule_only_when_job_restricts_it(publish_job, eligible_candidate):
    job = publish_job()
    job.domicile_provinces = []
    db.session.flush()
    assert "domicile" not in _items(job, eligible_candidate())[1]
    job.domicile_provinces = [db.session.get(Province, "SD"), db.session.get(Province, "PB")]
    db.session.flush()
    assert _items(job, eligible_candidate(cnic="00000-0000000-2"))[1]["domicile"]["status"] == "met"
