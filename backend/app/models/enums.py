"""Fixed value sets used by models. Values are what the API and database store."""

from enum import StrEnum


class Gender(StrEnum):
    MALE = "male"
    FEMALE = "female"
    TRANSGENDER = "transgender"


class StaffRole(StrEnum):
    JOB_CREATOR = "job_creator"
    APPROVER = "approver"
    ADMIN = "admin"


class EmploymentType(StrEnum):
    PERMANENT = "permanent"
    CONTRACT = "contract"


class JobStatus(StrEnum):
    DRAFT = "draft"
    PENDING_APPROVAL = "pending_approval"
    RETURNED = "returned"
    REJECTED = "rejected"
    APPROVED = "approved"  # locked, waiting for its opening date
    PUBLISHED = "published"  # final: no edits, no corrigendum
    CLOSED = "closed"


class ApprovalAction(StrEnum):
    APPROVED = "approved"
    RETURNED = "returned"
    REJECTED = "rejected"


class QuotaCategory(StrEnum):
    OPEN_MERIT = "open_merit"
    PROVINCIAL = "provincial"
    WOMEN = "women"
    MINORITY = "minority"
    DISABILITY = "disability"


class ApplicationStatus(StrEnum):
    """Master flow §4.9 expanded statuses. REJECTED can follow any step."""

    SUBMITTED = "submitted"
    UNDER_REVIEW = "under_review"
    REJECTED = "rejected"
    SHORTLISTED = "shortlisted"
    ADMIT_CARD_ISSUED = "admit_card_issued"
    TEST_INTERVIEW = "test_interview"
    RESULT = "result"
    MERIT_LIST = "merit_list"
    DOCUMENT_VERIFICATION = "document_verification"
    MEDICAL = "medical"
    OFFER = "offer"


class MobileOperator(StrEnum):
    JAZZ = "jazz"
    ONIC = "onic"
    TELENOR = "telenor"
    UFONE = "ufone"
    ZONG = "zong"


class FeeStatus(StrEnum):
    """Application fee (T-063): paid by bank challan; staff confirm payment."""

    NOT_REQUIRED = "not_required"
    UNPAID = "unpaid"
    PAID = "paid"


class QuotaClaim(StrEnum):
    """The quota a candidate applies under; staff verify the proof. Open question 8."""

    OPEN_MERIT = "open_merit"
    RAILWAY_EMPLOYEE_CHILD = "railway_employee_child"
    MINORITY = "minority"
    DISABILITY = "disability"
    EX_SERVICEMAN = "ex_serviceman"
    ORPHAN = "orphan"


class AgeRelaxationClaim(StrEnum):
    """One age-relaxation claim per candidate (staff verify it). Rules pending open question 8."""

    NONE = "none"
    RAILWAY_EMPLOYEE_CHILD = "railway_employee_child"
    GOVERNMENT_SERVANT = "government_servant"


class TradeCertificate(StrEnum):
    NONE = "none"
    CARPENTER = "carpenter"
    ELECTRICIAN = "electrician"
    FITTER = "fitter"
    WELDER = "welder"


class OtpPurpose(StrEnum):
    SIGNUP = "signup"
    LOGIN = "login"
    APPLY = "apply"  # identity re-check in the apply wizard
