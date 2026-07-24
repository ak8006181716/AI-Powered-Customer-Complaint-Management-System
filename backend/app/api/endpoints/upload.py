import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.schemas.complaint import DocumentUploadResponse
from app.services.document_service import document_service
from app.services.complaint_service import complaint_service

router = APIRouter()

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    POST /api/v1/upload
    Upload PDF, DOCX, TXT, or EML file, extract content, and run LangGraph extraction.
    """
    allowed_exts = {".pdf", ".docx", ".txt", ".eml", ".msg"}
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed: PDF, DOCX, TXT, EML"
        )

    try:
        content = await file.read()
        file_id = str(uuid.uuid4())
        saved_filename = f"{file_id}_{file.filename}"
        saved_path = os.path.join(UPLOAD_DIR, saved_filename)

        with open(saved_path, "wb") as f:
            f.write(content)

        extracted_text = document_service.extract_text(content, file.filename)

        complaint_res, progress = await complaint_service.process_document_upload(
            db=db,
            extracted_text=extracted_text,
            file_name=file.filename,
            file_type=ext.replace(".", "").upper(),
            file_size=len(content),
            file_path=saved_path
        )

        return DocumentUploadResponse(
            status="success",
            document_id=file_id,
            file_name=file.filename,
            extracted_text=extracted_text,
            complaint=complaint_res,
            extraction_progress=progress
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing error: {str(e)}"
        )
