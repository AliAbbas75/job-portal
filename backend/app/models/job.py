"""Job, its structured eligibility rules and quotas (T-014, master flow §3.1).

Eligibility is structured data (qualification, marks, experience, age, domicile, documents)
so it can be checked against the profile. The description stays free text.
Once published, a job is final: no edits and no corrigendum.
"""

from datetime import UTC, date, datetime
from decimal import Decimal

from sqlalchemy import (
    ARRAY,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Table,
    Text,
    UniqueConstraint,
    text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db
from app.models.base import TimestampMixin, enum_type
from app.models.enums import EmploymentType, JobStatus, QuotaCategory

job_required_documents = Table(
    "job_required_documents",
    db.metadata,
    Column("job_id", ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
    Column("document_type_code", ForeignKey("document_types.code"), primary_key=True),
)

job_domicile_provinces = Table(
    "job_domicile_provinces",
    db.metadata,
    Column("job_id", ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
    Column("province_code", ForeignKey("provinces.code"), primary_key=True),
)


class Job(TimestampMixin, db.Model):
    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint("bps BETWEEN 1 AND 22", name="bps_range"),
        CheckConstraint("vacancies > 0", name="vacancies_positive"),
        CheckConstraint("closing_date > opening_date", name="closing_after_opening"),
        CheckConstraint("fee_amount >= 0", name="fee_not_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    department_code: Mapped[str] = mapped_column(ForeignKey("departments.code"), nullable=False)
    # Optional for jobs created before categories existed; the job form requires it.
    category_code: Mapped[str | None] = mapped_column(ForeignKey("job_categories.code"), index=True)
    bps: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    # Location, summary, description and dates may be empty on a draft requisition; submitting
    # for approval requires them (admin_job_service.missing_fields).
    location: Mapped[str | None] = mapped_column(String(80))
    employment_type: Mapped[EmploymentType] = mapped_column(
        enum_type(EmploymentType, "employment_type"), nullable=False
    )
    vacancies: Mapped[int] = mapped_column(Integer, nullable=False)
    summary: Mapped[str | None] = mapped_column(String(300))
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[JobStatus] = mapped_column(
        enum_type(JobStatus, "job_status"), default=JobStatus.DRAFT, nullable=False, index=True
    )
    requisition_ref: Mapped[str | None] = mapped_column(String(60))
    advertisement_no: Mapped[str | None] = mapped_column(String(40), unique=True)
    opening_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    closing_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Age is calculated on this date if set, otherwise on the closing date.
    age_cutoff_date: Mapped[date | None] = mapped_column(Date)
    fee_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), server_default=text("0"), nullable=False
    )
    created_by_id: Mapped[int | None] = mapped_column(ForeignKey("staff_users.id"))
    approved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    # Notes from the quick requisition form (admin panel): the quota categories ticked and the
    # recruitment KPIs. Shown to approvers; the structured quotas are what count.
    requisition: Mapped[dict] = mapped_column(JSONB, server_default="{}", nullable=False)
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    requirement: Mapped["JobRequirement"] = relationship(
        back_populates="job", uselist=False, cascade="all, delete-orphan"
    )
    quotas: Mapped[list["JobQuota"]] = relationship(
        back_populates="job", cascade="all, delete-orphan"
    )
    department = relationship("Department")
    category = relationship("JobCategory")
    required_documents = relationship("DocumentType", secondary=job_required_documents)
    domicile_provinces = relationship("Province", secondary=job_domicile_provinces)
    approvals = relationship(
        "ApprovalRecord", back_populates="job", order_by="ApprovalRecord.created_at"
    )

    def is_open(self, now=None):
        """Published, past its opening date and before its closing date."""
        now = now or datetime.now(UTC)
        return self.status == JobStatus.PUBLISHED and self.opening_date <= now < self.closing_date


class JobRequirement(db.Model):
    """Structured eligibility rules for one job.

    An empty `domicile_provinces` list on the job means any province.
    """

    __tablename__ = "job_requirements"
    __table_args__ = (
        CheckConstraint("min_marks_percent BETWEEN 0 AND 100", name="min_marks_range"),
        CheckConstraint("min_experience_years >= 0", name="experience_not_negative"),
        CheckConstraint("age_min > 0 AND age_max >= age_min", name="age_range_valid"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(
        ForeignKey("jobs.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    min_qualification_code: Mapped[str] = mapped_column(
        ForeignKey("qualification_levels.code"), nullable=False
    )
    # Empty means any discipline.
    accepted_disciplines: Mapped[list[str]] = mapped_column(
        ARRAY(String(120)), server_default=text("'{}'"), nullable=False
    )
    min_marks_percent: Mapped[Decimal | None] = mapped_column(Numeric(5, 2))
    min_experience_years: Mapped[Decimal] = mapped_column(
        Numeric(4, 1), server_default=text("0"), nullable=False
    )
    age_min: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    age_max: Mapped[int] = mapped_column(SmallInteger, nullable=False)

    job: Mapped[Job] = relationship(back_populates="requirement")


class JobQuota(db.Model):
    __tablename__ = "job_quotas"
    __table_args__ = (
        UniqueConstraint("job_id", "category"),
        CheckConstraint("seats > 0", name="seats_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    category: Mapped[QuotaCategory] = mapped_column(
        enum_type(QuotaCategory, "quota_category"), nullable=False
    )
    seats: Mapped[int] = mapped_column(Integer, nullable=False)

    job: Mapped[Job] = relationship(back_populates="quotas")
