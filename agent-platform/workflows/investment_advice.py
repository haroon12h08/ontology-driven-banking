import sys
import os
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from orchestrator.orchestrator import orchestrator

async def run_investment_advice_workflow(customer_id: str) -> Dict[str, Any]:
    """Exposes a direct execution workflow for investment portfolio routing."""
    return await orchestrator.process_user_intent(customer_id, "I want to find the best investment portfolio.")
