"""Candidate account (login identity) and the permanent profile (master flow §4.4).

One account and one profile per CNIC, created at signup and never deleted with a job or application.
Single-value profile sections are columns here; repeatable sections live in profile_records.py.
"""

from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    ARRAY,
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
    text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db
from app.models.base import TimestampMixin, enum_type
from app.models.enums import (
    AgeRelaxationClaim,
    Gender,
    MobileOperator,
    QuotaClaim,
    TradeCertificate,
)

if TYPE_CHECKING:
    from app.models.document import Document
    from app.models.profile_records import (
        CandidateReference,
        EducationRecord,
        ExperienceRecord,
        ProfessionalRegistration,
        Publication,
    )


class CandidateAccount(TimestampMixin, db.Model):
    __tablename__ = "candidate_accounts"
    __table_args__ = (
        CheckConstraint(r"cnic ~ '^\d{5}-\d{7}-\d$'", name="cnic_format"),
        CheckConstraint(r"mobile ~ '^03\d{9}$'", name="mobile_format"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    cnic: Mapped[str] = mapped_column(String(15), unique=True, nullable=False)
    mobile: Mapped[str] = mapped_column(String(11), nullable=False)
    # The candidate's network, used to route SMS (T-028). Empty for accounts made before it.
    mobile_operator: Mapped[MobileOperator | None] = mapped_column(
        enum_type(MobileOperator, "mobile_operator")
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    profile: Mapped["CandidateProfile"] = relationship(back_populates="account", uselist=False)


class CandidateProfile(TimestampMixin, db.Model):
    __tablename__ = "candidate_profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    account_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_accounts.id"), unique=True, nullable=False
    )

    # Personal. Age is never stored: it's calculated from dob for each job.
    full_name: Mapped[str | None] = mapped_column(String(120))
    father_name: Mapped[str | None] = mapped_column(String(120))
    dob: Mapped[date | None] = mapped_column(Date)
    gender: Mapped[Gender | None] = mapped_column(enum_type(Gender, "gender"))
    nationality: Mapped[str] = mapped_column(String(60), default="Pakistani", nullable=False)

    # Contact and address (mobile lives on the account).
    email: Mapped[str | None] = mapped_column(String(254))
    current_address: Mapped[str | None] = mapped_column(Text)
    permanent_address: Mapped[str | None] = mapped_column(Text)

    # Domicile.
    domicile_province_code: Mapped[str | None] = mapped_column(ForeignKey("provinces.code"))
    domicile_district_id: Mapped[int | None] = mapped_column(ForeignKey("districts.id"))

    # Additional eligibility.
    is_government_employee: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_disability: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_minority: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    skills: Mapped[list[str]] = mapped_column(
        ARRAY(String(120)), server_default=text("'{}'"), nullable=False
    )

    # Quick profile (Figma "My profile"): highest education without the full record, trade
    # certificate, and the quota / age-relaxation the candidate claims. Staff verify claims.
    highest_qualification_code: Mapped[str | None] = mapped_column(
        ForeignKey("qualification_levels.code")
    )
    trade_certificate: Mapped[TradeCertificate | None] = mapped_column(
        enum_type(TradeCertificate, "trade_certificate")
    )
    quota_claim: Mapped[QuotaClaim | None] = mapped_column(enum_type(QuotaClaim, "quota_claim"))
    age_relaxation_claim: Mapped[AgeRelaxationClaim | None] = mapped_column(
        enum_type(AgeRelaxationClaim, "age_relaxation_claim")
    )

    # BPS-15+ tier (§4.5).
    statement_of_purpose: Mapped[str | None] = mapped_column(Text)

    account: Mapped[CandidateAccount] = relationship(back_populates="profile")
    domicile_district = relationship("District")
    education: Mapped[list["EducationRecord"]] = relationship(
        back_populates="profile",
        cascade="all, delete-orphan",
        order_by="EducationRecord.passing_year",
    )
    experience: Mapped[list["ExperienceRecord"]] = relationship(
        back_populates="profile",
        cascade="all, delete-orphan",
        order_by="ExperienceRecord.start_date",
    )
    registrations: Mapped[list["ProfessionalRegistration"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )
    publications: Mapped[list["Publication"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )
    references: Mapped[list["CandidateReference"]] = relationship(
        back_populates="profile", cascade="all, delete-orphan"
    )
    documents: Mapped[list["Document"]] = relationship(back_populates="profile")
