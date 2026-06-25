from fastapi import APIRouter, Path, Query, HTTPException
from app.services.graph_service import graph_service
from app.services.risk_service import risk_service
from app.schemas.responses import SemanticResponse
from datetime import datetime

router = APIRouter()

@router.get("/{id}", response_model=SemanticResponse)
async def get_transaction_details(id: str = Path(..., description="Unique Transaction ID (e.g. TX-00001)")):
    query = """
    MATCH (t:Transaction {transactionId: $transactionId})
    MATCH (a:Account)-[:HAS_TRANSACTION]->(t)
    OPTIONAL MATCH (t)-[:AT]->(m:Merchant)
    RETURN t {
        .transactionId,
        .amount,
        .timestamp,
        .channel,
        .isFraud
    } AS transaction,
    a {
        .accountId,
        .accountNumber
    } AS account,
    m {
        .merchantId,
        .merchantName,
        .category,
        .riskRating
    } AS merchant
    """
    records, _ = graph_service.run_read_query(query, {"transactionId": id})
    if not records:
        raise HTTPException(status_code=404, detail=f"Transaction with ID {id} not found")

    row = records[0]
    tx = row["transaction"]
    acc = row["account"]
    m = row.get("merchant") or {}

    entities = [
        {"type": "Transaction", "id": id, "properties": tx},
        {"type": "Account", "id": acc.get("accountId"), "properties": acc}
    ]
    relationships = [
        {"type": "HAS_TRANSACTION", "source": acc.get("accountId"), "target": id}
    ]

    if m:
        entities.append({"type": "Merchant", "id": m.get("merchantId"), "properties": m})
        relationships.append({"type": "AT", "source": id, "target": m.get("merchantId")})

    return SemanticResponse(
        status="success",
        summary=f"Retrieved transaction {id} of INR {tx.get('amount'):,.2f} processed at merchant '{m.get('merchantName', 'N/A')}' via channel '{tx.get('channel')}'.",
        entities=entities,
        relationships=relationships,
        confidence=1.0,
        timestamp=datetime.utcnow()
    )

@router.get("/risk/assess", response_model=SemanticResponse)
async def assess_transaction_risk(
    customerId: str = Query(..., description="Unique Customer ID"),
    amount: float = Query(..., description="Proposed transaction amount in INR"),
    merchantId: str = Query(..., description="Unique Merchant ID")
):
    res = await risk_service.assess_transaction_risk(customerId, amount, merchantId)
    if res.status == "error":
        raise HTTPException(status_code=400, detail=res.summary)
    return res
