import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

class Complaint(Base):
    __tablename__ = "complaints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # 10 Standard Extracted Fields
    complaint_source: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    customer_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    product_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    strength: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    batch_number: Mapped[Optional[str]] = mapped_column(String(100), index=True, nullable=True)
    manufacturing_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    expiry_date: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    quantity_affected: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    complaint_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Auto-Generated AI Analytics Fields
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    severity: Mapped[Optional[str]] = mapped_column(String(50), default="Medium") # Critical, Major, Minor
    priority: Mapped[Optional[str]] = mapped_column(String(50), default="Medium") # High, Medium, Low
    root_cause: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    recommended_actions: Mapped[Optional[list]] = mapped_column(JSON, default=list) # List of CAPA actions

    # Completeness & Duplicate Detection Metrics
    completeness_score: Mapped[float] = mapped_column(Float, default=0.0)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False)
    duplicate_reference_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)

    # Workflow Status & Ownership
    status: Mapped[str] = mapped_column(String(50), default="Intake", index=True)
    created_by: Mapped[Optional[str]] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), 
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    created_by_user = relationship("User", back_populates="complaints")
    documents = relationship("ComplaintDocument", back_populates="complaint", cascade="all, delete-orphan")
    history = relationship("ComplaintHistory", back_populates="complaint", cascade="all, delete-orphan")
    assessments = relationship("AIAssessment", back_populates="complaint", cascade="all, delete-orphan")
