from typing import Dict, Any, List
from memory.shared_context import SharedState

class Planner:
    """
    Orchestrator Planner.
    Analyzes intent from current user message or event data, decomposing it into executing steps,
    needed agents, and dependencies.
    """
    def plan_workflow(self, state: SharedState) -> SharedState:
        msg = state.current_user_message.lower()
        
        # 1. Intent Mapping
        if "house" in msg or "home loan" in msg:
            state.workflow_name = "Home Loan Journey"
            state.workflow_steps = [
                "customer_agent", 
                "advisor_agent", 
                "risk_agent", 
                "knowledge_agent", 
                "engagement_agent"
            ]
            state.workflow_state_data["product_type"] = "home_loan"
            state.workflow_state_data["requested_amount"] = 3500000.0  # default estimate
            
        elif "suspicious" in msg or "fraud" in msg or "transaction" in msg and "block" in msg:
            state.workflow_name = "Fraud Detection"
            state.workflow_steps = [
                "customer_agent",
                "risk_agent",
                "operations_agent",
                "knowledge_agent",
                "engagement_agent"
            ]
            state.workflow_state_data["tx_amount"] = 60000.0
            state.workflow_state_data["merchant_id"] = "M-999"
            state.workflow_state_data["location"] = "Delhi"

        elif "investment" in msg or "best investment" in msg or "portfolio" in msg or "mutual fund" in msg:
            state.workflow_name = "Investment Advice"
            state.workflow_steps = [
                "customer_agent",
                "advisor_agent",
                "risk_agent",
                "knowledge_agent",
                "engagement_agent"
            ]

        elif "kyc" in msg or "expired" in msg:
            state.workflow_name = "KYC Renewal"
            state.workflow_steps = [
                "customer_agent",
                "operations_agent",
                "knowledge_agent",
                "engagement_agent"
            ]

        elif "salary" in msg or "salary credited" in msg:
            state.workflow_name = "Salary Credit"
            state.workflow_steps = [
                "customer_agent",
                "advisor_agent",
                "engagement_agent"
            ]
            state.workflow_state_data["salary_amount"] = 150000.0

        elif "complaint" in msg or "grievance" in msg:
            state.workflow_name = "Customer Complaint"
            state.workflow_steps = [
                "customer_agent",
                "operations_agent",
                "engagement_agent"
            ]

        elif "card" in msg or "upgrade card" in msg or "credit card" in msg:
            state.workflow_name = "Card Upgrade"
            state.workflow_steps = [
                "customer_agent",
                "advisor_agent",
                "risk_agent",
                "knowledge_agent",
                "engagement_agent"
            ]
            state.workflow_state_data["product_type"] = "credit_card"

        elif "insurance" in msg or "term life" in msg:
            state.workflow_name = "Insurance Recommendation"
            state.workflow_steps = [
                "customer_agent",
                "advisor_agent",
                "knowledge_agent",
                "engagement_agent"
            ]
            state.workflow_state_data["product_type"] = "insurance_term"

        else:
            state.workflow_name = "Standard Support"
            state.workflow_steps = [
                "customer_agent",
                "engagement_agent"
            ]

        state.current_step_index = 0
        state.reasoning_chain.append({
            "agent": "Planner",
            "action": "Formulate Plan",
            "workflow": state.workflow_name,
            "steps": state.workflow_steps
        })

        return state

# Global instance
planner = Planner()
