from fastapi import APIRouter, Path, Query, HTTPException
from app.services.graph_service import graph_service
from app.services.advisor_service import advisor_service
from app.queries import advisor_queries
from app.schemas.responses import SemanticResponse
from datetime import datetime

router = APIRouter()

@router.get("", response_model=SemanticResponse)
async def list_products():
    records, _ = graph_service.run_read_query(advisor_queries.GET_PRODUCTS_AND_POLICIES)

    entities = []
    relationships = []
    for row in records:
        prod = row["product"]
        policies = row.get("policies") or []

        entities.append({"type": "Product", "id": prod["productId"], "properties": prod})
        for pol in policies:
            if pol.get("policyId"):
                # Avoid duplicates
                if not any(e["id"] == pol["policyId"] for e in entities):
                    entities.append({"type": "Policy", "id": pol["policyId"], "properties": pol})
                relationships.append({
                    "type": "CONSTRAINED_BY",
                    "source": prod["productId"],
                    "target": pol["policyId"]
                })

    return SemanticResponse(
        status="success",
        summary=f"Retrieved {len(records)} products and their governing policy rules.",
        entities=entities,
        relationships=relationships,
        confidence=1.0,
        timestamp=datetime.utcnow()
    )

@router.get("/{id}", response_model=SemanticResponse)
async def get_product_details(id: str = Path(..., description="Unique Product ID (e.g. PR-001)")):
    query = """
    MATCH (p:Product {productId: $productId})
    OPTIONAL MATCH (p)-[:CONSTRAINED_BY]->(pol:Policy)
    RETURN p {
        .productId,
        .productName,
        .productType,
        .baseRate
    } AS product,
    collect(pol {
        .policyId,
        .policyName,
        .version,
        .effectiveDate,
        .status
    }) AS policies
    """
    records, _ = graph_service.run_read_query(query, {"productId": id})
    if not records or not records[0]["product"]:
        raise HTTPException(status_code=404, detail=f"Product with ID {id} not found")

    row = records[0]
    prod = row["product"]
    policies = row.get("policies") or []

    entities = [{"type": "Product", "id": id, "properties": prod}]
    relationships = []

    for pol in policies:
        if pol.get("policyId"):
            entities.append({"type": "Policy", "id": pol["policyId"], "properties": pol})
            relationships.append({
                "type": "CONSTRAINED_BY",
                "source": id,
                "target": pol["policyId"]
            })

    return SemanticResponse(
        status="success",
        summary=f"Retrieved details for Product '{prod.get('productName')}' with {len(policies)} governing policy constraints.",
        entities=entities,
        relationships=relationships,
        confidence=1.0,
        timestamp=datetime.utcnow()
    )

@router.get("/eligibility/loan", response_model=SemanticResponse)
async def get_loan_eligibility(
    customerId: str = Query(..., description="Unique Customer ID"),
    loanAmount: float = Query(..., description="Requested loan amount in INR")
):
    res = await advisor_service.find_home_loan_eligibility(customerId, loanAmount)
    if res.status == "error":
        raise HTTPException(status_code=404, detail=res.summary)
    return res
