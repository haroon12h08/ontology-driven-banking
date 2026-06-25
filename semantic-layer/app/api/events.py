from fastapi import APIRouter, Path, Query, HTTPException
from app.services.graph_service import graph_service
from app.queries import event_queries
from app.schemas.responses import SemanticResponse
from datetime import datetime

router = APIRouter()

@router.get("/customer/{customerId}", response_model=SemanticResponse)
async def get_customer_events(customerId: str = Path(..., description="Unique Customer ID")):
    records, _ = graph_service.run_read_query(event_queries.GET_RECENT_EVENTS_BY_CUSTOMER, {"customerId": customerId})
    entities = [{"type": "Event", "id": row["event"]["eventId"], "properties": row["event"]} for row in records]
    relationships = [{"type": "AFFECTS", "source": row["event"]["eventId"], "target": customerId} for row in records]

    return SemanticResponse(
        status="success",
        summary=f"Retrieved {len(entities)} recent system events affecting Customer:{customerId}.",
        entities=entities,
        relationships=relationships,
        confidence=1.0,
        timestamp=datetime.utcnow()
    )

@router.get("/customer/{customerId}/large-transactions", response_model=SemanticResponse)
async def get_large_transactions(
    customerId: str = Path(..., description="Unique Customer ID"),
    threshold: float = Query(50000.0, description="Minimum transaction amount in INR")
):
    records, _ = graph_service.run_read_query(event_queries.GET_LARGE_TRANSACTIONS, {"customerId": customerId, "threshold": threshold})

    entities = []
    relationships = []
    for row in records:
        tx = row["transaction"]
        acc = row["account"]
        m = row.get("merchant") or {}

        entities.append({"type": "Transaction", "id": tx["transactionId"], "properties": tx})
        relationships.append({"type": "HAS_TRANSACTION", "source": acc["accountId"], "target": tx["transactionId"]})

        if m.get("merchantId"):
            entities.append({"type": "Merchant", "id": m["merchantId"], "properties": m})
            relationships.append({"type": "AT", "source": tx["transactionId"], "target": m["merchantId"]})

    return SemanticResponse(
        status="success",
        summary=f"Retrieved {len(records)} transactions exceeding threshold INR {threshold:,.2f} for Customer:{customerId}.",
        entities=entities,
        relationships=relationships,
        confidence=1.0,
        timestamp=datetime.utcnow()
    )
