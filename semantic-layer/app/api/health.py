from fastapi import APIRouter
from app.services.graph_service import graph_service
from app.schemas.responses import SemanticResponse
from datetime import datetime

router = APIRouter()

@router.get("", response_model=SemanticResponse)
async def get_health():
    db_health = graph_service.verify_health()
    status = "success" if db_health.get("status") == "healthy" else "error"
    summary = "Ontology Service Layer and Neo4j connection are fully operational." if status == "success" else f"Database connection issue: {db_health.get('error')}"
    
    return SemanticResponse(
        status=status,
        summary=summary,
        entities=[{"type": "ServiceHealth", "id": "ontology-service", "properties": db_health}],
        relationships=[],
        confidence=1.0 if status == "success" else 0.0,
        timestamp=datetime.utcnow()
    )
