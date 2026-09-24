"""One approver's decision on a job (T-015, master flow §3.2)."""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db
from app.models.base import enum_type
from app.models.enums import ApprovalAction


class ApprovalRecord(db.Model):
    __tablename__ = "approval_records"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_id: Mapped[int] = mapped_column(ForeignKey("jobs.id"), index=True, nullable=False)
    approver_id: Mapped[int] = mapped_column(ForeignKey("staff_users.id"), nullable=False)
    action: Mapped[ApprovalAction] = mapped_column(
        enum_type(ApprovalAction, "approval_action"), nullable=False
    )
    comments: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    job = relationship("Job", back_populates="approvals")
    approver = relationship("StaffUser")
