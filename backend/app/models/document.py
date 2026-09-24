"""Document vault (T-013): uploaded once, reused across applications.

A new upload of the same type archives the previous one instead of deleting it, because
submitted application snapshots may still point to the old file.
"""

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.extensions import db


class Document(db.Model):
    __tablename__ = "documents"
    __table_args__ = (
        # At most one current (non-archived) document per type per profile.
        Index(
            "uq_documents_current_type",
            "profile_id",
            "document_type_code",
            unique=True,
            postgresql_where=text("archived_at IS NULL"),
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    profile_id: Mapped[int] = mapped_column(
        ForeignKey("candidate_profiles.id"), index=True, nullable=False
    )
    document_type_code: Mapped[str] = mapped_column(
        ForeignKey("document_types.code"), nullable=False
    )
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    profile = relationship("CandidateProfile", back_populates="documents")
