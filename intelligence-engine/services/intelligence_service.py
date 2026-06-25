from engines.policy_engine import policy_engine
from engines.financial_health_engine import financial_health_engine
from engines.eligibility_engine import eligibility_engine
from engines.customer_intelligence_engine import customer_intelligence_engine
from engines.recommendation_engine import recommendation_engine
from engines.fraud_engine import fraud_engine
from engines.engagement_engine import engagement_engine
from engines.event_engine import event_engine
from engines.reasoning_engine import reasoning_engine

class IntelligenceService:
    """
    Main orchestrator service exposing all underlying intelligence engine services.
    Agents interact with this unified service to retrieve banking intelligence and explain decisions.
    """
    def __init__(self):
        self.policy = policy_engine
        self.health = financial_health_engine
        self.eligibility = eligibility_engine
        self.intelligence = customer_intelligence_engine
        self.recommendations = recommendation_engine
        self.fraud = fraud_engine
        self.engagement = engagement_engine
        self.events = event_engine
        self.reasoning = reasoning_engine

# Global singleton orchestrator
intelligence_service = IntelligenceService()
