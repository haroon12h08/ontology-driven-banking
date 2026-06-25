import sys
import os
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from orchestrator.orchestrator import orchestrator

async def run_card_upgrade_workflow(customer_id: str) -> Dict[str, Any]:
    """Exposes a direct execution workflow for credit card upgrades routing."""
    return await orchestrator.process_user_intent(customer_id, "I want to upgrade my credit card.")
