"""Seed complete demo data for development:
- Employer / Staff accounts (Admin, Approver, Job Creator) with known passwords
- Sample published jobs across departments and BPS scales
- Candidate account (CNIC, Mobile, Operator) with full profile (Personal, Contact, Domicile, Skills, SOP)
- Uploaded CV and document vault files (PDF, PNG)
- Repeatable profile records (Education, Experience, PEC Registration, References)
- Submitted applications with snapshots, fee challan/payment, and status events
"""

import os
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import uuid
from datetime import UTC, date, datetime, timedelta
from decimal import Decimal
from pathlib import Path

from argon2 import PasswordHasher
from sqlalchemy import select

from app import create_app
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
    JobQuota,
    JobRequirement,
    ProfessionalRegistration,
    Province,
    StaffUser,
    StatusEvent,
)
from app.models.enums import (
    ApplicationStatus,
    EmploymentType,
    FeeStatus,
    Gender,
    JobStatus,
    MobileOperator,
    QuotaCategory,
    StaffRole,
)
from app.schemas.profile_schema import ProfileSchema
from app.services import eligibility_service
from app.services.application_service import SNAPSHOT_SECTIONS
from app.services.demo_seed_service import seed_demo_jobs
from app.services.document_service import current_documents
from app.services.reference_seed_service import seed_reference_data
from app.utils.dates import age_on

hasher = PasswordHasher()
DEMO_STAFF_PASSWORD = "Password12345!"

DUMMY_PNG = (
    b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00"
    b"\x1f\x15c4\x00\x00\x00\rIDATx\x9cc`\x00\x00\x00\x02\x00\x01H\xaf\xa4q\x00\x00\x00\x00IEND\xaeB`\x82"
)


def make_dummy_pdf(title, lines):
    stream_content = f"BT /F1 16 Tf 50 720 Td ({title}) Tj ET\n"
    y = 680
    for line in lines:
        safe_line = line.replace("(", r"\(").replace(")", r"\)")
        stream_content += f"BT /F1 10 Tf 50 {y} Td ({safe_line}) Tj ET\n"
        y -= 22

    content_bytes = stream_content.encode("latin1")
    length = len(content_bytes)

    pdf = (
        f"%PDF-1.4\n"
        f"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        f"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        f"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents 4 0 R >>\nendobj\n"
        f"4 0 obj\n<< /Length {length} >>\nstream\n"
        f"{stream_content}endstream\nendobj\n"
        f"xref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000280 00000 n \n"
        f"trailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n{340 + length}\n%%EOF"
    )
    return pdf.encode("latin1")


def get_or_create_file(upload_dir, filename, content_bytes):
    file_path = upload_dir / filename
    if not file_path.exists():
        file_path.write_bytes(content_bytes)
    return len(content_bytes)


