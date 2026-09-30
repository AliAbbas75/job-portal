"""Seeds complete demo data: staff/employer, candidate account, profile, CV, documents,
jobs, and submitted application with fee and status history.
"""

from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from pathlib import Path
import uuid

from sqlalchemy import select

from app.extensions import db
from app.models import (
    Application,
    ApplicationSnapshot,
    CandidateAccount,
    CandidateProfile,
    CandidateReference,
    District,
    Document,
    DocumentType,
    EducationRecord,
    ExperienceRecord,
    Job,
    StaffUser,
    StatusEvent,
)
from app.models.enums import (
    AgeRelaxationClaim,
    ApplicationStatus,
    FeeStatus,
    Gender,
    MobileOperator,
    QuotaClaim,
    StaffRole,
    TradeCertificate,
)
from app.schemas.profile_schema import ProfileSchema
from app.services import eligibility_service, staff_service
from app.services.demo_seed_service import seed_demo_jobs
from app.services.reference_seed_service import seed_reference_data
from app.services.storage_service import _upload_dir
from app.utils.dates import age_on

MINIMAL_PDF_BYTES = b"""%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 75 >>
stream
BT
/F1 16 Tf
50 720 Td
(Pakistan Railways Recruitment - Verified Candidate Document) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000370 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
444
%%EOF
"""

MINIMAL_PNG_BYTES = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
    b"\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?"
    b"\x00\x05\xfe\x02\xfe\xa74d\xa2\x00\x00\x00\x00IEND\xaeB`\x82"
)


def _ensure_staff_users():
    """Ensure Admin, Approver, and Creator staff accounts exist."""
    staff_accounts = [
        ("Pakistan Railways Admin", "admin@example.com", StaffRole.ADMIN, None),
        ("Divisional Approver", "approver@example.com", StaffRole.APPROVER, "TRF"),
        ("Recruitment Officer", "creator@example.com", StaffRole.JOB_CREATOR, "TRF"),
    ]
    created = []
    for name, email, role, dept in staff_accounts:
        existing = db.session.scalar(select(StaffUser).where(StaffUser.email == email.lower()))
        if not existing:
            user = staff_service.create_staff(name, email, "demo-password", role, dept)
            created.append(user.email)
        else:
            existing.name = name
            existing.role = role
            existing.department_code = dept
            existing.is_active = True
            existing.password_hash = staff_service._hasher.hash("demo-password")
    db.session.commit()
    return created


def _refresh_job_dates():
    """Ensure all demo jobs are currently open with active dates."""
    now = datetime.now(UTC)
    jobs = db.session.scalars(select(Job)).all()
    for job in jobs:
        job.opening_date = now - timedelta(days=3)
        job.published_at = now - timedelta(days=3)
        job.closing_date = now + timedelta(days=30)
    db.session.commit()


def _create_physical_document(profile_id, doc_type_code, original_name, content, mime_type, extension):
    """Writes a physical file in uploads and creates or returns a Document row."""
    existing = db.session.scalar(
        select(Document).where(
            Document.profile_id == profile_id,
            Document.document_type_code == doc_type_code,
            Document.archived_at.is_(None),
        )
    )
    if existing:
        return existing

    storage_dir = _upload_dir()
    storage_key = f"{uuid.uuid4().hex}{extension}"
    file_path = storage_dir / storage_key
    file_path.write_bytes(content)

    doc = Document(
        profile_id=profile_id,
        document_type_code=doc_type_code,
        original_filename=original_name,
        storage_key=storage_key,
        content_type=mime_type,
        size_bytes=len(content),
        uploaded_at=datetime.now(UTC) - timedelta(days=2),
    )
    db.session.add(doc)
    db.session.flush()
    return doc


