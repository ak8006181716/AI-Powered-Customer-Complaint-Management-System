import logging
from typing import List, Optional
from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.complaint import Complaint
from app.models.history import ComplaintHistory
from app.models.document import ComplaintDocument
from app.models.assessment import AIAssessment

logger = logging.getLogger("pharma_app.complaint_repository")

class ComplaintRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, complaint_data: dict) -> Complaint:
        """Create a new complaint record."""
        # Convert dict to Complaint model
        allowed_keys = {c.name for c in Complaint.__table__.columns}
        filtered = {k: v for k, v in complaint_data.items() if k in allowed_keys}
        
        complaint = Complaint(**filtered)
        self.db.add(complaint)
        await self.db.flush()
        return complaint

    async def get_by_id(self, complaint_id: str) -> Optional[Complaint]:
        """Fetch complaint by UUID ID."""
        stmt = select(Complaint).where(Complaint.id == complaint_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def list_all(self, limit: int = 50, offset: int = 0) -> List[Complaint]:
        """Fetch all complaints ordered by created date."""
        stmt = select(Complaint).order_by(Complaint.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def update(self, complaint_id: str, update_data: dict) -> Optional[Complaint]:
        """Update existing complaint fields."""
        complaint = await self.get_by_id(complaint_id)
        if not complaint:
            return None

        allowed_keys = {c.name for c in Complaint.__table__.columns}
        for k, v in update_data.items():
            if k in allowed_keys and v is not None:
                setattr(complaint, k, v)

        await self.db.flush()
        return complaint

    async def add_history(self, complaint_id: str, action: str, field_name: str = None, old_val: str = None, new_val: str = None, snapshot: dict = None) -> ComplaintHistory:
        """Record audit log item in ComplaintHistory table."""
        history = ComplaintHistory(
            complaint_id=complaint_id,
            action=action,
            changed_by="AI Assistant",
            field_name=field_name,
            old_value=old_val,
            new_value=new_val,
            snapshot=snapshot
        )
        self.db.add(history)
        await self.db.flush()
        return history

    async def add_document(self, complaint_id: str, file_name: str, file_type: str, file_size: int, file_path: str, extracted_text: str) -> ComplaintDocument:
        """Record uploaded document metadata."""
        doc = ComplaintDocument(
            complaint_id=complaint_id,
            file_name=file_name,
            file_type=file_type,
            file_size_bytes=file_size,
            file_path=file_path,
            extracted_text=extracted_text,
            extraction_status="Completed"
        )
        self.db.add(doc)
        await self.db.flush()
        return doc

    async def add_assessment(self, complaint_id: str, risk_data: dict) -> AIAssessment:
        """Record AI Risk Assessment snapshot."""
        assessment = AIAssessment(
            complaint_id=complaint_id,
            model_version="gemma2-9b-it",
            severity_assessment=risk_data.get("severity", "Medium"),
            priority_assessment=risk_data.get("priority", "Medium"),
            summary=risk_data.get("summary", ""),
            root_cause_analysis=risk_data.get("root_cause", ""),
            capa_recommendations=risk_data.get("recommended_actions", []),
            risk_score=7.5 if risk_data.get("severity") == "Critical" else (5.0 if risk_data.get("severity") == "Major" else 2.5)
        )
        self.db.add(assessment)
        await self.db.flush()
        return assessment
