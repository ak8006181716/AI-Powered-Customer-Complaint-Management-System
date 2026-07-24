# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.complaint import ChatRequest, ChatResponse
from app.services.complaint_service import complaint_service

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def process_chat(
    payload: ChatRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    POST /api/v1/chat
    Process user chat input (New intake or Targeted edit) via LangGraph.
    """
    try:
        complaint_res, reply, progress = await complaint_service.process_chat_message(
            db=db,
            user_message=payload.message,
            complaint_id=payload.complaint_id
        )

        return ChatResponse(
            status="success",
            reply=reply,
            complaint=complaint_res,
            extraction_progress=progress
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}"
        )
