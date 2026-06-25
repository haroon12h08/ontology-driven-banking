import sys
import os
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from orchestrator.orchestrator import orchestrator

async def run_fraud_workflow(customer_id: str, amount: float, merchant_id: str, location: str = "Delhi") -> Dict[str, Any]:
    """Exposes a direct execution workflow for transaction fraud check routing."""
    message = f"Process transaction: Suspicious charge of INR {amount:,.2f} at {merchant_id} in {location}."
    return await orchestrator.process_user_intent(customer_id, message)
