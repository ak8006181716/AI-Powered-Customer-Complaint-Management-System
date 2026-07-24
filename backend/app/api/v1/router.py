from fastapi import APIRouter
from app.api.v1.endpoints import chat, upload, complaints

api_router = APIRouter()

api_router.include_router(chat.router, tags=["AI Chat Intake"])
api_router.include_router(upload.router, tags=["Document Upload"])
api_router.include_router(complaints.router, tags=["Complaints Management"])
