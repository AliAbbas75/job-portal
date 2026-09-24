"""Reference data seed (T-018). Safe to run repeatedly: inserts new rows and updates names.

Keep codes in sync with frontend/src/api/mocks/referenceData.js until the frontend reads
them from the API.
"""

from sqlalchemy.dialects.postgresql import insert

from app.extensions import db
from app.models.reference import Department, District, DocumentType, Province, QualificationLevel

DEPARTMENTS = [
    ("TRF", "Traffic & Operations"),
    ("CIV", "Civil Engineering"),
    ("MEC", "Mechanical Engineering"),
    ("ELE", "Electrical Engineering"),
    ("SNT", "Signal & Telecom"),
    ("COM", "Commercial"),
    ("MED", "Medical Services"),
    ("ITD", "Information Technology"),
    ("ACC", "Accounts & Finance"),
]

# Starter district lists; extend with the full official list before launch.
PROVINCES = [
    ("PB", "Punjab", ["Lahore", "Rawalpindi", "Multan", "Faisalabad", "Bahawalpur"]),
    ("SD", "Sindh", ["Karachi", "Hyderabad", "Sukkur", "Larkana"]),
    ("KP", "Khyber Pakhtunkhwa", ["Peshawar", "Mardan", "Kohat", "Abbottabad"]),
    ("BA", "Balochistan", ["Quetta", "Sibi", "Khuzdar"]),
    ("IS", "Islamabad Capital Territory", ["Islamabad"]),
    ("GB", "Gilgit-Baltistan", ["Gilgit", "Skardu"]),
    ("AJK", "Azad Jammu & Kashmir", ["Muzaffarabad", "Mirpur"]),
]

QUALIFICATION_LEVELS = [
    ("matric", "Matric / SSC", 1),
    ("intermediate", "Intermediate / HSSC", 2),
    ("dae", "Diploma of Associate Engineer (DAE)", 2),
    ("bachelor14", "Bachelor's (14 years)", 3),
    ("bachelor16", "Bachelor's (16 years) / BE / BS", 4),
    ("master", "Master's", 5),
    ("mphil", "MPhil / MS", 6),
    ("phd", "PhD", 7),
]

DOCUMENT_TYPES = [
    ("cnic_copy", "CNIC copy (both sides)"),
    ("photo", "Passport-size photograph"),
    ("domicile_certificate", "Domicile certificate"),
    ("matric_certificate", "Matric certificate"),
    ("intermediate_certificate", "Intermediate certificate"),
    ("degree", "Degree / transcript"),
    ("dae_certificate", "DAE certificate"),
    ("experience_certificate", "Experience certificate"),
    ("character_certificate", "Character certificate"),
    ("pec_registration", "PEC registration"),
    ("noc", "No-objection certificate (NOC)"),
    ("disability_certificate", "Disability certificate"),
]


def _upsert(model, rows, key, update):
    if not rows:
        return
    statement = insert(model).values(rows)
    if update:
        statement = statement.on_conflict_do_update(
            index_elements=key, set_={column: statement.excluded[column] for column in update}
        )
    else:
        statement = statement.on_conflict_do_nothing(index_elements=key)
    db.session.execute(statement)


def seed_reference_data():
    """Inserts or updates all lookup tables. Returns row counts per table."""
    _upsert(Department, [{"code": c, "name": n} for c, n in DEPARTMENTS], ["code"], ["name"])
    _upsert(Province, [{"code": c, "name": n} for c, n, _ in PROVINCES], ["code"], ["name"])
    _upsert(
        District,
        [{"province_code": c, "name": d} for c, _, districts in PROVINCES for d in districts],
        ["province_code", "name"],
        [],
    )
    _upsert(
        QualificationLevel,
        [{"code": c, "name": n, "rank": r} for c, n, r in QUALIFICATION_LEVELS],
        ["code"],
        ["name", "rank"],
    )
    _upsert(DocumentType, [{"code": c, "name": n} for c, n in DOCUMENT_TYPES], ["code"], ["name"])
    db.session.commit()
    return {
        model.__tablename__: db.session.query(model).count()
        for model in (Department, Province, District, QualificationLevel, DocumentType)
    }
