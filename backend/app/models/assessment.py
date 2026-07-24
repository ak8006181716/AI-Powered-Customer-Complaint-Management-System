import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, JSON, Float, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class AIAssessment(Base):
    __tablename__ = "ai_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    complaint_id: Mapped[str] = mapped_column(String(36), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False)
    
    model_version: Mapped[str] = mapped_column(String(100), default="gemma2-9b-it")
    severity_assessment: Mapped[str] = mapped_column(String(50), nullable=False)
    priority_assessment: Mapped[str] = mapped_column(String(50), nullable=False)
    
    summary: Mapped[str] = mapped_column(Text, nullable=True)
    root_cause_analysis: Mapped[str] = mapped_column(Text, nullable=True)
    capa_recommendations: Mapped[list] = mapped_column(JSON, default=list)
    risk_score: Mapped[float] = mapped_column(Float, default=0.0) # Risk matrix score (1.0 to 10.0)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    complaint = relationship("Complaint", back_populates="assessments")
