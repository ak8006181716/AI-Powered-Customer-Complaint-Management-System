import pytest
from app.services.llm_service import llm_service

def test_heuristic_edit_quantity_correction_simple():
    state = {"quantity_affected": "50 capsules", "batch_number": "BMX100"}
    updated = llm_service._heuristic_edit_processor("quantity is 48 not 50", state)
    assert updated["quantity_affected"] == "48 capsules"

def test_heuristic_edit_quantity_correction_no_state_unit():
    state = {"quantity_affected": "", "batch_number": "BMX100"}
    updated = llm_service._heuristic_edit_processor("quantity is 48 not 50", state)
    assert updated["quantity_affected"] == "48 units"

def test_heuristic_edit_quantity_correction_with_unit_before():
    state = {"quantity_affected": "", "batch_number": "BMX100"}
    updated = llm_service._heuristic_edit_processor("quantity is 48 capsules not 50", state)
    assert updated["quantity_affected"] == "48 capsules"

def test_heuristic_edit_quantity_correction_with_unit_after():
    state = {"quantity_affected": "", "batch_number": "BMX100"}
    updated = llm_service._heuristic_edit_processor("quantity is 48 not 50 capsules", state)
    assert updated["quantity_affected"] == "48 capsules"

def test_heuristic_edit_quantity_and_batch_combo():
    state = {"quantity_affected": "50 units", "batch_number": "OLD123"}
    request = "sorry the batch number is BMX240602 and affected quantity is 48 not 50"
    updated = llm_service._heuristic_edit_processor(request, state)
    assert updated["batch_number"] == "BMX240602"
    assert updated["quantity_affected"] == "48 units"

def test_heuristic_edit_quantity_declaration():
    state = {"quantity_affected": "50 capsules"}
    updated = llm_service._heuristic_edit_processor("change quantity to 48", state)
    assert updated["quantity_affected"] == "48 capsules"

@pytest.mark.asyncio
async def test_extract_complaint_quantity_omitted_defaults_to_not_specified():
    text = "Apollo Pharmacy reported discolored capsules in Amoxicillin Capsules 500 mg. Batch number AMX240602. Manufacturing date March 2026. Expiry date February 2028. Please log this complaint"
    extracted = await llm_service.extract_complaint(text)
    assert extracted["quantity_affected"] == "Not specified"
    assert extracted["customer_name"] == "Apollo Pharmacy"
    assert extracted["batch_number"] == "AMX240602"

