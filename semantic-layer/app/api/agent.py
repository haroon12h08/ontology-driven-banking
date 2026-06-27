import sys
import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Add agent-platform to sys.path
sys.path.insert(0, "/home/haroon/Desktop/SBI/agent-platform")
sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")

from orchestrator.orchestrator import orchestrator

router = APIRouter()

class ChatRequest(BaseModel):
    customerId: str
    message: str

@router.post("/chat")
async def agent_chat(request: ChatRequest):
    try:
        res = await orchestrator.process_user_intent(request.customerId, request.message)
        return res
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
