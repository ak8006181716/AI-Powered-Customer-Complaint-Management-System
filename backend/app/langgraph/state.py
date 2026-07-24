from typing import TypedDict, Dict, Any, List, Optional

class ComplaintState(TypedDict, total=False):
    """LangGraph State object passed across workflow nodes."""
    # Active Complaint Data Payload (10 fields + severity, priority, summary, root cause, CAPA)
    complaint_data: Dict[str, Any]
    
    # Document Metadata & Extracted Text
    document_text: Optional[str]
    document_name: Optional[str]
    
    # Conversation Context
    user_request: str
    intent: str
    existing_complaint_id: Optional[str]
    
    # AI Analytics & Metrics
    risk_assessment: Dict[str, Any]
    completeness_score: float
    is_duplicate: bool
    duplicate_reference_id: Optional[str]
    
    # Database Session reference (optional for duplicate checking in nodes)
    db: Optional[Any]
    
    # Execution Progress Log Steps
    progress_steps: List[str]
    error: Optional[str]
