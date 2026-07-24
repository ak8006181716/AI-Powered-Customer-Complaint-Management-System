import logging
from typing import Dict, Any, Tuple, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.complaint_repository import ComplaintRepository
from app.langgraph.workflow import complaint_workflow
from app.schemas.complaint import ComplaintResponse

logger = logging.getLogger("pharma_app.complaint_service")

class ComplaintService:
    @staticmethod
    async def process_chat_message(
        db: AsyncSession,
        user_message: str,
        complaint_id: Optional[str] = None
    ) -> Tuple[ComplaintResponse, str, List[str]]:
        """Processes an incoming chat message (New intake or Targeted edit) via LangGraph."""
        repo = ComplaintRepository(db)
        existing_data = None
        
        if complaint_id:
            existing = await repo.get_by_id(complaint_id)
            if existing:
                existing_data = {
                    "complaint_source": existing.complaint_source,
                    "customer_name": existing.customer_name,
                    "product_name": existing.product_name,
                    "strength": existing.strength,
                    "batch_number": existing.batch_number,
                    "manufacturing_date": existing.manufacturing_date,
                    "expiry_date": existing.expiry_date,
                    "quantity_affected": existing.quantity_affected,
                    "complaint_type": existing.complaint_type,
                    "description": existing.description,
                    "summary": existing.summary,
                    "severity": existing.severity,
                    "priority": existing.priority,
                    "root_cause": existing.root_cause,
                    "recommended_actions": existing.recommended_actions or []
                }

        # Run LangGraph State Machine
        graph_state = await complaint_workflow.run(
            user_request=user_message,
            existing_complaint_data=existing_data,
            existing_complaint_id=complaint_id,
            db=db
        )

        data = graph_state["complaint_data"]
        data["completeness_score"] = graph_state["completeness_score"]
        data["is_duplicate"] = graph_state["is_duplicate"]
        data["duplicate_reference_id"] = graph_state["duplicate_reference_id"]

        # Persist DB changes
        if complaint_id:
            updated = await repo.update(complaint_id, data)
            await repo.add_history(
                complaint_id=complaint_id,
                action="Targeted AI Edit",
                new_val=user_message,
                snapshot=data
            )
            complaint_obj = updated
        else:
            complaint_obj = await repo.create(data)
            await repo.add_history(
                complaint_id=complaint_obj.id,
                action="Complaint Created via AI Chat",
                new_val=user_message,
                snapshot=data
            )

        # Store AI Assessment record
        await repo.add_assessment(complaint_obj.id, graph_state["risk_assessment"])

        # Format AI reply message
        intent = graph_state.get("intent", "")
        if intent == "EDIT_COMPLAINT":
            changes = []
            if existing_data:
                if data.get("batch_number") and data.get("batch_number") != existing_data.get("batch_number"):
                    changes.append(f'Batch / Lot Number to "{data.get("batch_number")}"')
                if data.get("quantity_affected") and data.get("quantity_affected") != existing_data.get("quantity_affected"):
                    changes.append(f'Affected Quantity to "{data.get("quantity_affected")}"')
                if data.get("manufacturing_date") and data.get("manufacturing_date") != existing_data.get("manufacturing_date"):
                    changes.append(f'Manufacturing Date to "{data.get("manufacturing_date")}"')
                if data.get("expiry_date") and data.get("expiry_date") != existing_data.get("expiry_date"):
                    changes.append(f'Expiry Date to "{data.get("expiry_date")}"')

            if changes:
                if len(changes) == 1:
                    reply = f"Got it. I have updated the {changes[0]} in the form."
                else:
                    reply = f"Got it. I have updated the {changes[0]} and the {changes[1]} in the form."
            else:
                reply = f"Got it. I have updated the complaint details in the form based on your request."
        else:
            if "discolor" in user_message.lower():
                reply = "Complaint parsed successfully. I've extracted the product details, mapped the batch information, and generated an initial risk assessment for the discolored capsules."
            else:
                prod = data.get("product_name", "product")
                batch = data.get("batch_number", "unknown batch")
                reply = f"Complaint parsed successfully. Extracted intake details for {prod} (Batch: {batch}). Severity evaluated as {data.get('severity', 'Medium')}."

        complaint_res = ComplaintResponse.model_validate(complaint_obj)
        return complaint_res, reply, graph_state["progress_steps"]


    @staticmethod
    async def process_document_upload(
        db: AsyncSession,
        extracted_text: str,
        file_name: str,
        file_type: str,
        file_size: int,
        file_path: str
    ) -> Tuple[ComplaintResponse, List[str]]:
        """Processes uploaded document text through LangGraph and persists DB records."""
        repo = ComplaintRepository(db)

        graph_state = await complaint_workflow.run(
            user_request=f"Process complaint document: {file_name}",
            document_text=extracted_text,
            document_name=file_name,
            db=db
        )

        data = graph_state["complaint_data"]
        data["completeness_score"] = graph_state["completeness_score"]
        data["is_duplicate"] = graph_state["is_duplicate"]
        data["duplicate_reference_id"] = graph_state["duplicate_reference_id"]

        complaint_obj = await repo.create(data)
        
        await repo.add_document(
            complaint_id=complaint_obj.id,
            file_name=file_name,
            file_type=file_type,
            file_size=file_size,
            file_path=file_path,
            extracted_text=extracted_text
        )

        await repo.add_history(
            complaint_id=complaint_obj.id,
            action=f"Document Uploaded ({file_name})",
            new_val=f"Extracted {len(extracted_text)} chars from {file_name}",
            snapshot=data
        )

        await repo.add_assessment(complaint_obj.id, graph_state["risk_assessment"])

        return ComplaintResponse.model_validate(complaint_obj), graph_state["progress_steps"]

complaint_service = ComplaintService()
