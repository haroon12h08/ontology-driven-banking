import sys
import os
from typing import Dict, Any

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from orchestrator.orchestrator import orchestrator

async def run_kyc_workflow(customer_id: str) -> Dict[str, Any]:
    """Exposes a direct execution workflow for KYC expiration alerts routing."""
    return await orchestrator.process_user_intent(customer_id, "Trigger KYC expired check.")
