import sys
import time
from typing import Dict, Any

# Insert intelligence-engine and semantic-layer paths
sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.customer_intelligence_engine import customer_intelligence_engine

class IntelligenceTool:
    """
    Reusable tool wrapper for the Customer Intelligence Engine.
    """
    async def infer_customer_intelligence(self, customer_id: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await customer_intelligence_engine.infer_intelligence(customer_id)
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "decision": res.get("decision", ""),
            "inferences": res.get("inferences", {}),
            "evidence": res.get("evidence", {}),
            "reasoning_steps": res.get("reasoning_steps", []),
            "confidence": res.get("confidence", 1.0),
            "duration_ms": duration
        }

# Global singleton
intelligence_tool = IntelligenceTool()
