import sys
import time
from typing import Dict, Any

sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.recommendation_engine import recommendation_engine

class RecommendationTool:
    """
    Reusable tool wrapping product recommendation and personalization services.
    """
    async def generate_recommendations(self, customer_id: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await recommendation_engine.generate_recommendations(customer_id)
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "customer_id": res.get("customer_id"),
            "recommendations": res.get("recommendations", []),
            "duration_ms": duration
        }

# Global singleton
recommendation_tool = RecommendationTool()