def seed_all():
    app = create_app()
    with app.app_context():
        print("1. Seeding reference data...")
        seed_reference_data()

        print("2. Seeding demo jobs...")
        seed_demo_jobs()

        print("3. Seeding staff accounts...")
        staff_specs = [
            ("Admin User", "admin@example.com", StaffRole.ADMIN, None),
            ("Approver User", "approver@example.com", StaffRole.APPROVER, None),
            ("Creator User", "creator@example.com", StaffRole.JOB_CREATOR, "TRF"),
        ]
        staff_map = {}
        for name, email, role, dept in staff_specs:
            user = db.session.scalar(select(StaffUser).where(StaffUser.email == email.lower()))
            if user is None:
                user = StaffUser(
                    name=name,
                    email=email.lower(),
                    password_hash=hasher.hash(DEMO_STAFF_PASSWORD),
                    role=role,
                    department_code=dept,
                    is_active=True,
                )
                db.session.add(user)
            else:
                user.name = name
                user.password_hash = hasher.hash(DEMO_STAFF_PASSWORD)
                user.role = role
                user.department_code = dept
                user.is_active = True
            db.session.flush()
            staff_map[email] = user
        db.session.commit()
        print(f"   Staff accounts updated/created: {[s.email for s in staff_map.values()]}")

        print("4. Seeding candidate account & profile...")
        cand_cnic = "35202-1234567-1"
        cand_mobile = "03001234567"
        account = db.session.scalar(
            select(CandidateAccount).where(CandidateAccount.cnic == cand_cnic)
        )
        if account is None:
            account = CandidateAccount(
                cnic=cand_cnic,
                mobile=cand_mobile,
                mobile_operator=MobileOperator.JAZZ,
                is_active=True,
            )
            db.session.add(account)
            db.session.flush()
        else:
            account.mobile = cand_mobile
            account.mobile_operator = MobileOperator.JAZZ
            account.is_active = True

        profile = account.profile
        if profile is None:
            profile = CandidateProfile(account_id=account.id)
            db.session.add(profile)
            db.session.flush()

        # Update profile personal, contact, domicile, etc.
        lahore = db.session.scalar(
            select(District).where(District.province_code == "PB", District.name == "Lahore")
        )
        lahore_id = lahore.id if lahore else 18

        profile.full_name = "Muhammad Ali Khan"
        profile.father_name = "Tariq Mehmood Khan"
        profile.dob = date(1998, 5, 14)
        profile.gender = Gender.MALE
        profile.nationality = "Pakistani"
        profile.email = "muhammad.ali@example.com"
        profile.current_address = "Flat 4B, Executive Heights, Sector F-8/3, Islamabad"
        profile.permanent_address = "House 12, Street 4, Canal View, Lahore"
        profile.domicile_province_code = "PB"
        profile.domicile_district_id = lahore_id
        profile.is_government_employee = False
        profile.has_disability = False
        profile.is_minority = False
        profile.skills = [
            "Python",
            "React",
            "PostgreSQL",
            "Linux Systems",
            "Network Architecture",
            "REST APIs",
            "Project Management",
        ]
        profile.highest_qualification_code = "bachelor16"
        profile.statement_of_purpose = (
            "Passionate software and systems engineer with over 3 years of hands-on experience "
            "in distributed systems, database management, and infrastructure engineering, "
            "committed to modernizing Pakistan Railways internal operations and digital public services."
        )
        db.session.flush()

        print("5. Seeding document vault (CV, certificates, ID)...")
        upload_dir = Path(app.config["UPLOAD_FOLDER"])
        if not upload_dir.is_absolute():
            upload_dir = Path(app.root_path).parent / upload_dir
        upload_dir.mkdir(parents=True, exist_ok=True)

        doc_specs = [
            (
                "resume",
                "Muhammad_Ali_Khan_CV.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "CURRICULUM VITAE - MUHAMMAD ALI KHAN",
                    [
                        "Email: muhammad.ali@example.com | Mobile: 03001234567 | CNIC: 35202-1234567-1",
                        "Address: House 12, Street 4, Canal View, Lahore, Punjab",
                        "Objective: Contribute to Pakistan Railways digital infrastructure.",
                        "Education: BS Software Engineering (UET Lahore, 2020) - 79.40%",
                        "Experience: 3+ years in backend engineering, PostgreSQL and Linux systems.",
                        "Certifications: PEC Registered Engineer (COMP-48291).",
                    ],
                ),
            ),
            (
                "cnic_copy",
                "CNIC_Front_Back.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "NATIONAL IDENTITY CARD COPY - GOVERNMENT OF PAKISTAN",
                    [
                        "Name: Muhammad Ali Khan",
                        "Father Name: Tariq Mehmood Khan",
                        "CNIC: 35202-1234567-1",
                        "Date of Birth: 14.05.1998",
                        "Gender: Male",
                    ],
                ),
            ),
            ("photo", "Passport_Size_Photo.png", "image/png", DUMMY_PNG),
            (
                "domicile_certificate",
                "Domicile_Certificate_Lahore.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "OFFICE OF THE DEPUTY COMMISSIONER LAHORE - DOMICILE CERTIFICATE",
                    [
                        "This is to certify that Muhammad Ali Khan son of Tariq Mehmood Khan",
                        "is a bona fide resident of District Lahore, Province of Punjab.",
                    ],
                ),
            ),
            (
                "matric_certificate",
                "Matriculation_Sanad.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "BOARD OF INTERMEDIATE AND SECONDARY EDUCATION LAHORE",
                    [
                        "Secondary School Certificate Examination (Science Group)",
                        "Candidate: Muhammad Ali Khan | Passing Year: 2014 | Marks: 85.50%",
                    ],
                ),
            ),
            (
                "intermediate_certificate",
                "Intermediate_Sanad.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "BOARD OF INTERMEDIATE AND SECONDARY EDUCATION LAHORE",
                    [
                        "Higher Secondary School Certificate Examination (Pre-Engineering)",
                        "Candidate: Muhammad Ali Khan | Passing Year: 2016 | Marks: 81.20%",
                    ],
                ),
            ),
            (
                "degree",
                "BS_Software_Engineering_Degree.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "UNIVERSITY OF ENGINEERING AND TECHNOLOGY LAHORE",
                    [
                        "Bachelor of Science in Software Engineering (16 Years)",
                        "Awarded to Muhammad Ali Khan in the Year 2020 with 79.40% marks.",
                    ],
                ),
            ),
            (
                "experience_certificate",
                "Experience_Certificate_NITB.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "NATIONAL INFORMATION TECHNOLOGY BOARD (NITB)",
                    [
                        "Experience & Relieving Certificate",
                        "Muhammad Ali Khan worked as Assistant Software Engineer from Aug 2020 to Dec 2022.",
                    ],
                ),
            ),
            (
                "character_certificate",
                "Character_Certificate.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "CHARACTER AND CONDUCT CERTIFICATE",
                    [
                        "This is to certify that Muhammad Ali Khan bears good moral character",
                        "and has no disciplinary or criminal record.",
                    ],
                ),
            ),
            (
                "pec_registration",
                "PEC_Registration_Card.pdf",
                "application/pdf",
                make_dummy_pdf(
                    "PAKISTAN ENGINEERING COUNCIL (PEC)",
                    [
                        "Professional Engineer Certificate",
                        "Registration No: COMP-48291 | Discipline: Computer Engineering",
                        "Valid Until: 31-Dec-2028",
                    ],
                ),
            ),
        ]

        doc_objs = {}
        now = datetime.now(UTC)
        for type_code, orig_name, content_type, content_bytes in doc_specs:
            doc = db.session.scalar(
                select(Document).where(
                    Document.profile_id == profile.id,
                    Document.document_type_code == type_code,
                    Document.archived_at.is_(None),
                )
            )
            storage_key = f"{uuid.uuid4().hex}.{'png' if content_type == 'image/png' else 'pdf'}"
            file_path = upload_dir / storage_key
            file_path.write_bytes(content_bytes)

            if doc is None:
                doc = Document(
                    profile_id=profile.id,
                    document_type_code=type_code,
                    original_filename=orig_name,
                    storage_key=storage_key,
                    content_type=content_type,
                    size_bytes=len(content_bytes),
                    uploaded_at=now - timedelta(days=5),
                )
                db.session.add(doc)
            else:
                doc.original_filename = orig_name
                doc.storage_key = storage_key
                doc.content_type = content_type
                doc.size_bytes = len(content_bytes)
            db.session.flush()
            doc_objs[type_code] = doc

        print("6. Seeding education, experience, registrations, references...")
        # Clear existing records for profile to allow idempotent re-seed
        EducationRecord.query.filter_by(profile_id=profile.id).delete()
        ExperienceRecord.query.filter_by(profile_id=profile.id).delete()
        ProfessionalRegistration.query.filter_by(profile_id=profile.id).delete()
        CandidateReference.query.filter_by(profile_id=profile.id).delete()
        db.session.flush()

        edu1 = EducationRecord(
            profile_id=profile.id,
            qualification_level_code="matric",
            discipline="Science",
            institution="Govt Central Model School, Lahore",
            passing_year=2014,
            marks_percent=Decimal("85.50"),
            certificate_document_id=doc_objs["matric_certificate"].id,
        )
        edu2 = EducationRecord(
            profile_id=profile.id,
            qualification_level_code="intermediate",
            discipline="Pre-Engineering",
            institution="Govt College University (GCU), Lahore",
            passing_year=2016,
            marks_percent=Decimal("81.20"),
            certificate_document_id=doc_objs["intermediate_certificate"].id,
        )
        edu3 = EducationRecord(
            profile_id=profile.id,
            qualification_level_code="bachelor16",
            discipline="BS Software Engineering",
            institution="University of Engineering and Technology (UET), Lahore",
            passing_year=2020,
            marks_percent=Decimal("79.40"),
            certificate_document_id=doc_objs["degree"].id,
        )
        db.session.add_all([edu1, edu2, edu3])

        exp1 = ExperienceRecord(
            profile_id=profile.id,
            organization="National Information Technology Board",
            designation="Assistant Software Engineer",
            start_date=date(2020, 8, 1),
            end_date=date(2022, 12, 31),
            is_current=False,
            certificate_document_id=doc_objs["experience_certificate"].id,
        )
        exp2 = ExperienceRecord(
            profile_id=profile.id,
            organization="TransLogistics Pakistan",
            designation="Systems & Cloud Engineer",
            start_date=date(2023, 1, 15),
            end_date=None,
            is_current=True,
        )
        db.session.add_all([exp1, exp2])

        reg = ProfessionalRegistration(
            profile_id=profile.id,
            body="Pakistan Engineering Council (PEC)",
            registration_no="COMP-48291",
            valid_until=date(2028, 12, 31),
            document_id=doc_objs["pec_registration"].id,
        )
        db.session.add(reg)

        ref1 = CandidateReference(
            profile_id=profile.id,
            name="Dr. Farhan Ahmed",
            designation="Professor, CS Department",
            organization="UET Lahore",
            phone="03001122334",
            email="farhan.ahmed@uet.edu.pk",
        )
        ref2 = CandidateReference(
            profile_id=profile.id,
            name="Engr. Salman Tariq",
            designation="Head of Infrastructure",
            organization="TransLogistics Pakistan",
            phone="03214455667",
            email="salman.tariq@translogistics.pk",
        )
        db.session.add_all([ref1, ref2])
        db.session.flush()

        print("7. Seeding candidate applications...")
        # Check eligibility and submit applications for Job 5 and Job 1
        jobs = {j.id: j for j in Job.query.all()}
        cur_docs = current_documents(profile)

        # Application 1: Job 5 (Assistant Director IT, BPS 17, Fee 800)
        job5 = jobs.get(5)
        if job5:
            existing_app5 = db.session.scalar(
                select(Application).where(
                    Application.profile_id == profile.id, Application.job_id == job5.id
                )
            )
            if existing_app5 is None:
                check5 = eligibility_service.check(job5, profile, cur_docs)
                dumped = ProfileSchema().dump(profile)
                snap_data = {section: dumped[section] for section in SNAPSHOT_SECTIONS}
                ref_date = eligibility_service.age_reference_date(job5)
                snap_data["ageOnReferenceDate"] = (
                    age_on(profile.dob, ref_date) if profile.dob else None
                )
                snap_data["ageReferenceDate"] = ref_date.isoformat()
                snap_data["eligibility"] = check5["items"]

                req_codes = {d.code for d in job5.required_documents}
                snap_docs = [d for d in cur_docs if d.document_type_code in req_codes]

                app5 = Application(
                    profile_id=profile.id,
                    job_id=job5.id,
                    status=ApplicationStatus.SHORTLISTED,
                    fee_amount=Decimal("800.00"),
                    fee_status=FeeStatus.PAID,
                    fee_paid_at=now - timedelta(days=2),
                    fee_reference="NBP-CH-2026-98102",
                    fee_confirmed_by_id=staff_map["admin@example.com"].id,
                    submitted_at=now - timedelta(days=3),
                )
                app5.snapshot = ApplicationSnapshot(
                    profile_data=snap_data,
                    documents=snap_docs,
                    created_at=now - timedelta(days=3),
                )
                app5.events = [
                    StatusEvent(
                        status=ApplicationStatus.SUBMITTED,
                        note="Application submitted via candidate portal.",
                        created_at=now - timedelta(days=3),
                    ),
                    StatusEvent(
                        status=ApplicationStatus.SHORTLISTED,
                        note="Candidate profile and qualifications verified. Shortlisted for written test/interview.",
                        actor_staff_id=staff_map["admin@example.com"].id,
                        created_at=now - timedelta(days=1),
                    ),
                ]
                db.session.add(app5)
                print(f"   Created Application for Job 5: {job5.title} (Status: Shortlisted, Fee: Paid)")

        # Application 2: Job 1 (Assistant Station Master, BPS 11, Fee 0)
        job1 = jobs.get(1)
        if job1:
            existing_app1 = db.session.scalar(
                select(Application).where(
                    Application.profile_id == profile.id, Application.job_id == job1.id
                )
            )
            if existing_app1 is None:
                check1 = eligibility_service.check(job1, profile, cur_docs)
                dumped = ProfileSchema().dump(profile)
                snap_data = {section: dumped[section] for section in SNAPSHOT_SECTIONS}
                ref_date = eligibility_service.age_reference_date(job1)
                snap_data["ageOnReferenceDate"] = (
                    age_on(profile.dob, ref_date) if profile.dob else None
                )
                snap_data["ageReferenceDate"] = ref_date.isoformat()
                snap_data["eligibility"] = check1["items"]

                req_codes = {d.code for d in job1.required_documents}
                snap_docs = [d for d in cur_docs if d.document_type_code in req_codes]

                app1 = Application(
                    profile_id=profile.id,
                    job_id=job1.id,
                    status=ApplicationStatus.SUBMITTED,
                    fee_amount=Decimal("0.00"),
                    fee_status=FeeStatus.NOT_REQUIRED,
                    submitted_at=now - timedelta(hours=6),
                )
                app1.snapshot = ApplicationSnapshot(
                    profile_data=snap_data,
                    documents=snap_docs,
                    created_at=now - timedelta(hours=6),
                )
                app1.events = [
                    StatusEvent(
                        status=ApplicationStatus.SUBMITTED,
                        note="Application submitted via candidate portal.",
                        created_at=now - timedelta(hours=6),
                    ),
                ]
                db.session.add(app1)
                print(f"   Created Application for Job 1: {job1.title} (Status: Submitted)")

        db.session.commit()
        print("\nSeed completed successfully!")


if __name__ == "__main__":
    seed_all()
