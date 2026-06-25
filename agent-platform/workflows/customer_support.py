import sys
import os
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from orchestrator.orchestrator import orchestrator

async def run_support_workflow(customer_id: str, issue: str) -> Dict[str, Any]:
    """Exposes a direct execution workflow for standard complaint/support requests."""
    message = f"File support grievance: {issue}."
    return await orchestrator.process_user_intent(customer_id, message)
