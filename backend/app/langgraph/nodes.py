import logging
from typing import Dict, Any
from sqlalchemy import select
from app.langgraph.state import ComplaintState
from app.services.llm_service import llm_service
from app.models.complaint import Complaint

logger = logging.getLogger("pharma_app.langgraph_nodes")

async def intent_detection_node(state: ComplaintState) -> Dict[str, Any]:
    """Node 1: Detect user intent (New, Edit, Document Upload)."""
    user_request = state.get("user_request", "")
    existing_id = state.get("existing_complaint_id")
    document_text = state.get("document_text")

    progress = list(state.get("progress_steps") or [])
    progress.append("Analyzing user request & intent")

    if document_text:
        intent = "DOCUMENT_UPLOAD"
    elif existing_id or any(kw in user_request.lower() for kw in ["change", "update", "set", "batch is", "quantity to", "batch number is"]):
        intent = "EDIT_COMPLAINT"
    else:
        intent = "NEW_COMPLAINT"

    logger.info(f"Intent detected: {intent}")
    return {
        "intent": intent,
        "progress_steps": progress
    }

async def document_parser_node(state: ComplaintState) -> Dict[str, Any]:
    """Node 2: Extract text from document if upload."""
    progress = list(state.get("progress_steps") or [])
    progress.append("Extracting document content")

    doc_text = state.get("document_text", "")
    return {
        "user_request": doc_text,
        "progress_steps": progress
    }

async def complaint_extractor_node(state: ComplaintState) -> Dict[str, Any]:
    """Node 3: Structured complaint data extraction or targeted edit."""
    intent = state.get("intent", "NEW_COMPLAINT")
    user_req = state.get("user_request", "")
    current_data = state.get("complaint_data") or {}
    progress = list(state.get("progress_steps") or [])
    
    progress.append("Analyzing complaint details")

    if intent == "EDIT_COMPLAINT" and current_data:
        updated_data = await llm_service.process_edit(user_req, current_data)
    else:
        updated_data = await llm_service.extract_complaint(user_req)

    return {
        "complaint_data": updated_data,
        "progress_steps": progress
    }

async def risk_assessment_node(state: ComplaintState) -> Dict[str, Any]:
    """Node 4: AI Risk Assessment calculation."""
    complaint_data = dict(state.get("complaint_data") or {})
    progress = list(state.get("progress_steps") or [])
    
    progress.append("Generating Risk Assessment")

    risk_data = await llm_service.generate_risk_assessment(complaint_data)
    complaint_data.update(risk_data)

    return {
        "complaint_data": complaint_data,
        "risk_assessment": risk_data,
        "progress_steps": progress
    }

async def completeness_checker_node(state: ComplaintState) -> Dict[str, Any]:
    """Node 5: Calculate complaint data completeness percentage."""
    data = state.get("complaint_data") or {}
    required_fields = [
        "complaint_source", "customer_name", "product_name", 
        "strength", "batch_number", "quantity_affected", 
        "complaint_type", "description"
    ]
    
    filled_count = sum(1 for field in required_fields if data.get(field))
    completeness = round((filled_count / len(required_fields)) * 100.0, 1)

    return {
        "completeness_score": completeness
    }

async def duplicate_detector_node(state: ComplaintState) -> Dict[str, Any]:
    """Node 6: Detect potential duplicate batch or customer complaints."""
    data = state.get("complaint_data") or {}
    batch = data.get("batch_number")
    product = data.get("product_name")
    db = state.get("db")
    
    is_duplicate = False
    dup_id = None

    if db and batch and len(batch) > 2:
        try:
            stmt = select(Complaint).where(
                Complaint.batch_number == batch,
                Complaint.product_name == product
            )
            res = await db.execute(stmt)
            existing = res.scalars().first()
            if existing:
                is_duplicate = True
                dup_id = existing.id
        except Exception as e:
            logger.warning(f"Duplicate detection DB query error: {e}")

    return {
        "is_duplicate": is_duplicate,
        "duplicate_reference_id": dup_id
    }

async def persistence_node(state: ComplaintState) -> Dict[str, Any]:
    """Node 7: Final state wrap-up."""
    progress = list(state.get("progress_steps") or [])
    progress.append("Completed")

    return {
        "progress_steps": progress
    }
