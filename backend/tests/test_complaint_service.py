import pytest
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.database.session import Base
from app.services.complaint_service import ComplaintService

@pytest.mark.asyncio
async def test_process_chat_message_quantity_correction():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with async_session() as session:
        # Step 1: Intake original complaint
        complaint, reply, steps = await ComplaintService.process_chat_message(
            db=session,
            user_message="Customer reported 50 damaged capsules for batch BMX240601",
            complaint_id=None
        )
        assert complaint.quantity_affected == "50 capsules"

        # Step 2: User corrects quantity via chat message: "quantity is 48 not 50"
        updated_complaint, edit_reply, edit_steps = await ComplaintService.process_chat_message(
            db=session,
            user_message="quantity is 48 not 50",
            complaint_id=complaint.id
        )
        assert updated_complaint.quantity_affected == "48 capsules"
        assert edit_reply == 'Got it. I have updated the Affected Quantity to "48 capsules" in the form.'

    await engine.dispose()
