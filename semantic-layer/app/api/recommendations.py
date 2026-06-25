from fastapi import APIRouter, Path, HTTPException
from app.services.recommendation_service import recommendation_service
from app.schemas.responses import SemanticResponse

router = APIRouter()

@router.get("/customer/{customerId}", response_model=SemanticResponse)
async def get_customer_recommendations(customerId: str = Path(..., description="Unique Customer ID")):
    res = await recommendation_service.get_customer_recommendations(customerId)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res

@router.get("/{id}/explain", response_model=SemanticResponse)
async def explain_recommendation(id: str = Path(..., description="Unique Recommendation ID (e.g. REC-001)")):
    res = await recommendation_service.explain_recommendation(id)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res
