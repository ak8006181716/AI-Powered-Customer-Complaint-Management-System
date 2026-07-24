from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, ConfigDict

# LLM Structured Output Schema
class LLMComplaintPayload(BaseModel):
    complaint_source: str = Field(default="", description="Source of complaint (e.g. Hospital, Pharmacy, Patient)")
    customer_name: str = Field(default="", description="Customer or healthcare institution name")
    product_name: str = Field(default="", description="Name of the pharmaceutical product")
    strength: str = Field(default="", description="Product dosage or strength (e.g. 500mg, 10mg/mL)")
    batch_number: str = Field(default="", description="Lot or Batch number")
    manufacturing_date: str = Field(default="", description="Manufacturing date YYYY-MM-DD or readable format")
    expiry_date: str = Field(default="", description="Expiration date YYYY-MM-DD or readable format")
    quantity_affected: str = Field(default="", description="Number of damaged/affected units")
    complaint_type: str = Field(default="", description="Category (e.g. Damaged Bottles, Contamination, Potency Defect)")
    description: str = Field(default="", description="Detailed narrative of the complaint")
    summary: str = Field(default="", description="Concise executive summary")
    severity: str = Field(default="Medium", description="Critical, Major, or Minor")
    priority: str = Field(default="Medium", description="High, Medium, or Low")
    root_cause: str = Field(default="", description="Possible root cause analysis based on cGMP standards")
    recommended_actions: List[str] = Field(default_factory=list, description="Recommended CAPA steps")

# Risk Assessment Schema
class RiskAssessmentSchema(BaseModel):
    severity: str
    priority: str
    summary: str
    root_cause: str
    recommended_actions: List[str]
    risk_score: float = Field(default=5.0)

# Complaint Response Schema
class ComplaintResponse(BaseModel):
    id: str
    complaint_source: Optional[str] = ""
    customer_name: Optional[str] = ""
    product_name: Optional[str] = ""
    strength: Optional[str] = ""
    batch_number: Optional[str] = ""
    manufacturing_date: Optional[str] = ""
    expiry_date: Optional[str] = ""
    quantity_affected: Optional[str] = ""
    complaint_type: Optional[str] = ""
    description: Optional[str] = ""
    
    summary: Optional[str] = ""
    severity: Optional[str] = "Medium"
    priority: Optional[str] = "Medium"
    root_cause: Optional[str] = ""
    recommended_actions: List[str] = Field(default_factory=list)
    
    completeness_score: float = 0.0
    is_duplicate: bool = False
    duplicate_reference_id: Optional[str] = None
    status: str = "Intake"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Chat Request & Response Schemas
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User message or prompt for AI intake/edit")
    complaint_id: Optional[str] = Field(default=None, description="Existing complaint ID if editing")

class ChatResponse(BaseModel):
    status: str = Field(default="success")
    reply: str = Field(..., description="AI response text")
    complaint: Optional[ComplaintResponse] = None
    extraction_progress: List[str] = Field(default_factory=list)

# Document Upload Response
class DocumentUploadResponse(BaseModel):
    status: str = Field(default="success")
    document_id: str
    file_name: str
    extracted_text: str
    complaint: Optional[ComplaintResponse] = None
    extraction_progress: List[str] = Field(default_factory=list)
