from fastapi import APIRouter, Query, Path, HTTPException
from app.services.advisor_service import advisor_service
from app.services.risk_service import risk_service
from app.services.recommendation_service import recommendation_service
from app.schemas.responses import SemanticResponse

router = APIRouter()

@router.get("/explain/loan-eligibility", response_model=SemanticResponse)
async def explain_loan_eligibility(
    customerId: str = Query(..., description="Unique Customer ID"),
    requestedAmount: float = Query(..., description="Requested loan amount in INR")
):
    res = await advisor_service.find_home_loan_eligibility(customerId, requestedAmount)
    if res.status == "error":
        raise HTTPException(status_code=400, detail=res.summary)
    return res

@router.get("/explain/customer-risk", response_model=SemanticResponse)
async def explain_customer_risk(
    customerId: str = Query(..., description="Unique Customer ID")
):
    res = await risk_service.calculate_risk_context(customerId)
    if res.status == "error":
        raise HTTPException(status_code=400, detail=res.summary)
    return res

@router.get("/explain/recommendation/{id}", response_model=SemanticResponse)
async def explain_recommendation(
    id: str = Path(..., description="Unique Recommendation ID")
):
    res = await recommendation_service.explain_recommendation(id)
    if res.status == "error":
        raise HTTPException(status_code=400, detail=res.summary)
    return res
