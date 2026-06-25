import sys
import os
from typing import Dict, Any

sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.financial_health_engine import financial_health_engine
from engines.eligibility_engine import eligibility_engine
from engines.fraud_engine import fraud_engine
from engines.customer_intelligence_engine import customer_intelligence_engine

class ReasoningEngine:
    async def explain_financial_health(self, customer_id: str) -> Dict[str, Any]:
        """Provides full explainable financial health analysis for a customer."""
        return await financial_health_engine.compute_health(customer_id)

    async def explain_eligibility(self, customer_id: str, product_type: str, requested_amount: float = 0.0) -> Dict[str, Any]:
        """Provides full explainable eligibility scoring for loans/investments."""
        return await eligibility_engine.evaluate_eligibility(customer_id, product_type, requested_amount)

    async def explain_fraud(
        self,
        customer_id: str,
        amount: float,
        merchant_id: str,
        location: str = "Unknown",
        device_id: str = "Unknown",
        recent_tx_count_1h: int = 0
    ) -> Dict[str, Any]:
        """Provides full explainable fraud assessment for a transaction."""
        return await fraud_engine.evaluate_transaction(
            customer_id, amount, merchant_id, location, device_id, recent_tx_count_1h
        )

    async def explain_customer_intelligence(self, customer_id: str) -> Dict[str, Any]:
        """Provides full explainable segmentation and behavioral intelligence for a customer."""
        return await customer_intelligence_engine.infer_intelligence(customer_id)

# Global ReasoningEngine instance
reasoning_engine = ReasoningEngine()
