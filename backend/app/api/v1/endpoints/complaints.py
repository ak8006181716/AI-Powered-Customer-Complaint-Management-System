from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.complaint import ComplaintResponse, LLMComplaintPayload
from app.repositories.complaint_repository import ComplaintRepository

router = APIRouter()

@router.get("/complaints", response_model=List[ComplaintResponse])
async def list_complaints(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """GET /api/v1/complaints - Fetch list of all complaint records."""
    repo = ComplaintRepository(db)
    complaints = await repo.list_all(limit=limit, offset=offset)
    return [ComplaintResponse.model_validate(c) for c in complaints]

@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(
    complaint_id: str,
    db: AsyncSession = Depends(get_db)
):
    """GET /api/v1/complaints/{id} - Get single complaint details."""
    repo = ComplaintRepository(db)
    complaint = await repo.get_by_id(complaint_id)
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' not found"
        )
    return ComplaintResponse.model_validate(complaint)

@router.post("/complaints", response_model=ComplaintResponse, status_code=status.HTTP_201_CREATED)
async def create_complaint(
    payload: LLMComplaintPayload,
    db: AsyncSession = Depends(get_db)
):
    """POST /api/v1/complaints - Create raw complaint record directly."""
    repo = ComplaintRepository(db)
    complaint = await repo.create(payload.model_dump())
    await repo.add_history(complaint.id, "Direct Manual Creation", snapshot=payload.model_dump())
    return ComplaintResponse.model_validate(complaint)

@router.put("/complaints/{complaint_id}", response_model=ComplaintResponse)
async def update_complaint(
    complaint_id: str,
    payload: LLMComplaintPayload,
    db: AsyncSession = Depends(get_db)
):
    """PUT /api/v1/complaints/{id} - Update complaint record."""
    repo = ComplaintRepository(db)
    complaint = await repo.update(complaint_id, payload.model_dump())
    if not complaint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Complaint with ID '{complaint_id}' not found"
        )
    await repo.add_history(complaint_id, "Direct Form Update", snapshot=payload.model_dump())
    return ComplaintResponse.model_validate(complaint)
