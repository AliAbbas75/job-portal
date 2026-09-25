from app.services.resume_parser_service import LOW_CONFIDENCE, parse_resume_text

SAMPLE = """
AHMED ALI KHAN
Father's Name: Ali Khan
Date of Birth: 15/01/1996
Email: ahmed.khan@example.com | Phone: 0300-1234567
Address: House 1, Street 1, Lahore

Career Objective
Civil engineer seeking a role in railway infrastructure.

Education
BSc Civil Engineering (Civil Engineering) from University of Engineering and Technology 2018 78%
Intermediate (Pre-Engineering) Punjab Board 2014 82%
Matric (Science) 2012 85%

Work Experience
Jan 2019 - Present Site Engineer at Punjab Highways Department
Mar 2018 - Dec 2018 Trainee Engineer, National Construction Company

Skills
AutoCAD, Primavera, Surveying; Quantity estimation

Professional Registration
PEC Registration No: CIVIL/12345

Publications
Ballast behaviour under heavy axle loads, Journal of Railway Engineering 2021

References
Dr. Sana Malik, Professor, UET Lahore, sana@example.com
"""


def test_parses_personal_contact_and_statement():
    result = parse_resume_text(SAMPLE)
    assert result["parsed"] is True
    assert result["lowConfidence"] == LOW_CONFIDENCE
    personal = result["sections"]["personal"]
    assert personal["fullName"]["value"] == "Ahmed Ali Khan"
    assert personal["fatherName"]["value"] == "Ali Khan"
    assert personal["dob"] == {"value": "1996-01-15", "confidence": 0.85}
    assert result["sections"]["contact"]["email"]["value"] == "ahmed.khan@example.com"
    assert "railway infrastructure" in result["sections"]["statementOfPurpose"]["value"]


def test_parses_education_with_levels_years_and_marks():
    education = parse_resume_text(SAMPLE)["sections"]["education"]
    assert [e["level"] for e in education] == ["bachelor16", "intermediate", "matric"]
    first = education[0]
    assert first["year"] == 2018 and first["marksPercent"] == 78.0
    assert "University of Engineering" in first["institution"]
    assert education[1]["discipline"] == "Pre-Engineering"
    assert all(0 < e["confidence"] <= 1 for e in education)


def test_parses_experience_ranges():
    experience = parse_resume_text(SAMPLE)["sections"]["experience"]
    current, previous = experience
    assert current["current"] is True and current["startDate"] == "2019-01-01"
    assert current["designation"] == "Site Engineer"
    assert current["organization"] == "Punjab Highways Department"
    assert previous["endDate"] == "2018-12-01" and previous["current"] is False


def test_parses_bps15_sections_and_skills():
    sections = parse_resume_text(SAMPLE)["sections"]
    assert sections["skills"] == ["AutoCAD", "Primavera", "Surveying", "Quantity estimation"]
    assert sections["registrations"][0]["body"] == "PEC"
    assert sections["registrations"][0]["registrationNo"] == "CIVIL/12345"
    assert sections["publications"][0]["year"] == 2021
    assert sections["references"][0]["email"] == "sana@example.com"


def test_empty_text_is_not_parsed():
    result = parse_resume_text("")
    assert result["parsed"] is False
    assert result["sections"]["education"] == []
