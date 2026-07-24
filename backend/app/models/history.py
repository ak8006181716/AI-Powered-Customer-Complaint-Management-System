import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class ComplaintHistory(Base):
    __tablename__ = "complaint_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id: Mapped[str] = mapped_column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    
    action: Mapped[str] = mapped_column(String(100), nullable=False) # Created, Edited via AI, Document Uploaded, Status Changed
    changed_by: Mapped[str] = mapped_column(String(100), default="AI Assistant")
    
    field_name: Mapped[str] = mapped_column(String(100), nullable=True)
    old_value: Mapped[str] = mapped_column(Text, nullable=True)
    new_value: Mapped[str] = mapped_column(Text, nullable=True)
    
    snapshot: Mapped[dict] = mapped_column(JSON, nullable=True) # Full JSON snapshot of complaint state at this point
    
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    complaint = relationship("Complaint", back_populates="history")
