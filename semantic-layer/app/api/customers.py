from fastapi import APIRouter, Path, HTTPException
from app.services.customer_service import customer_service
from app.schemas.responses import SemanticResponse

router = APIRouter()

@router.get("/{id}/profile", response_model=SemanticResponse)
async def get_profile(id: str = Path(..., description="Unique Customer ID (e.g. C-001)")):
    res = await customer_service.get_profile(id)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res

@router.get("/{id}/accounts", response_model=SemanticResponse)
async def get_accounts(id: str = Path(..., description="Unique Customer ID")):
    res = await customer_service.get_accounts(id)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res

@router.get("/{id}/financial-health", response_model=SemanticResponse)
async def get_financial_health(id: str = Path(..., description="Unique Customer ID")):
    res = await customer_service.get_financial_health(id)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res

@router.get("/{id}/journey", response_model=SemanticResponse)
async def get_journey(id: str = Path(..., description="Unique Customer ID")):
    res = await customer_service.get_journey(id)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res

@router.get("/{id}/goals", response_model=SemanticResponse)
async def get_goals(id: str = Path(..., description="Unique Customer ID")):
    res = await customer_service.get_goals(id)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res
