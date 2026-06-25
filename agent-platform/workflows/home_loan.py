import sys
import os
import asyncio
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from orchestrator.orchestrator import orchestrator

async def run_home_loan_workflow(customer_id: str, amount: float = 3500000.0) -> Dict[str, Any]:
    """Exposes a direct execution workflow for Home Loan application routing."""
    message = f"I want to buy a house and request a home loan of INR {amount:,.2f}."
    return await orchestrator.process_user_intent(customer_id, message)
