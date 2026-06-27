from fastapi import APIRouter, Path, Query, HTTPException
from app.services.graph_service import graph_service
from app.queries import event_queries
from app.schemas.responses import SemanticResponse, SemanticReasoning, SemanticEvidence
from datetime import datetime
from pydantic import BaseModel
import sys
import os

sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")
from engines.event_engine import event_engine

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

class SimulateEventRequest(BaseModel):
    customerId: str
    eventName: str
    eventData: dict = None

@router.post("/simulate")
async def simulate_event(request: SimulateEventRequest):
    try:
        res = await event_engine.process_event(
            customer_id=request.customerId,
            event_name=request.eventName,
            event_data=request.eventData or {}
        )
        
        entities = []
        for rec in res.get("recommendations", []):
            entities.append({
                "type": "Recommendation",
                "id": rec.get("productId", "unknown"),
                "properties": rec
            })
        for r_upd in res.get("risk_updates", []):
            entities.append({
                "type": "RiskUpdate",
                "id": "risk-upd",
                "properties": r_upd
            })
        for act in res.get("engagement_actions", []):
            entities.append({
                "type": "EngagementAction",
                "id": "eng-act",
                "properties": act
            })
            
        reasoning_obj = SemanticReasoning(
            logical_steps=res.get("reasoning_steps", []),
            confidence=0.95,
            supporting_policies=[]
        )
        evidence_obj = SemanticEvidence(
            graph_path=[],
            metrics={"event_response": res}
        )
        return SemanticResponse(
            status="success",
            summary=f"Event {request.eventName} processed successfully.",
            entities=entities,
            relationships=[],
            reasoning=reasoning_obj,
            evidence=evidence_obj,
            confidence=0.95,
            timestamp=datetime.utcnow()
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
