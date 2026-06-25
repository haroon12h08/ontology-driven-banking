import sys
import os
from typing import Dict, Any, List

sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.customer_intelligence_engine import customer_intelligence_engine
from engines.financial_health_engine import financial_health_engine
from engines.policy_engine import policy_engine
from explainability.explanation_engine import explanation_engine

class EngagementEngine:
    async def get_engagement_strategy(self, customer_id: str) -> Dict[str, Any]:
        """
        Determines the optimal touchpoint engagement strategy for a customer based on segmentation,
        digital adoption levels, and churn risks.
        """
        # Fetch inferences
        intel = await customer_intelligence_engine.infer_intelligence(customer_id)
        if "inferences" not in intel:
            return {
                "decision": "Standard Care",
                "strategy": "No strategy calculated",
                "confidence": 0.0
            }

        inferences = intel["inferences"]
        segment = inferences["segment"]
        churn_risk = inferences["churn_risk"]
        digital_adoption = inferences["digital_adoption"]
        offer_affinity = inferences["offer_affinity"]

        # Load policy rules
        policy = policy_engine.get_engagement_policy("next_best_action")

        reasoning_steps = []
        strategy = "Standard Digital Care"
        recommended_channels = ["Mobile App"]
        priority = "Medium"

        # 1. Churn risk handling
        if churn_risk == "High Churn Risk":
            strategy = "Retention Outreach - RM Intervention"
            recommended_channels = ["RM Call", "Personalized Email"]
            priority = "Critical"
            reasoning_steps.append("High Churn Risk detected: triggered urgent retention escalation policy.")
        
        # 2. HNWI premium handling
        elif segment == "HNWI":
            strategy = "SBI Wealth Concierge Management"
            recommended_channels = ["RM Call", "In-Person Advisor"]
            priority = "High"
            reasoning_steps.append("HNWI Segment detected: mapped to premium wealth advisory campaigns.")

        # 3. Mass Affluent handling
        elif segment == "MassAffluent":
            strategy = "SIP and Asset Growth Campaign"
            recommended_channels = ["Mobile App Notification", "Email Newsletter"]
            priority = "Medium"
            reasoning_steps.append("Mass Affluent segment identified: targeting asset growth and mutual fund SIPs.")

        # 4. Digital Adoption outreach
        if digital_adoption == "Low":
            strategy += " + Branch Support Assist"
            recommended_channels.append("Branch Visit Appointment")
            reasoning_steps.append("Low digital adoption detected: supplementing digital channels with branch agent scheduling.")

        evidence = {
            "segment": segment,
            "churn_risk": churn_risk,
            "digital_adoption": digital_adoption,
            "offer_affinity": offer_affinity
        }

        explanation = explanation_engine.create_explanation(
            decision=strategy,
            evidence=evidence,
            supporting_policies=[{
                "id": policy.get("id", "POL-ENG-NBA-001"),
                "name": policy.get("name", "SBI Retail Customer Engagement Campaign")
            }],
            reasoning_steps=reasoning_steps,
            confidence=0.94,
            alternative_outcomes=[
                f"Assigned priority weight: {priority}.",
                f"Target channels: {', '.join(recommended_channels)}."
            ]
        )

        output = explanation.to_dict()
        output["engagement_strategy"] = {
            "strategyName": strategy,
            "priority": priority,
            "channels": recommended_channels,
            "offerAffinity": offer_affinity
        }
        return output

# Global EngagementEngine instance
engagement_engine = EngagementEngine()
