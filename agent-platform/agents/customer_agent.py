import time
import sys
import os
from datetime import datetime

# Add parents to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from memory.shared_context import SharedState, AgentMessage, ObservabilityLog
from tools.semantic_layer_tool import semantic_layer_tool
from tools.intelligence_tool import intelligence_tool

class CustomerAgent:
    """
    Customer Intelligence Agent.
    Responsible for profile summarization, relationships, timelines, and behavioral spending/churn context.
    """
    async def run(self, state: SharedState) -> SharedState:
        start_time = time.perf_counter()
        
        if not state.customer_id:
            state.reasoning_chain.append({
                "agent": "CustomerAgent",
                "action": "Aborted",
                "reason": "No Customer ID provided in state."
            })
            return state

        state.reasoning_chain.append({
            "agent": "CustomerAgent",
            "action": "Retrieve Profile",
            "details": f"Fetching demographic and relationship profile for Customer:{state.customer_id}."
        })

        # 1. Fetch profile from semantic layer
        profile_res = await semantic_layer_tool.get_customer_profile(state.customer_id)
        state.observability_logs.append(ObservabilityLog(
            action="get_customer_profile",
            agent_or_tool="semantic_layer_tool",
            duration_ms=profile_res["duration_ms"]
        ))

        # 2. Fetch behavioral intelligence from intelligence engine
        intel_res = await intelligence_tool.infer_customer_intelligence(state.customer_id)
        state.observability_logs.append(ObservabilityLog(
            action="infer_customer_intelligence",
            agent_or_tool="intelligence_tool",
            duration_ms=intel_res["duration_ms"]
        ))

        # Store profile and behavioral context inside the shared memory
        customer_data = {}
        risk_profile_data = {}
        for ent in profile_res.get("entities", []):
            if ent.get("type") == "Customer":
                customer_data = ent.get("properties", {})
            elif ent.get("type") == "RiskProfile":
                risk_profile_data = ent.get("properties", {})

        state.customer_profile = {
            "customerId": customer_data.get("customerId", state.customer_id),
            "firstName": customer_data.get("firstName", ""),
            "lastName": customer_data.get("lastName", ""),
            "dateOfBirth": customer_data.get("dateOfBirth", ""),
            "annualIncome": customer_data.get("annualIncome", 0.0),
            "city": customer_data.get("city", ""),
            "segment": customer_data.get("segment", ""),
            "creditScore": customer_data.get("creditScore", 0),
            "behavioral": intel_res.get("inferences", {}),
            "risk_profile": risk_profile_data
        }

        # Format timeline and relationship context summary
        summary = (
            f"Customer {state.customer_profile['firstName']} {state.customer_profile['lastName']} "
            f"(Segment: {state.customer_profile['segment']}) has a credit score of {state.customer_profile['creditScore']}. "
            f"Behavioral profile: Spending pattern '{state.customer_profile['behavioral'].get('behaviour_pattern', 'Unknown')}', "
            f"Churn risk '{state.customer_profile['behavioral'].get('churn_risk', 'Unknown')}', "
            f"Digital Adoption '{state.customer_profile['behavioral'].get('digital_adoption', 'Unknown')}'."
        )

        state.reasoning_chain.append({
            "agent": "CustomerAgent",
            "action": "Synthesize Profile",
            "summary": summary,
            "confidence": intel_res.get("confidence", 0.95)
        })

        # Inter-agent communication: Send structured message to shared memory log
        # Let's say we notify the workflow planner/coordinator
        state.messages_sent.append(AgentMessage(
            sender="customer_agent",
            receiver="orchestrator",
            purpose="Profile Synthesis Complete",
            context={"customer_profile": state.customer_profile},
            confidence=intel_res.get("confidence", 0.95),
            evidence=intel_res.get("evidence", {})
        ))

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="execute_agent",
            agent_or_tool="customer_agent",
            duration_ms=latency
        ))

        return state

# Global instance
customer_agent = CustomerAgent()
