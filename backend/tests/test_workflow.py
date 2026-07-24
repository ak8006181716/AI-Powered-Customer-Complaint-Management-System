import pytest
from app.langgraph.workflow import complaint_workflow

@pytest.mark.asyncio
async def test_complaint_intake_workflow():
    prompt = "Apollo Pharmacy reported discolored capsules in Amoxicillin Capsules 500 mg. Batch number AMX240602. Manufacturing date March 2026. Expiry date February 2028. Please log this complaint"
    res = await complaint_workflow.run(user_request=prompt)
    
    data = res.get("complaint_data", {})
    assert data.get("complaint_source") == "Pharmacy"
    assert data.get("customer_name") == "Apollo Pharmacy"
    assert "Amoxicillin" in data.get("product_name")
    assert data.get("batch_number") == "AMX240602"
    assert data.get("manufacturing_date") == "March 2026"
    assert data.get("expiry_date") == "February 2028"

@pytest.mark.asyncio
async def test_targeted_edit_workflow():
    initial_data = {
        'complaint_source': 'Pharmacy',
        'customer_name': 'Apollo Pharmacy',
        'product_name': 'Amoxicillin Capsules',
        'strength': '500 mg',
        'batch_number': 'AMX240602',
        'manufacturing_date': 'March 2026',
        'expiry_date': 'February 2028',
        'quantity_affected': '12 capsules'
    }
    edit_prompt = "ah sorry the batch number is BMX240602 and affected quantity is 48 capcules"
    
    res = await complaint_workflow.run(
        user_request=edit_prompt,
        existing_complaint_data=initial_data,
        existing_complaint_id="test_id"
    )
    
    data = res.get("complaint_data", {})
    assert data.get("batch_number") == "BMX240602"
    assert data.get("quantity_affected") == "48 capcules"
    assert data.get("manufacturing_date") == "March 2026"
    assert data.get("expiry_date") == "February 2028"
