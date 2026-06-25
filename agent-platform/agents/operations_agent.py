import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from memory.shared_context import SharedState, AgentMessage, ObservabilityLog
from tools.semantic_layer_tool import semantic_layer_tool
from tools.event_tool import event_tool

class OperationsAgent:
    """
    Operations Agent.
    Responsible for operational compliance, complaints processing, service requests, cards, and KYC updates.
    """
    async def run(self, state: SharedState) -> SharedState:
        start_time = time.perf_counter()

        if not state.customer_id:
            state.reasoning_chain.append({
                "agent": "OperationsAgent",
                "action": "Aborted",
                "reason": "No Customer ID provided in state."
            })
            return state

        state.reasoning_chain.append({
            "agent": "OperationsAgent",
            "action": "Inspect Accounts & Requests",
            "details": f"Fetching active requests and complaints history for Customer:{state.customer_id}."
        })

        # 1. Fetch customer accounts & cards
        accs_res = await semantic_layer_tool.get_customer_accounts(state.customer_id)
        state.observability_logs.append(ObservabilityLog(
            action="get_customer_accounts",
            agent_or_tool="semantic_layer_tool",
            duration_ms=accs_res["duration_ms"]
        ))

        # Summarize accounts in workflow state
        accounts_list = []
        for ent in accs_res.get("entities", []):
            if ent.get("type") == "Account":
                accounts_list.append(ent.get("properties", {}))
        state.workflow_state_data["accounts_summary"] = accounts_list

        state.reasoning_chain.append({
            "agent": "OperationsAgent",
            "action": "Accounts Loaded",
            "accounts_count": len(state.workflow_state_data["accounts_summary"])
        })

        state.messages_sent.append(AgentMessage(
            sender="operations_agent",
            receiver="orchestrator",
            purpose="Accounts Summary Complete",
            context={"accounts": state.workflow_state_data["accounts_summary"]},
            confidence=1.0
        ))

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="execute_agent",
            agent_or_tool="operations_agent",
            duration_ms=latency
        ))

        return state

    async def process_kyc_trigger(self, state: SharedState) -> SharedState:
        """
        Operational routine to handle KYC updates.
        """
        start_time = time.perf_counter()

        state.reasoning_chain.append({
            "agent": "OperationsAgent",
            "action": "Initiate KYC Expiration Trigger",
            "details": "Invoking compliance rule sets via Event Engine."
        })

        # Trigger event through event engine
        evt_res = await event_tool.process_event(state.customer_id, "KYC Expired")
        state.observability_logs.append(ObservabilityLog(
            action="process_event_kyc",
            agent_or_tool="event_tool",
            duration_ms=evt_res["duration_ms"]
        ))

        state.workflow_state_data["kyc_update"] = {
            "risk_updates": evt_res["risk_updates"],
            "engagement_actions": evt_res["engagement_actions"]
        }

        state.reasoning_chain.append({
            "agent": "OperationsAgent",
            "action": "KYC Alert Structured",
            "risk_impact": evt_res["risk_updates"][0]["impact"] if evt_res["risk_updates"] else "None",
            "details": "Forwarding notification requirements to Engagement Agent."
        })

        state.messages_sent.append(AgentMessage(
            sender="operations_agent",
            receiver="engagement_agent",
            purpose="Dispatch KYC Warning",
            context={"kyc_update": state.workflow_state_data["kyc_update"]},
            confidence=1.0,
            evidence=evt_res
        ))

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="process_kyc_trigger",
            agent_or_tool="operations_agent",
            duration_ms=latency
        ))

        return state

# Global instance
operations_agent = OperationsAgent()
