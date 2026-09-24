"""Lookup tables loaded by `flask seed` (T-018).

Codes match frontend/src/api/mocks/referenceData.js.
"""

from sqlalchemy import ForeignKey, SmallInteger, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class Department(db.Model):
    __tablename__ = "departments"

    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)


class Province(db.Model):
    __tablename__ = "provinces"

    code: Mapped[str] = mapped_column(String(10), primary_key=True)
    name: Mapped[str] = mapped_column(String(80), nullable=False)

    districts: Mapped[list["District"]] = relationship(
        back_populates="province", order_by="District.name"
    )


class District(db.Model):
    __tablename__ = "districts"
    __table_args__ = (UniqueConstraint("province_code", "name"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    province_code: Mapped[str] = mapped_column(ForeignKey("provinces.code"), nullable=False)
    name: Mapped[str] = mapped_column(String(80), nullable=False)

    province: Mapped[Province] = relationship(back_populates="districts")


class QualificationLevel(db.Model):
    __tablename__ = "qualification_levels"

    code: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    # Orders levels so a job's minimum can be compared with a candidate's highest level.
    rank: Mapped[int] = mapped_column(SmallInteger, nullable=False)


class DocumentType(db.Model):
    __tablename__ = "document_types"

    code: Mapped[str] = mapped_column(String(40), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
