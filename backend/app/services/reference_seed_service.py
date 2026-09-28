"""Reference data seed (T-018). Safe to run repeatedly: inserts new rows and updates names.

Keep codes in sync with frontend/src/api/mocks/referenceData.js until the frontend reads
them from the API.
"""

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.extensions import db
from app.models.candidate import CandidateProfile
from app.models.reference import (
    Department,
    District,
    DocumentType,
    JobCategory,
    Province,
    QualificationLevel,
)

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

# Kinds of post for "Jobs by category": trades and operational posts, then office and
# professional groups.
JOB_CATEGORIES = [
    ("carpenter", "Carpenter"),
    ("electrician", "Electrician"),
    ("fitter", "Fitter"),
    ("mason", "Mason"),
    ("mechanic", "Mechanic"),
    ("painter", "Painter"),
    ("welder", "Welder"),
    ("driver", "Driver"),
    ("gateman", "Gateman"),
    ("pointsman", "Pointsman"),
    ("station_staff", "Station staff"),
    ("ticket_checker", "Ticket checker"),
    ("clerical", "Clerical and accounts"),
    ("engineering", "Engineering"),
    ("medical", "Medical"),
    ("it", "Information technology"),
]

# Domicile districts, as notified in September 2026: Punjab 41, Sindh 30, Khyber Pakhtunkhwa 40
# (Upper Swat and Paharpur, Oct 2025), Balochistan 42, Gilgit-Baltistan 10 (the four announced
# in 2019 were never set up), AJK 10. Source: the provinces' district lists on Wikipedia. When
# districts change, edit these lists and run `flask seed`.
PROVINCES = [
    (
        "PB",
        "Punjab",
        [
            "Attock",
            "Bahawalnagar",
            "Bahawalpur",
            "Bhakkar",
            "Chakwal",
            "Chiniot",
            "Dera Ghazi Khan",
            "Faisalabad",
            "Gujranwala",
            "Gujrat",
            "Hafizabad",
            "Jhang",
            "Jhelum",
            "Kasur",
            "Khanewal",
            "Khushab",
            "Kot Addu",
            "Lahore",
            "Layyah",
            "Lodhran",
            "Mandi Bahauddin",
            "Mianwali",
            "Multan",
            "Murree",
            "Muzaffargarh",
            "Nankana Sahib",
            "Narowal",
            "Okara",
            "Pakpattan",
            "Rahim Yar Khan",
            "Rajanpur",
            "Rawalpindi",
            "Sahiwal",
            "Sargodha",
            "Sheikhupura",
            "Sialkot",
            "Talagang",
            "Taunsa",
            "Toba Tek Singh",
            "Vehari",
            "Wazirabad",
        ],
    ),
    (
        "SD",
        "Sindh",
        [
            "Badin",
            "Dadu",
            "Ghotki",
            "Hyderabad",
            "Jacobabad",
            "Jamshoro",
            "Karachi Central",
            "Karachi East",
            "Karachi South",
            "Karachi West",
            "Kashmore",
            "Keamari",
            "Khairpur",
            "Korangi",
            "Larkana",
            "Malir",
            "Matiari",
            "Mirpur Khas",
            "Naushahro Feroze",
            "Qambar Shahdadkot",
            "Sanghar",
            "Shaheed Benazirabad",
            "Shikarpur",
            "Sujawal",
            "Sukkur",
            "Tando Allahyar",
            "Tando Muhammad Khan",
            "Tharparkar",
            "Thatta",
            "Umerkot",
        ],
    ),
    (
        "KP",
        "Khyber Pakhtunkhwa",
        [
            "Abbottabad",
            "Allai",
            "Bajaur",
            "Bannu",
            "Battagram",
            "Buner",
            "Central Dir",
            "Charsadda",
            "Dera Ismail Khan",
            "Hangu",
            "Haripur",
            "Karak",
            "Khyber",
            "Kohat",
            "Kolai Palas",
            "Kurram",
            "Lakki Marwat",
            "Lower Chitral",
            "Lower Dir",
            "Lower Kohistan",
            "Lower South Waziristan",
            "Malakand",
            "Mansehra",
            "Mardan",
            "Mohmand",
            "North Waziristan",
            "Nowshera",
            "Orakzai",
            "Paharpur",
            "Peshawar",
            "Shangla",
            "Swabi",
            "Swat",
            "Tank",
            "Torghar",
            "Upper Chitral",
            "Upper Dir",
            "Upper Kohistan",
            "Upper South Waziristan",
            "Upper Swat",
        ],
    ),
    (
        "BA",
        "Balochistan",
        [
            "Awaran",
            "Barkhan",
            "Barshore",
            "Chagai",
            "Chaman",
            "Dera Bugti",
            "Duki",
            "Gwadar",
            "Harnai",
            "Hub",
            "Jafarabad",
            "Jhal Magsi",
            "Kachhi",
            "Kalat",
            "Kech",
            "Kharan",
            "Khuzdar",
            "Killa Saifullah",
            "Kohlu",
            "Lasbela",
            "Loralai",
            "Mastung",
            "Musakhel",
            "Nasirabad",
            "Nushki",
            "Panjgur",
            "Pishin",
            "Qila Abdullah",
            "Quetta East",
            "Quetta West",
            "Sherani",
            "Sibi",
            "Sohbatpur",
            "Surab",
            "Taftan",
            "Tump",
            "Upper Dera Bugti",
            "Usta Muhammad",
            "Wadh",
            "Washuk",
            "Ziarat",
            "Zhob",
        ],
    ),
    ("IS", "Islamabad Capital Territory", ["Islamabad"]),
    (
        "GB",
        "Gilgit-Baltistan",
        [
            "Astore",
            "Diamer",
            "Ghanche",
            "Ghizer",
            "Gilgit",
            "Hunza",
            "Kharmang",
            "Nagar",
            "Shigar",
            "Skardu",
        ],
    ),
    (
        "AJK",
        "Azad Jammu & Kashmir",
        [
            "Bagh",
            "Bhimber",
            "Hattian Bala",
            "Haveli",
            "Kotli",
            "Mirpur",
            "Muzaffarabad",
            "Neelum",
            "Poonch",
            "Sudhanoti",
        ],
    ),
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
    ("trade_certificate", "Trade certificate"),
    ("quota_proof", "Quota proof"),
    ("age_relaxation_proof", "Age relaxation proof"),
    ("resume", "Resume / CV"),
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


def _retire_districts():
    """Removes districts that are no longer on the lists, unless a profile's domicile uses one
    (that profile keeps it until the candidate picks a current district)."""
    current = {(code, name) for code, _, districts in PROVINCES for name in districts}
    in_use = select(CandidateProfile.domicile_district_id).where(
        CandidateProfile.domicile_district_id.is_not(None)
    )
    for district in db.session.scalars(select(District).where(District.id.not_in(in_use))):
        if (district.province_code, district.name) not in current:
            db.session.delete(district)


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
    _retire_districts()
    _upsert(
        QualificationLevel,
        [{"code": c, "name": n, "rank": r} for c, n, r in QUALIFICATION_LEVELS],
        ["code"],
        ["name", "rank"],
    )
    _upsert(DocumentType, [{"code": c, "name": n} for c, n in DOCUMENT_TYPES], ["code"], ["name"])
    _upsert(JobCategory, [{"code": c, "name": n} for c, n in JOB_CATEGORIES], ["code"], ["name"])
    db.session.commit()
    return {
        model.__tablename__: db.session.query(model).count()
        for model in (
            Department,
            Province,
            District,
            QualificationLevel,
            DocumentType,
            JobCategory,
        )
    }
