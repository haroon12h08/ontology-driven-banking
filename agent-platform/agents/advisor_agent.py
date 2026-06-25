import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from memory.shared_context import SharedState, AgentMessage, ObservabilityLog
from tools.reasoning_tool import reasoning_tool
from tools.recommendation_tool import recommendation_tool

class AdvisorAgent:
    """
    Financial Advisor Agent.
    Responsible for analyzing loans, investments, savings, insurance eligibility, and net worth/wellness.
    """
    async def run(self, state: SharedState) -> SharedState:
        start_time = time.perf_counter()

        if not state.customer_id:
            state.reasoning_chain.append({
                "agent": "AdvisorAgent",
                "action": "Aborted",
                "reason": "No Customer ID provided in state."
            })
            return state

        state.reasoning_chain.append({
            "agent": "AdvisorAgent",
            "action": "Analyze Financial Health & Products",
            "details": f"Assessing investment/loan suitability for Customer:{state.customer_id}."
        })

        # 1. Fetch financial health from reasoning tool
        health_res = await reasoning_tool.explain_financial_health(state.customer_id)
        state.observability_logs.append(ObservabilityLog(
            action="explain_financial_health",
            agent_or_tool="reasoning_tool",
            duration_ms=health_res["duration_ms"]
        ))

        state.financial_health = {
            "decision": health_res.get("decision", "Unknown"),
            "evidence": health_res.get("evidence", {}),
            "reasoning_steps": health_res.get("reasoning_steps", [])
        }

        # 2. Fetch product recommendations
        recs_res = await recommendation_tool.generate_recommendations(state.customer_id)
        state.observability_logs.append(ObservabilityLog(
            action="generate_recommendations",
            agent_or_tool="recommendation_tool",
            duration_ms=recs_res["duration_ms"]
        ))

        state.active_recommendations = recs_res.get("recommendations", [])

        # Send messages to the coordinator/other agents
        state.messages_sent.append(AgentMessage(
            sender="advisor_agent",
            receiver="orchestrator",
            purpose="Financial Advice Ready",
            context={
                "financial_health": state.financial_health,
                "active_recommendations": state.active_recommendations
            },
            confidence=health_res.get("confidence", 0.90),
            evidence=health_res.get("evidence", {})
        ))

        state.reasoning_chain.append({
            "agent": "AdvisorAgent",
            "action": "Financial Health Calculated",
            "decision": state.financial_health["decision"],
            "recommendations_count": len(state.active_recommendations),
            "confidence": health_res.get("confidence", 0.90)
        })

        # Record policies consulted
        for policy in health_res.get("supporting_policies", []):
            if policy not in state.policies_consulted:
                state.policies_consulted.append(policy)

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="execute_agent",
            agent_or_tool="advisor_agent",
            duration_ms=latency
        ))

        return state

    async def evaluate_specific_product(self, state: SharedState, product_type: str, requested_amount: float = 0.0) -> SharedState:
        """
        Evaluates eligibility for a specific product (e.g. home_loan) and updates the state.
        """
        start_time = time.perf_counter()
        
        elig_res = await reasoning_tool.explain_eligibility(state.customer_id, product_type, requested_amount)
        
        state.workflow_state_data["eligibility"] = {
            "product_type": product_type,
            "requested_amount": requested_amount,
            "decision": elig_res.get("decision"),
            "evidence": elig_res.get("evidence"),
            "reasoning_steps": elig_res.get("reasoning_steps", []),
            "alternative_outcomes": elig_res.get("alternative_outcomes", [])
        }

        for policy in elig_res.get("supporting_policies", []):
            if policy not in state.policies_consulted:
                state.policies_consulted.append(policy)

        state.reasoning_chain.append({
            "agent": "AdvisorAgent",
            "action": f"Evaluate Specific Product: {product_type}",
            "decision": elig_res.get("decision"),
            "details": f"Evaluated eligibility for {product_type} (Amount: {requested_amount:,.2f})"
        })

        state.messages_sent.append(AgentMessage(
            sender="advisor_agent",
            receiver="risk_agent",
            purpose="Evaluate Risk Constraints",
            context={"eligibility": state.workflow_state_data["eligibility"]},
            confidence=elig_res.get("confidence", 0.95),
            evidence=elig_res.get("evidence", {})
        ))

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="evaluate_specific_product",
            agent_or_tool="advisor_agent",
            duration_ms=latency
        ))

        return state

# Global instance
advisor_agent = AdvisorAgent()
