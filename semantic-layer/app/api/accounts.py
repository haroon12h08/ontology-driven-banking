from fastapi import APIRouter, Path, HTTPException
from app.services.graph_service import graph_service
from app.schemas.responses import SemanticResponse
from datetime import datetime

router = APIRouter()

@router.get("/{id}", response_model=SemanticResponse)
async def get_account_details(id: str = Path(..., description="Unique Account ID (e.g. A-001)")):
    query = """
    MATCH (a:Account {accountId: $accountId})
    OPTIONAL MATCH (c:Customer)-[:OWNS]->(a)
    OPTIONAL MATCH (a)-[:INSTANTIATES_PRODUCT]->(p:Product)
    RETURN a {
        .accountId,
        .accountNumber,
        .balance,
        .availableBalance,
        .dateOpened,
        .status,
        labels: labels(a)
    } AS account,
    c {
        .customerId,
        .firstName,
        .lastName,
        .segment
    } AS owner,
    p {
        .productId,
        .productName,
        .productType,
        .baseRate
    } AS product
    """
    records, _ = graph_service.run_read_query(query, {"accountId": id})
    if not records or not records[0]["account"]:
        raise HTTPException(status_code=404, detail=f"Account with ID {id} not found")

    row = records[0]
    acc = row["account"]
    owner = row.get("owner") or {}
    prod = row.get("product") or {}

    entities = [{"type": "Account", "id": id, "properties": acc}]
    relationships = []

    if owner:
        entities.append({"type": "Customer", "id": owner.get("customerId"), "properties": owner})
        relationships.append({"type": "OWNS", "source": owner.get("customerId"), "target": id})

    if prod:
        entities.append({"type": "Product", "id": prod.get("productId"), "properties": prod})
        relationships.append({"type": "INSTANTIATES_PRODUCT", "source": id, "target": prod.get("productId")})

    return SemanticResponse(
        status="success",
        summary=f"Retrieved Account {acc.get('accountNumber')} details owned by Customer {owner.get('firstName')} {owner.get('lastName')}.",
        entities=entities,
        relationships=relationships,
        confidence=1.0,
        timestamp=datetime.utcnow()
    )

@router.get("/{id}/transactions", response_model=SemanticResponse)
async def get_account_transactions(id: str = Path(..., description="Unique Account ID")):
    query = """
    MATCH (a:Account {accountId: $accountId})-[:HAS_TRANSACTION]->(t:Transaction)
    OPTIONAL MATCH (t)-[:AT]->(m:Merchant)
    RETURN t {
        .transactionId,
        .amount,
        .timestamp,
        .channel,
        .isFraud
    } AS transaction,
    m {
        .merchantId,
        .merchantName,
        .category
    } AS merchant
    ORDER BY t.timestamp DESC
    LIMIT 100
    """
    records, _ = graph_service.run_read_query(query, {"accountId": id})

    entities = []
    relationships = []
    for row in records:
        tx = row["transaction"]
        m = row.get("merchant") or {}

        entities.append({"type": "Transaction", "id": tx["transactionId"], "properties": tx})
        relationships.append({"type": "HAS_TRANSACTION", "source": id, "target": tx["transactionId"]})

        if m:
            entities.append({"type": "Merchant", "id": m["merchantId"], "properties": m})
            relationships.append({"type": "AT", "source": tx["transactionId"], "target": m["merchantId"]})

    return SemanticResponse(
        status="success",
        summary=f"Retrieved {len(records)} recent transactions for Account {id}.",
        entities=entities,
        relationships=relationships,
        confidence=1.0,
        timestamp=datetime.utcnow()
    )
