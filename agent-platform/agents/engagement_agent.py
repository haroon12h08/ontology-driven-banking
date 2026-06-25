import time
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from memory.shared_context import SharedState, AgentMessage, ObservabilityLog

class EngagementAgent:
    """
    Engagement Agent.
    Responsible for generating communication templates, alerts, campaign messages, and RM reminders.
    """
    async def run(self, state: SharedState) -> SharedState:
        start_time = time.perf_counter()

        state.reasoning_chain.append({
            "agent": "EngagementAgent",
            "action": "Construct Customer Engagement Plan",
            "details": "Structuring communications matching customer profile segment."
        })

        profile = state.customer_profile
        segment = profile.get("segment", "MassRetail")
        first_name = profile.get("firstName", "Valued Customer")

        # Select notification channel preferences based on Segment
        channel = "PushNotification"
        if segment == "HNWI":
            channel = "RM Call / In-App Concierge"
        elif segment == "MassAffluent":
            channel = "Email & Mobile App"

        state.workflow_state_data["engagement_preferences"] = {
            "preferred_channel": channel,
            "frequency": "Weekly"
        }

        state.reasoning_chain.append({
            "agent": "EngagementAgent",
            "action": "Engagement Plan Formulated",
            "channel": channel,
            "details": f"Channel mapped for customer segment: {segment}."
        })

        state.messages_sent.append(AgentMessage(
            sender="engagement_agent",
            receiver="orchestrator",
            purpose="Engagement Plan Prepared",
            context={"engagement_preferences": state.workflow_state_data["engagement_preferences"]},
            confidence=1.0
        ))

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="execute_agent",
            agent_or_tool="engagement_agent",
            duration_ms=latency
        ))

        return state

    async def generate_outreach_message(self, state: SharedState, outcome_details: str) -> SharedState:
        """
        Builds the final client-facing output.
        """
        start_time = time.perf_counter()

        profile = state.customer_profile
        name = profile.get("firstName", "Valued Customer")
        segment = profile.get("segment", "MassRetail")

        intro = f"Dear {name},"
        if segment == "HNWI":
            intro = f"Dear {name}, as a valued SBI Wealth customer,"

        state.final_output = f"{intro}\n\n{outcome_details}\n\nThank you for banking with State Bank of India."

        state.reasoning_chain.append({
            "agent": "EngagementAgent",
            "action": "Generate Final Outreach Message",
            "details": "Customer-facing text written to final_output."
        })

        state.messages_sent.append(AgentMessage(
            sender="engagement_agent",
            receiver="orchestrator",
            purpose="Outreach Message Generated",
            context={"final_output": state.final_output},
            confidence=1.0
        ))

        latency = (time.perf_counter() - start_time) * 1000.0
        state.observability_logs.append(ObservabilityLog(
            action="generate_outreach_message",
            agent_or_tool="engagement_agent",
            duration_ms=latency
        ))

        return state

# Global instance
engagement_agent = EngagementAgent()
