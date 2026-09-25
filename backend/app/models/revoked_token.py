"""Login tokens ended early by logging out. Checked on every authenticated request."""

from datetime import datetime

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.extensions import db


class RevokedToken(db.Model):
    __tablename__ = "revoked_tokens"

    jti: Mapped[str] = mapped_column(String(36), primary_key=True)
    # After this the token has expired anyway, so the row can be deleted.
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
