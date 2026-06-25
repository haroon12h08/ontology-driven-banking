import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from memory.shared_context import SharedState, AgentMessage, ObservabilityLog
from tools.reasoning_tool import reasoning_tool
from tools.policy_tool import policy_tool

class RiskAgent:
    """
    Risk Agent.
    Responsible for assessing Fraud, Credit Risk, Transaction Risk, and Policy compliance parameters.
    """
    async def run(self, state: SharedState) -> SharedState:
        start_time = time.perf_counter()

        if not state.customer_id:
            state.reasoning_chain.append({
                "agent": "RiskAgent",
                "action": "Aborted",
                "reason": "No Customer ID provided in state."
            })
            return state

        state.reasoning_chain.append({
            "agent": "RiskAgent",
            "action": "Assess Risk Profile",
            "details": f"Loading risk profiles and credit caps for Customer:{state.customer_id}."
        })

        # Fetch risk policy rules
        policy_res = await policy_tool.get_risk_policy("exposure_risk")
        state.observability_logs.append(ObservabilityLog(
            action="get_risk_policy",
            agent_or_tool="policy_tool",
            duration_ms=policy_res["duration_ms"]
        ))

        # Check if customer has an existing risk profile loaded in state.customer_profile
        profile = state.customer_profile
        credit_score = profile.get("creditScore", 0)
        risk_profile_data = profile.get("risk_profile", {})

        # Compute risk categorization
        rating = risk_profile_data.get("riskRating", "MEDIUM")
        score = risk_profile_data.get("riskScore", 50)

        # Flag high-risk parameters
        is_violating = False
        violations = []

        if credit_score < policy_res["policy"].get("min_acceptable_credit_score", 500):
            is_violating = True
            violations.append(f"Credit score {credit_score} is below minimum acceptable policy threshold.")

        state.risk_assessment.update({
            "credit_score": credit_score,
            "risk_rating": rating,
            "risk_score": score,
            "violations": violations,
            "status": "Violated" if is_violating else "Compliant"
        })

        state.reasoning_chain.append({
            "agent": "RiskAgent",
            "action": "Risk Evaluation Complete",
            "risk_rating": rating,
            "status": state.risk_assessment["status"],
            "violations_count": len(violations)
        })

        state.messages_sent.append(AgentMessage(
            sender="risk_agent",
            receiver="orchestrator",
            purpose="Risk Assessment Completed",
            context={"risk_assessment": state.risk_assessment},
            confidence=0.92
        ))

        # Record policies consulted
        if "id" in policy_res["policy"]:
            state.policies_consulted.append({
                "id": policy_res["policy"]["id"],
                "name": policy_res["policy"]["name"]
            })

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="execute_agent",
            agent_or_tool="risk_agent",
            duration_ms=latency
        ))

        return state

    async def evaluate_transaction(
        self,
        state: SharedState,
        amount: float,
        merchant_id: str,
        location: str = "Unknown",
        device_id: str = "Unknown",
        recent_tx_count_1h: int = 0
    ) -> SharedState:
        """
        Specialized method to evaluate transaction fraud/risk.
        """
        start_time = time.perf_counter()

        fraud_res = await reasoning_tool.explain_fraud(
            state.customer_id, amount, merchant_id, location, device_id, recent_tx_count_1h
        )

        state.risk_assessment["transaction_risk"] = {
            "amount": amount,
            "merchant_id": merchant_id,
            "decision": fraud_res.get("decision"),
            "evidence": fraud_res.get("evidence"),
            "reasoning_steps": fraud_res.get("reasoning_steps", [])
        }

        for policy in fraud_res.get("supporting_policies", []):
            if policy not in state.policies_consulted:
                state.policies_consulted.append(policy)

        state.reasoning_chain.append({
            "agent": "RiskAgent",
            "action": "Evaluate Transaction Fraud",
            "decision": fraud_res.get("decision"),
            "fraud_probability_pct": fraud_res["evidence"].get("fraud_probability_pct", 0)
        })

        state.messages_sent.append(AgentMessage(
            sender="risk_agent",
            receiver="operations_agent",
            purpose="Trigger Fraud Operations Alert",
            context={"transaction_risk": state.risk_assessment["transaction_risk"]},
            confidence=fraud_res.get("confidence", 0.98),
            evidence=fraud_res.get("evidence", {})
        ))

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="evaluate_transaction",
            agent_or_tool="risk_agent",
            duration_ms=latency
        ))

        return state

# Global instance
risk_agent = RiskAgent()