def seed_candidate_with_everything(cnic="61101-4292346-2", mobile="03315489146"):
    """Populates candidate account, profile, education, experience, documents, CV, and application."""
    account = db.session.scalar(select(CandidateAccount).where(CandidateAccount.cnic == cnic))
    if not account:
        account = CandidateAccount(cnic=cnic, mobile=mobile, mobile_operator=MobileOperator.JAZZ)
        account.profile = CandidateProfile()
        db.session.add(account)
        db.session.flush()
    else:
        account.mobile = mobile
        account.mobile_operator = MobileOperator.JAZZ
        account.is_active = True
        if not account.profile:
            account.profile = CandidateProfile()
            db.session.flush()

    profile = account.profile
    profile.full_name = "Muhammad Ahmed Khan"
    profile.father_name = "Tariq Mehmood Khan"
    profile.dob = date(1996, 5, 15)
    profile.gender = Gender.MALE
    profile.nationality = "Pakistani"
    profile.email = "ahmed.khan@example.com"
    profile.current_address = "House 42, Street 8, Sector F-8/2, Islamabad"
    profile.permanent_address = "House 15, Rail Town, Allama Iqbal Road, Lahore"
    profile.domicile_province_code = "PB"

    lahore_district = db.session.scalar(
        select(District).where(District.province_code == "PB", District.name.ilike("%lahore%"))
    )
    if lahore_district:
        profile.domicile_district_id = lahore_district.id

    profile.is_government_employee = False
    profile.has_disability = False
    profile.is_minority = False
    profile.skills = [
        "Python",
        "FastAPI",
        "React",
        "PostgreSQL",
        "Railway Telecommunication",
        "Cloud Infrastructure",
        "Linux System Administration",
    ]
    profile.highest_qualification_code = "bachelor16"
    profile.trade_certificate = TradeCertificate.NONE
    profile.quota_claim = QuotaClaim.OPEN_MERIT
    profile.age_relaxation_claim = AgeRelaxationClaim.NONE
    profile.statement_of_purpose = (
        "Dedicated software and systems engineer with over 4 years of proven experience in distributed "
        "architectures and IT infrastructure. Aiming to contribute to Pakistan Railways' digital transformation, "
        "automated signaling coordination, and modern passenger management systems."
    )
    db.session.flush()

    # Documents & CV
    doc_specs = [
        ("resume", "Muhammad_Ahmed_Khan_CV.pdf", MINIMAL_PDF_BYTES, "application/pdf", ".pdf"),
        ("photo", "passport_photo.png", MINIMAL_PNG_BYTES, "image/png", ".png"),
        ("cnic_copy", "cnic_front_back.pdf", MINIMAL_PDF_BYTES, "application/pdf", ".pdf"),
        ("domicile_certificate", "domicile_punjab.pdf", MINIMAL_PDF_BYTES, "application/pdf", ".pdf"),
        ("character_certificate", "character_certificate.pdf", MINIMAL_PDF_BYTES, "application/pdf", ".pdf"),
        ("matric_certificate", "matric_certificate.pdf", MINIMAL_PDF_BYTES, "application/pdf", ".pdf"),
        ("intermediate_certificate", "fsc_certificate.pdf", MINIMAL_PDF_BYTES, "application/pdf", ".pdf"),
        ("degree", "bs_computer_science_degree.pdf", MINIMAL_PDF_BYTES, "application/pdf", ".pdf"),
        ("experience_certificate", "experience_letter.pdf", MINIMAL_PDF_BYTES, "application/pdf", ".pdf"),
    ]
    created_docs = {}
    for doc_type, orig_name, content, mime, ext in doc_specs:
        created_docs[doc_type] = _create_physical_document(
            profile.id, doc_type, orig_name, content, mime, ext
        )

    # Education records
    if not profile.education:
        profile.education = [
            EducationRecord(
                qualification_level_code="matric",
                discipline="Science",
                institution="Govt Central Model School, Lahore",
                passing_year=2012,
                marks_percent=Decimal("85.50"),
                certificate_document_id=created_docs["matric_certificate"].id,
            ),
            EducationRecord(
                qualification_level_code="intermediate",
                discipline="FSc Pre-Engineering",
                institution="Govt College University (GCU), Lahore",
                passing_year=2014,
                marks_percent=Decimal("82.00"),
                certificate_document_id=created_docs["intermediate_certificate"].id,
            ),
            EducationRecord(
                qualification_level_code="bachelor16",
                discipline="BS Computer Science",
                institution="National University of Sciences and Technology (NUST)",
                passing_year=2018,
                marks_percent=Decimal("78.50"),
                certificate_document_id=created_docs["degree"].id,
            ),
        ]
        db.session.flush()

    # Experience records
    if not profile.experience:
        profile.experience = [
            ExperienceRecord(
                organization="National Telecom Systems",
                designation="Software Engineer",
                start_date=date(2019, 1, 1),
                end_date=date(2022, 6, 30),
                is_current=False,
                certificate_document_id=created_docs["experience_certificate"].id,
            ),
            ExperienceRecord(
                organization="Pakistan Digital Infrastructure",
                designation="Senior Systems Engineer",
                start_date=date(2022, 7, 1),
                end_date=None,
                is_current=True,
            ),
        ]
        db.session.flush()

    # References
    if not profile.references:
        profile.references = [
            CandidateReference(
                name="Prof. Dr. Tariq Usman",
                designation="Dean of Computer Science",
                organization="NUST Islamabad",
                phone="03009876543",
                email="tariq.usman@example.com",
            ),
            CandidateReference(
                name="Engr. Salman Raza",
                designation="Director of Infrastructure",
                organization="National Telecom Systems",
                phone="03215554321",
                email="salman.raza@example.com",
            ),
        ]
        db.session.flush()

    db.session.commit()

    # Create / Seed an Application to DEMO/005 (Assistant Director IT)
    job_it = db.session.scalar(select(Job).where(Job.advertisement_no == "DEMO/005"))
    if job_it:
        existing_app = db.session.scalar(
            select(Application).where(
                Application.profile_id == profile.id, Application.job_id == job_it.id
            )
        )
        if not existing_app:
            admin_user = db.session.scalar(
                select(StaffUser).where(StaffUser.email == "admin@example.com")
            )
            admin_id = admin_user.id if admin_user else None

            all_docs = db.session.scalars(
                select(Document).where(
                    Document.profile_id == profile.id, Document.archived_at.is_(None)
                )
            ).all()

            check = eligibility_service.check(job_it, profile, all_docs)
            dumped_profile = ProfileSchema().dump(profile)
            snapshot_sections = (
                "personal",
                "contact",
                "domicile",
                "education",
                "experience",
                "additional",
                "claims",
                "registrations",
                "publications",
                "references",
                "statementOfPurpose",
            )
            snapshot_dict = {sec: dumped_profile[sec] for sec in snapshot_sections}
            ref_date = eligibility_service.age_reference_date(job_it)
            snapshot_dict["ageOnReferenceDate"] = age_on(profile.dob, ref_date)
            snapshot_dict["ageReferenceDate"] = ref_date.isoformat()
            snapshot_dict["eligibility"] = check["items"]

            required_codes = {d.code for d in job_it.required_documents}
            docs_for_snapshot = [d for d in all_docs if d.document_type_code in required_codes]

            now = datetime.now(UTC)
            submitted_time = now - timedelta(days=1, hours=4)

            app_record = Application(
                profile_id=profile.id,
                job_id=job_it.id,
                status=ApplicationStatus.UNDER_REVIEW,
                submitted_at=submitted_time,
                fee_amount=job_it.fee_amount,
                fee_status=FeeStatus.PAID,
                fee_paid_at=submitted_time + timedelta(hours=2),
                fee_reference="NBP-CH-2026-99124",
                fee_confirmed_by_id=admin_id,
            )
            app_record.snapshot = ApplicationSnapshot(
                profile_data=snapshot_dict,
                documents=docs_for_snapshot,
                created_at=submitted_time,
            )
            app_record.events = [
                StatusEvent(
                    status=ApplicationStatus.SUBMITTED,
                    note="Application submitted online by candidate.",
                    created_at=submitted_time,
                ),
                StatusEvent(
                    status=ApplicationStatus.UNDER_REVIEW,
                    note="Bank challan payment verified (Challan #NBP-CH-2026-99124). Application moved to Under Review.",
                    actor_staff_id=admin_id,
                    created_at=submitted_time + timedelta(hours=3),
                ),
            ]
            db.session.add(app_record)
            db.session.commit()

    return account


def seed_all_portal_data():
    """Main entrypoint: loads reference data, jobs, staff, and candidates."""
    print("1. Seeding reference data...")
    seed_reference_data()

    print("2. Seeding demo jobs...")
    seed_demo_jobs()
    _refresh_job_dates()

    print("3. Seeding staff accounts (Employer/Admin, Approver, Creator)...")
    _ensure_staff_users()

    print("4. Seeding primary candidate 61101-4292346-2...")
    seed_candidate_with_everything(cnic="61101-4292346-2", mobile="03315489146")

    print("5. Seeding secondary candidate 35202-1234567-1...")
    seed_candidate_with_everything(cnic="35202-1234567-1", mobile="03001234567")

    print("Portal data seeding complete!")
