import sys
import time
from typing import Dict, Any, List
from datetime import datetime

# Insert semantic-layer path
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from app.services.customer_service import customer_service
from app.services.ontology_service import ontology_service

class SemanticLayerTool:
    """
    Reusable tool wrapper for the Semantic Layer API and services.
    Agents use this to retrieve core banking data graph representations.
    """
    async def get_customer_profile(self, customer_id: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await customer_service.get_profile(customer_id)
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "status": res.status,
            "summary": res.summary,
            "entities": res.entities,
            "relationships": res.relationships,
            "duration_ms": duration,
            "evidence": res.evidence.model_dump() if res.evidence else {}
        }

    async def get_customer_accounts(self, customer_id: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await customer_service.get_accounts(customer_id)
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "status": res.status,
            "summary": res.summary,
            "entities": res.entities,
            "relationships": res.relationships,
            "duration_ms": duration
        }

    async def get_customer_financial_health(self, customer_id: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await customer_service.get_financial_health(customer_id)
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "status": res.status,
            "summary": res.summary,
            "entities": res.entities,
            "relationships": res.relationships,
            "duration_ms": duration,
            "evidence": res.evidence.model_dump() if res.evidence else {}
        }

    async def get_ontology_classes(self) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await ontology_service.get_ontology_classes()
        duration = (time.perf_counter() - start) * 1000.0
        return {
            "status": res.status,
            "summary": res.summary,
            "entities": res.entities,
            "duration_ms": duration
        }

# Global singleton
semantic_layer_tool = SemanticLayerTool()
