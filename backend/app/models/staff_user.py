"""Staff accounts (job creators, approvers, admins). Login and role checks come in T-023."""

from sqlalchemy import Boolean, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db
from app.models.base import TimestampMixin, enum_type
from app.models.enums import StaffRole


class StaffUser(TimestampMixin, db.Model):
    __tablename__ = "staff_users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    email: Mapped[str] = mapped_column(String(254), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[StaffRole] = mapped_column(enum_type(StaffRole, "staff_role"), nullable=False)
    department_code: Mapped[str | None] = mapped_column(ForeignKey("departments.code"))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
