import json
import re
import logging
from typing import Dict, Any, Optional
import httpx
from app.config import settings
from app.schemas.complaint import LLMComplaintPayload, RiskAssessmentSchema
from app.prompts.pharma_prompts import (
    SYSTEM_COMPLAINT_EXTRACTOR,
    SYSTEM_RISK_ASSESSMENT,
    SYSTEM_EDIT_PROCESSOR,
    SYSTEM_INTENT_DETECTION
)

logger = logging.getLogger("pharma_app.llm_service")

class GroqLLMService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.MODEL_NAME
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

    def _extract_json_from_text(self, text: str) -> Dict[str, Any]:
        """Utility to safely extract clean JSON from LLM response text."""
        try:
            # Try direct JSON parse
            return json.loads(text.strip())
        except json.JSONDecodeError:
            pass

        # Try markdown codeblock regex
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
        if match:
            try:
                return json.loads(match.group(1))
            except json.JSONDecodeError:
                pass

        # Find first { and last }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end+1])
            except json.JSONDecodeError:
                pass

        raise ValueError("Failed to parse valid JSON from LLM output")

    async def _call_groq(self, system_prompt: str, user_prompt: str) -> str:
        """Call Groq API asynchronously using httpx."""
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.1,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(self.api_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def extract_complaint(self, text: str) -> Dict[str, Any]:
        """Extract structured 10 fields + initial risk assessment from user text."""
        try:
            if self.api_key:
                raw_response = await self._call_groq(SYSTEM_COMPLAINT_EXTRACTOR, text)
                extracted_data = self._extract_json_from_text(raw_response)
            else:
                extracted_data = self._heuristic_complaint_extractor(text)
        except Exception as e:
            logger.warning(f"Groq API call failed or unconfigured, using fallback parser: {e}")
            extracted_data = self._heuristic_complaint_extractor(text)

        # Ensure complete risk assessment is generated
        risk_data = await self.generate_risk_assessment(extracted_data)
        extracted_data.update(risk_data)
        
        return LLMComplaintPayload(**extracted_data).model_dump()

    async def generate_risk_assessment(self, complaint_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Severity, Priority, Root Cause and CAPA recommendations."""
        complaint_str = json.dumps(complaint_data, indent=2)
        try:
            if self.api_key:
                raw_response = await self._call_groq(SYSTEM_RISK_ASSESSMENT, complaint_str)
                risk = self._extract_json_from_text(raw_response)
                return risk
        except Exception as e:
            logger.warning(f"Risk assessment LLM call failed, using heuristic risk model: {e}")

        return self._heuristic_risk_assessment(complaint_data)

    async def process_edit(self, edit_request: str, current_state: Dict[str, Any]) -> Dict[str, Any]:
        """Targeted update of specific fields while preserving existing state."""
        try:
            if self.api_key:
                system_prompt = SYSTEM_EDIT_PROCESSOR.format(
                    edit_request=edit_request,
                    current_state_json=json.dumps(current_state, indent=2)
                )
                raw_response = await self._call_groq(system_prompt, f"Apply edit: {edit_request}")
                updated_data = self._extract_json_from_text(raw_response)
                return updated_data
        except Exception as e:
            logger.warning(f"LLM edit processing failed, using targeted field regex parser: {e}")

        return self._heuristic_edit_processor(edit_request, current_state)

    # Smart Heuristic Rule Engines for Zero-Failure Offline Execution
    def _heuristic_complaint_extractor(self, text: str) -> Dict[str, Any]:
        """Extract pharma complaint attributes via regex pattern matching and structured key-value parsing."""
        res = {
            "complaint_source": "Direct Customer",
            "customer_name": "",
            "product_name": "",
            "strength": "",
            "batch_number": "",
            "manufacturing_date": "",
            "expiry_date": "",
            "quantity_affected": "",
            "complaint_type": "",
            "description": text.strip(),
            "summary": "",
            "severity": "Medium",
            "priority": "Medium",
            "root_cause": "",
            "recommended_actions": []
        }

        labels = [
            "Complaint Source", "Customer Name", "Product Name", "Product Strength/Grade", "Product Strength", "Strength",
            "Batch/Lot Number", "Batch Number", "Lot Number", "Manufacturing Date",
            "Expiry Date", "Quantity Affected", "Complaint Type", "Complaint Date",
            "Complaint Description", "Initial Severity", "Initial Quality Assessment", "Priority", "Suspected Cause", "Recommended Immediate Action",
            "Field", "Value", "FieldValue"
        ]

        def get_kv(label: str) -> str:
            stops = "|".join([re.escape(w) for w in labels])
            pattern = rf"{re.escape(label)}\s*[:=]?\s*([^\n\r.]+?)(?=\s*(?:{stops})|\.|\,|\n|\r|$)"
            m = re.search(pattern, text, re.IGNORECASE)
            if m:
                val = m.group(1).strip()
                val = re.sub(r"^(?:FieldValue|Field|Value)\s*", "", val, flags=re.IGNORECASE).strip(" .,;")
                return val
            return ""

        # 1. Key-Value Extraction for structured reports (PDF / Tables)
        source_kv = get_kv("Complaint Source")
        if source_kv: res["complaint_source"] = source_kv

        cust_kv = get_kv("Customer Name")
        if cust_kv: res["customer_name"] = cust_kv

        prod_kv = get_kv("Product Name")
        if prod_kv: res["product_name"] = prod_kv

        str_kv = get_kv("Product Strength/Grade") or get_kv("Product Strength") or get_kv("Strength")
        if str_kv: res["strength"] = str_kv

        batch_kv = get_kv("Batch/Lot Number") or get_kv("Batch Number") or get_kv("Lot Number")
        if batch_kv: res["batch_number"] = batch_kv.rstrip(".").strip().upper()

        mfg_kv = get_kv("Manufacturing Date")
        if mfg_kv: res["manufacturing_date"] = mfg_kv

        exp_kv = get_kv("Expiry Date")
        if exp_kv: res["expiry_date"] = exp_kv

        qty_kv = get_kv("Quantity Affected")
        if qty_kv: res["quantity_affected"] = qty_kv

        type_kv = get_kv("Complaint Type")
        if type_kv: res["complaint_type"] = type_kv

        sev_kv = get_kv("Initial Severity") or get_kv("Severity")
        if sev_kv:
            if "high" in sev_kv.lower() or "critical" in sev_kv.lower():
                res["severity"] = "Major" if "major" in sev_kv.lower() else "High"
            else:
                res["severity"] = sev_kv.capitalize()

        prio_kv = get_kv("Priority")
        if prio_kv: res["priority"] = prio_kv.capitalize()

        # 2. Conversational & Text Regex Fallbacks if fields remain empty
        if not res["manufacturing_date"]:
            mfg_match = re.search(r"(?:manufacturing|mfg)\s+(?:date|dt)?\s*[:=]?\s*([a-zA-Z0-9\s/-]+)", text, re.IGNORECASE)
            if mfg_match:
                sub = mfg_match.group(1).split(".")[0].strip(" .,;")
                d_m = re.search(r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{1,2}[-/\s][A-Za-z0-9]+[-/\s]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})", sub, re.IGNORECASE)
                res["manufacturing_date"] = d_m.group(1) if d_m else sub

        if not res["expiry_date"]:
            exp_match = re.search(r"(?:expiry|exp)\s+(?:date|dt)?\s*[:=]?\s*([a-zA-Z0-9\s/-]+)", text, re.IGNORECASE)
            if exp_match:
                sub = exp_match.group(1).split(".")[0].strip(" .,;")
                d_m = re.search(r"((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{1,2}[-/\s][A-Za-z0-9]+[-/\s]\d{2,4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})", sub, re.IGNORECASE)
                res["expiry_date"] = d_m.group(1) if d_m else sub

        if not res["batch_number"]:
            batch_match = re.search(r"(?:batch|lot)(?:\s+number|\s+no\.?|\s+#)?\s*[:=]?\s*([a-zA-Z0-9_-]+)", text, re.IGNORECASE)
            if batch_match:
                res["batch_number"] = batch_match.group(1).rstrip(".").strip().upper()
            else:
                b_standalone = re.search(r"\b(AMX\d+|BT\d+|LOT\d+|B\d{3,})\b", text, re.IGNORECASE)
                if b_standalone: res["batch_number"] = b_standalone.group(1).rstrip(".").strip().upper()

        if not res["strength"]:
            strength_match = re.search(r"(\d+(?:\.\d+)?\s*(?:mg|g|mcg|ml|IU|%))", text, re.IGNORECASE)
            if strength_match: res["strength"] = strength_match.group(1)

        if not res["product_name"]:
            for prod in ["Paracetamol Tablets", "Paracetamol", "Amoxicillin Capsules", "Amoxicillin", "Ibuprofen", "Metformin"]:
                if prod.lower() in text.lower():
                    res["product_name"] = prod
                    break

        if not res["customer_name"]:
            cust_match = re.search(r"([A-Z][a-zA-Z0-9\s]+\s+(?:Pharmacy|Hospital|Clinic|Wholesaler|Store|Lab))", text)
            if cust_match:
                res["customer_name"] = cust_match.group(1).strip()
                if "pharmacy" in cust_match.group(1).lower():
                    res["complaint_source"] = "Pharmacy"
                elif "hospital" in cust_match.group(1).lower():
                    res["complaint_source"] = "Hospital"

        if not res["quantity_affected"]:
            qty_match = re.search(r"(\d+)\s*(capcules|capsules|damaged|broken|leaking|defective|units|bottles|tablets|vials|boxes|packs)", text, re.IGNORECASE)
            if qty_match: res["quantity_affected"] = f"{qty_match.group(1)} {qty_match.group(2)}"

        if not res["complaint_type"]:
            if "discolored" in text.lower() or "discoloration" in text.lower():
                res["complaint_type"] = "Discoloration / Physical Defect"
            elif "broken" in text.lower() or "chipped" in text.lower():
                res["complaint_type"] = "Broken Tablets"
            elif "damaged" in text.lower():
                res["complaint_type"] = "Damaged Packaging"
            else:
                res["complaint_type"] = "Packaging / Product Quality Issue"

        # 3. Description Narrative Parsing
        desc_match = re.search(r"Complaint Description\s*\n+([\s\S]+?)(?=\n\s*Initial Quality Assessment|\n\s*-\s*Initial|\Z)", text, re.IGNORECASE)
        if desc_match:
            res["description"] = desc_match.group(1).strip()

        # 4. Root Cause & Actions from Document
        cause_match = re.search(r"(?:Suspected Cause|Root Cause):\s*([^\n\r]+)", text, re.IGNORECASE)
        if cause_match:
            res["root_cause"] = cause_match.group(1).strip()

        action_match = re.search(r"(?:Recommended Immediate Action|Recommended Action):\s*([^\n\r]+)", text, re.IGNORECASE)
        if action_match:
            res["recommended_actions"] = [a.strip() for a in action_match.group(1).split(",") if a.strip()]

        return res

    def _heuristic_risk_assessment(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate structured risk metrics and CAPA recommendations."""
        desc = (data.get("description") or "").lower()
        c_type = (data.get("complaint_type") or "").lower()
        prod = data.get("product_name", "Pharmaceutical Product")
        batch = data.get("batch_number", "Unspecified Batch")
        qty = data.get("quantity_affected", "units")

        if "discolored" in desc or "discoloration" in desc or "discoloration" in c_type:
            severity = "Major"
            priority = "High"
            root_cause = "Potential moisture ingress or primary packaging seal failure leading to capsule discoloration. Requires immediate retain sample inspection and container closure testing."
            capas = [
                "Route to QA Investigation & Issue Replacement",
                "Perform container closure integrity test and retain sample physical inspection.",
                "Initiate stability study review for humidity exposure."
            ]
            summary = "Potential moisture ingress or primary packaging seal failure leading to capsule discoloration."
        elif "contamination" in desc or "sterile" in desc or "wrong product" in desc:
            severity = "Critical"
            priority = "High"
            root_cause = "Sterility failure or cross-contamination during secondary filling line operation."
            capas = [
                "Quarantine affected batch immediately across all distribution warehouses.",
                "Initiate 24-hour root-cause investigation and notify Quality Assurance Director.",
                "Perform sterility testing and environmental monitoring swab audit."
            ]
            summary = f"Critical risk complaint logged for {prod} (Batch: {batch})."
        elif "damaged" in desc or "broken" in desc or "leaking" in desc:
            severity = "Major" if "20" in qty or "50" in qty or "100" in qty else "Medium"
            priority = "High" if severity == "Major" else "Medium"
            root_cause = "Container closure integrity breach or mechanical stress during transport."
            capas = [
                "Inspect batch retain samples from packaging line for structural defects.",
                "Recalibrate container capping and cartoning machinery torque settings.",
                "Issue Quality Alert to logistics provider regarding transport handling."
            ]
            summary = f"Major quality complaint logged for {prod} (Batch: {batch})."
        else:
            severity = "Minor"
            priority = "Low"
            root_cause = "Minor cosmetic packaging anomaly during labeling run."
            capas = [
                "Log complaint in QMS database for quarterly quality trend review.",
                "Send replacement unit and apology letter to customer."
            ]
            summary = f"Customer complaint logged for {prod} (Batch: {batch}, Quantity: {qty})."

        return {
            "summary": summary,
            "severity": severity,
            "priority": priority,
            "root_cause": root_cause,
            "recommended_actions": capas
        }

    def _heuristic_edit_processor(self, edit_request: str, state: Dict[str, Any]) -> Dict[str, Any]:
        """Process targeted edit regex for field updates."""
        updated = dict(state)
        text = edit_request.strip()

        # 1. Quantity edit: e.g. "affected quantity is 48 capcules", "Change quantity to 50"
        qty_match = re.search(r"(?:quantity|qty|amount|affected quantity)\s+(?:to|is|=)?\s*(\d+\s*[a-zA-Z]*)", text, re.IGNORECASE)
        if not qty_match:
            qty_match = re.search(r"(\d+)\s*(capcules|capsules|bottles|units|tablets|vials)", text, re.IGNORECASE)
        if qty_match:
            val = qty_match.group(1).strip()
            if not any(char.isalpha() for char in val):
                val = f"{val} units"
            updated["quantity_affected"] = val

        # 2. Batch number edit: e.g. "batch number is BMX240602", "Batch BMX240602"
        batch_match = re.search(r"(?:batch|lot)(?:\s+number|\s+no\.?)?\s+(?:is|to|=)?\s*([a-zA-Z0-9_-]+)", text, re.IGNORECASE)
        if batch_match:
            updated["batch_number"] = batch_match.group(1).upper()

        # 3. Manufacturing Date edit
        mfg_match = re.search(r"(?:manufacturing|mfg)\s+(?:date|dt)?\s+(?:is|to|=)?\s*([a-zA-Z0-9\s,/-]+)", text, re.IGNORECASE)
        if mfg_match:
            updated["manufacturing_date"] = mfg_match.group(1).strip()

        # 4. Expiry Date edit
        exp_match = re.search(r"(?:expiry|exp)\s+(?:date|dt)?\s+(?:is|to|=)?\s*([a-zA-Z0-9\s,/-]+)", text, re.IGNORECASE)
        if exp_match:
            updated["expiry_date"] = exp_match.group(1).strip()

        # 5. Product name edit
        prod_match = re.search(r"(?:product|drug|medicine)\s+(?:is|to|=)?\s*([A-Za-z0-9\s]+)", text, re.IGNORECASE)
        if prod_match:
            updated["product_name"] = prod_match.group(1).strip()

        # 6. Customer edit
        cust_match = re.search(r"(?:customer|client|hospital|pharmacy)\s+(?:is|to|=)?\s*([A-Za-z0-9\s]+)", text, re.IGNORECASE)
        if cust_match:
            updated["customer_name"] = cust_match.group(1).strip()

        # Re-compute risk summary after update
        risk = self._heuristic_risk_assessment(updated)
        updated.update(risk)

        return updated


llm_service = GroqLLMService()
