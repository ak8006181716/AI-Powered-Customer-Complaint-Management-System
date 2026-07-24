import logging
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from langgraph.graph import StateGraph, END
try:
    from langgraph.graph import START
except ImportError:
    START = "__start__"

from app.langgraph.state import ComplaintState
from app.langgraph.nodes import (
    intent_detection_node,
    document_parser_node,
    complaint_extractor_node,
    risk_assessment_node,
    completeness_checker_node,
    duplicate_detector_node,
    persistence_node
)

logger = logging.getLogger("pharma_app.langgraph_workflow")

def _route_intent(state: ComplaintState) -> str:
    """Conditional router function for intent detection branching."""
    if state.get("intent") == "DOCUMENT_UPLOAD":
        return "document_parser"
    return "complaint_extractor"

def create_pharma_complaint_graph():
    """Builds and compiles the official LangGraph StateGraph pipeline."""
    builder = StateGraph(ComplaintState)

    # Register Nodes
    builder.add_node("intent_detection", intent_detection_node)
    builder.add_node("document_parser", document_parser_node)
    builder.add_node("complaint_extractor", complaint_extractor_node)
    builder.add_node("risk_assessment", risk_assessment_node)
    builder.add_node("completeness_checker", completeness_checker_node)
    builder.add_node("duplicate_detector", duplicate_detector_node)
    builder.add_node("persistence", persistence_node)

    # Set Entry Point
    builder.set_entry_point("intent_detection")

    # Add Conditional Edges from Intent Detection
    builder.add_conditional_edges(
        "intent_detection",
        _route_intent,
        {
            "document_parser": "document_parser",
            "complaint_extractor": "complaint_extractor"
        }
    )

    # Add Directed Edges
    builder.add_edge("document_parser", "complaint_extractor")
    builder.add_edge("complaint_extractor", "risk_assessment")
    builder.add_edge("risk_assessment", "completeness_checker")
    builder.add_edge("completeness_checker", "duplicate_detector")
    builder.add_edge("duplicate_detector", "persistence")
    builder.add_edge("persistence", END)

    return builder.compile()

class PharmaComplaintWorkflow:
    def __init__(self):
        logger.info("Initializing Pharma Complaint LangGraph StateGraph Engine")
        self.app = create_pharma_complaint_graph()

    async def run(
        self,
        user_request: str,
        existing_complaint_data: Optional[Dict[str, Any]] = None,
        existing_complaint_id: Optional[str] = None,
        document_text: Optional[str] = None,
        document_name: Optional[str] = None,
        db: Optional[AsyncSession] = None
    ) -> ComplaintState:
        """
        Executes the compiled LangGraph StateGraph pipeline:
        START -> Intent Detection -> (Conditional Branch: Document Parser) -> Complaint Extractor 
        -> Risk Assessment -> Completeness Checker -> Duplicate Detector -> Persistence -> END
        """
        initial_state: ComplaintState = {
            "user_request": user_request,
            "existing_complaint_id": existing_complaint_id,
            "complaint_data": existing_complaint_data or {},
            "document_text": document_text,
            "document_name": document_name,
            "intent": "",
            "risk_assessment": {},
            "completeness_score": 0.0,
            "is_duplicate": False,
            "duplicate_reference_id": None,
            "db": db,
            "progress_steps": ["Uploading" if document_text else "Starting intake analysis"],
            "error": None
        }

        try:
            final_state = await self.app.ainvoke(initial_state)
            return final_state
        except Exception as e:
            logger.error(f"Error during LangGraph execution: {e}", exc_info=True)
            initial_state["error"] = str(e)
            initial_state["progress_steps"].append(f"Error: {e}")
            return initial_state

complaint_workflow = PharmaComplaintWorkflow()
