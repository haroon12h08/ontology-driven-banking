import sys
import time
from typing import Dict, Any

sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.reasoning_engine import reasoning_engine

class ReasoningTool:
    """
    Reusable tool wrapping explainable AI reasoning services.
    """
    async def explain_eligibility(self, customer_id: str, product_type: str, requested_amount: float = 0.0) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await reasoning_engine.explain_eligibility(customer_id, product_type, requested_amount)
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "decision": res.get("decision"),
            "evidence": res.get("evidence"),
            "supporting_policies": res.get("supporting_policies", []),
            "reasoning_steps": res.get("reasoning_steps", []),
            "confidence": res.get("confidence", 1.0),
            "alternative_outcomes": res.get("alternative_outcomes", []),
            "duration_ms": duration
        }

    async def explain_financial_health(self, customer_id: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await reasoning_engine.explain_financial_health(customer_id)
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "decision": res.get("decision"),
            "evidence": res.get("evidence"),
            "supporting_policies": res.get("supporting_policies", []),
            "reasoning_steps": res.get("reasoning_steps", []),
            "confidence": res.get("confidence", 1.0),
            "alternative_outcomes": res.get("alternative_outcomes", []),
            "duration_ms": duration
        }

    async def explain_fraud(
        self,
        customer_id: str,
        amount: float,
        merchant_id: str,
        location: str = "Unknown",
        device_id: str = "Unknown",
        recent_tx_count_1h: int = 0
    ) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await reasoning_engine.explain_fraud(
            customer_id, amount, merchant_id, location, device_id, recent_tx_count_1h
        )
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "decision": res.get("decision"),
            "evidence": res.get("evidence"),
            "supporting_policies": res.get("supporting_policies", []),
            "reasoning_steps": res.get("reasoning_steps", []),
            "confidence": res.get("confidence", 1.0),
            "alternative_outcomes": res.get("alternative_outcomes", []),
            "duration_ms": duration
        }

# Global singleton
reasoning_tool = ReasoningTool()
