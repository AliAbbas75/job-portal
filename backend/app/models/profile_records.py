"""Repeatable profile sections: education, experience (T-011) and BPS-15+ sections (T-012)."""

from datetime import date
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    ForeignKey,
    Numeric,
    SmallInteger,
    String,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db
from app.models.base import TimestampMixin


class EducationRecord(TimestampMixin, db.Model):
    __tablename__ = "education_records"
    __table_args__ = (
        CheckConstraint("marks_percent BETWEEN 0 AND 100", name="marks_percent_range"),
        CheckConstraint("passing_year BETWEEN 1950 AND 2100", name="passing_year_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    qualification_level_code: Mapped[str] = mapped_column(
        ForeignKey("qualification_levels.code"), nullable=False
    )
    discipline: Mapped[str] = mapped_column(String(120), nullable=False)
    institution: Mapped[str] = mapped_column(String(160), nullable=False)
    passing_year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    marks_percent: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    certificate_document_id: Mapped[int | None] = mapped_column(ForeignKey("documents.id"))

    profile = relationship("CandidateProfile", back_populates="education")


class ExperienceRecord(TimestampMixin, db.Model):
    __tablename__ = "experience_records"
    __table_args__ = (
        CheckConstraint(
            "(is_current AND end_date IS NULL)"
            " OR (NOT is_current AND end_date IS NOT NULL AND end_date >= start_date)",
            name="dates_consistent",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    organization: Mapped[str] = mapped_column(String(160), nullable=False)
    designation: Mapped[str] = mapped_column(String(120), nullable=False)
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date | None] = mapped_column(Date)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    certificate_document_id: Mapped[int | None] = mapped_column(ForeignKey("documents.id"))

    profile = relationship("CandidateProfile", back_populates="experience")


class ProfessionalRegistration(TimestampMixin, db.Model):
    """e.g. PEC registration for engineering posts."""

    __tablename__ = "professional_registrations"

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    body: Mapped[str] = mapped_column(String(120), nullable=False)
    registration_no: Mapped[str] = mapped_column(String(60), nullable=False)
    valid_until: Mapped[date | None] = mapped_column(Date)
    document_id: Mapped[int | None] = mapped_column(ForeignKey("documents.id"))

    profile = relationship("CandidateProfile", back_populates="registrations")


class Publication(TimestampMixin, db.Model):
    __tablename__ = "publications"

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    venue: Mapped[str | None] = mapped_column(String(200))
    year: Mapped[int | None] = mapped_column(SmallInteger)
    url: Mapped[str | None] = mapped_column(String(500))

    profile = relationship("CandidateProfile", back_populates="publications")


class CandidateReference(TimestampMixin, db.Model):
    """A referee. Named to avoid the SQL keyword REFERENCES."""

    __tablename__ = "candidate_references"

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id", ondelete="CASCADE"), index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    designation: Mapped[str | None] = mapped_column(String(120))
    organization: Mapped[str | None] = mapped_column(String(160))
    phone: Mapped[str | None] = mapped_column(String(20))
    email: Mapped[str | None] = mapped_column(String(254))

    profile = relationship("CandidateProfile", back_populates="references")
