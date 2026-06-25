from fastapi import APIRouter, Path, HTTPException
from app.services.operations_service import operations_service
from app.schemas.responses import SemanticResponse

router = APIRouter()

@router.get("/service-requests/pending", response_model=SemanticResponse)
async def get_pending_service_requests():
    return await operations_service.get_pending_service_requests()

@router.get("/branches", response_model=SemanticResponse)
async def get_branches():
    return await operations_service.get_branches()

@router.get("/rm/{id}/assignments", response_model=SemanticResponse)
async def get_rm_assignments(id: str = Path(..., description="Unique RM employee ID")):
    res = await operations_service.get_rm_assignments(id)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res
