"""MODEL layer: SQLAlchemy models, one module per domain entity (e.g. job.py). No HTTP or business
logic. Import every model here so Alembic can detect it.
"""

from app.models.application import Application, ApplicationSnapshot, StatusEvent
from app.models.approval import ApprovalRecord
from app.models.audit_log import AuditLog
from app.models.candidate import CandidateAccount, CandidateProfile
from app.models.document import Document
from app.models.job import Job, JobQuota, JobRequirement
from app.models.otp_challenge import OtpChallenge
from app.models.profile_records import (
    CandidateReference,
    EducationRecord,
    ExperienceRecord,
    ProfessionalRegistration,
    Publication,
)
from app.models.reference import (
    Department,
    District,
    DocumentType,
    JobCategory,
    Province,
    QualificationLevel,
)
from app.models.revoked_token import RevokedToken
from app.models.staff_user import StaffUser

__all__ = [
    "Application",
    "ApplicationSnapshot",
    "ApprovalRecord",
    "AuditLog",
    "CandidateAccount",
    "CandidateProfile",
    "CandidateReference",
    "Department",
    "District",
    "Document",
    "DocumentType",
    "EducationRecord",
    "ExperienceRecord",
    "Job",
    "JobCategory",
    "JobQuota",
    "JobRequirement",
    "OtpChallenge",
    "ProfessionalRegistration",
    "Province",
    "Publication",
    "QualificationLevel",
    "RevokedToken",
    "StaffUser",
    "StatusEvent",
]
