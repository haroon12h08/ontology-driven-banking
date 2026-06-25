from fastapi import APIRouter, Path, Query, HTTPException
from app.services.graph_service import graph_service
from app.queries import policy_queries
from app.schemas.responses import SemanticResponse
from datetime import datetime

router = APIRouter()

@router.get("/search", response_model=SemanticResponse)
async def search_policies(q: str = Query(..., description="Search keyword (e.g. KYC, Lending)")):
    records, _ = graph_service.run_read_query(policy_queries.SEARCH_POLICIES, {"searchTerm": q})
    entities = [{"type": "Policy", "id": row["policy"]["policyId"], "properties": row["policy"]} for row in records]

    return SemanticResponse(
        status="success",
        summary=f"Retrieved {len(entities)} policies matching query term '{q}'.",
        entities=entities,
        relationships=[],
        confidence=1.0,
        timestamp=datetime.utcnow()
    )

@router.get("/{id}", response_model=SemanticResponse)
async def get_policy_details(id: str = Path(..., description="Unique Policy ID (e.g. POL-KYC-001)")):
    records, _ = graph_service.run_read_query(policy_queries.GET_POLICY_WITH_PRODUCTS, {"policyId": id})
    if not records or not records[0]["policy"]:
        raise HTTPException(status_code=404, detail=f"Policy with ID {id} not found")

    row = records[0]
    policy = row["policy"]
    products = row.get("constrainedProducts") or []

    entities = [{"type": "Policy", "id": id, "properties": policy}]
    relationships = []

    for p in products:
        if p.get("productId"):
            entities.append({"type": "Product", "id": p["productId"], "properties": p})
            relationships.append({
                "type": "CONSTRAINED_BY",
                "source": p["productId"],
                "target": id
            })

    return SemanticResponse(
        status="success",
        summary=f"Retrieved details for Policy '{policy.get('policyName')}' (Effective Date: {policy.get('effectiveDate')}) and its {len(products)} constrained products.",
        entities=entities,
        relationships=relationships,
        confidence=1.0,
        timestamp=datetime.utcnow()
    )
