import sys
import time
from typing import Dict, Any

sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.policy_engine import policy_engine

class PolicyTool:
    """
    Reusable tool wrapper for the Policy Engine.
    """
    async def get_loan_policy(self, loan_type: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = policy_engine.get_loan_policy(loan_type)
        duration = (time.perf_counter() - start) * 1000.0
        return {
            "policy": res,
            "duration_ms": duration
        }

    async def get_investment_policy(self, investment_type: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = policy_engine.get_investment_policy(investment_type)
        duration = (time.perf_counter() - start) * 1000.0
        return {
            "policy": res,
            "duration_ms": duration
        }

    async def get_risk_policy(self, risk_type: str) -> Dict[str, Any]:
        start = time.perf_counter()
        res = policy_engine.get_risk_policy(risk_type)
        duration = (time.perf_counter() - start) * 1000.0
        return {
            "policy": res,
            "duration_ms": duration
        }

# Global singleton
policy_tool = PolicyTool()
