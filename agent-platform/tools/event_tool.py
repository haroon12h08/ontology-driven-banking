import sys
import time
from typing import Dict, Any

sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.event_engine import event_engine

class EventTool:
    """
    Reusable tool wrapping the Event Engine to react to banking lifecycle events.
    """
    async def process_event(self, customer_id: str, event_name: str, event_data: Dict[str, Any] = None) -> Dict[str, Any]:
        start = time.perf_counter()
        res = await event_engine.process_event(customer_id, event_name, event_data)
        duration = (time.perf_counter() - start) * 1000.0
        
        return {
            "customer_id": res.get("customer_id"),
            "event": res.get("event"),
            "recommendations": res.get("recommendations", []),
            "risk_updates": res.get("risk_updates", []),
            "engagement_actions": res.get("engagement_actions", []),
            "reasoning_steps": res.get("reasoning_steps", []),
            "duration_ms": duration
        }

# Global singleton
event_tool = EventTool()
