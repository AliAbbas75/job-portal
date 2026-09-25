"""One-time codes sent by SMS for candidate signup and login (T-021).

Only a keyed hash of the code is stored. Rows are kept for rate limiting (sends per hour).
"""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db
from app.models.base import TimestampMixin, enum_type
from app.models.enums import OtpPurpose


class OtpChallenge(TimestampMixin, db.Model):
    __tablename__ = "otp_challenges"
    __table_args__ = (CheckConstraint("attempts >= 0", name="attempts_not_negative"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    purpose: Mapped[OtpPurpose] = mapped_column(
        enum_type(OtpPurpose, "otp_purpose"), nullable=False
    )
    cnic: Mapped[str] = mapped_column(String(15), nullable=False, index=True)
    mobile: Mapped[str] = mapped_column(String(11), nullable=False, index=True)
    code_hash: Mapped[str] = mapped_column(String(64), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    # Set when the code is used or replaced by a newer one.
    consumed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
