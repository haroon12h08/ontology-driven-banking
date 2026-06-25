import sys
import os
import time
from typing import Dict, Any, List
from langgraph.graph import StateGraph, END

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from memory.shared_context import SharedState, ObservabilityLog
from orchestrator.planner import planner
from agents.customer_agent import customer_agent
from agents.advisor_agent import advisor_agent
from agents.risk_agent import risk_agent
from agents.operations_agent import operations_agent
from agents.knowledge_agent import knowledge_agent
from agents.engagement_agent import engagement_agent

# Node functions for LangGraph
async def plan_node(state: SharedState) -> SharedState:
    return planner.plan_workflow(state)

async def customer_agent_node(state: SharedState) -> SharedState:
    state.current_step_index += 1
    return await customer_agent.run(state)

async def advisor_agent_node(state: SharedState) -> SharedState:
    state.current_step_index += 1
    # Check if we need to do a specific product check
    prod = state.workflow_state_data.get("product_type")
    amt = state.workflow_state_data.get("requested_amount", 0.0)
    
    if prod:
        state = await advisor_agent.evaluate_specific_product(state, prod, amt)
    
    return await advisor_agent.run(state)

async def risk_agent_node(state: SharedState) -> SharedState:
    state.current_step_index += 1
    # Check if transaction fraud needs evaluation
    amt = state.workflow_state_data.get("tx_amount")
    merch = state.workflow_state_data.get("merchant_id")
    loc = state.workflow_state_data.get("location", "Unknown")
    
    if amt and merch:
        state = await risk_agent.evaluate_transaction(state, amt, merch, loc, "NEW_DEV_99", 8)
        
    return await risk_agent.run(state)

async def operations_agent_node(state: SharedState) -> SharedState:
    state.current_step_index += 1
    # Check if we are doing KYC trigger
    if state.workflow_name == "KYC Renewal":
        state = await operations_agent.process_kyc_trigger(state)
        
    return await operations_agent.run(state)

async def knowledge_agent_node(state: SharedState) -> SharedState:
    state.current_step_index += 1
    state = await knowledge_agent.generate_explainability_summary(state)
    return await knowledge_agent.run(state)

async def engagement_agent_node(state: SharedState) -> SharedState:
    state.current_step_index += 1
    # Construct outreach text based on decisions
    outcome = ""
    w_name = state.workflow_name
    
    if w_name == "Home Loan Journey":
        elig = state.workflow_state_data.get("eligibility", {})
        dec = elig.get("decision", "Ineligible")
        if dec == "Eligible":
            outcome = f"We are pleased to inform you that you are ELIGIBLE for our Home Loan! Core rate offered: 8.40% p.a."
        else:
            reasons = "\n".join([f"- {r}" for r in elig.get("reasoning_steps", [])])
            outcome = f"Your Home Loan application could not be approved at this time.\n\nReasons:\n{reasons}"
            
    elif w_name == "Fraud Detection":
        tx = state.risk_assessment.get("transaction_risk", {})
        dec = tx.get("decision", "Block / Decline")
        outcome = f"ALERT: A transaction of INR {tx.get('amount', 0.0):,.2f} at merchant {tx.get('merchant_id')} was {dec}."

    elif w_name == "Investment Advice":
        recs = "\n".join([f"- {r['productName']} (Score: {r['score']:.2f})" for r in state.active_recommendations])
        outcome = f"Based on your profile, here are your investment options:\n{recs}"

    elif w_name == "KYC Renewal":
        kyc = state.workflow_state_data.get("kyc_update", {})
        actions = "\n".join([f"- {a['message']}" for a in kyc.get("engagement_actions", [])])
        outcome = f"KYC Notice:\n{actions}"

    elif w_name == "Salary Credit":
        amt = state.workflow_state_data.get("salary_amount", 0.0)
        recs = "\n".join([f"- {r['productName']} (Score: {r['score']:.2f})" for r in state.active_recommendations])
        outcome = f"Your salary of INR {amt:,.2f} has been credited. Suggested deployments:\n{recs}"

    elif w_name == "Card Upgrade":
        elig = state.workflow_state_data.get("eligibility", {})
        dec = elig.get("decision", "Ineligible")
        outcome = f"Card Upgrade assessment complete. Decision: {dec}."

    elif w_name == "Insurance Recommendation":
        elig = state.workflow_state_data.get("eligibility", {})
        dec = elig.get("decision", "Ineligible")
        outcome = f"Term Life Shield suitability: {dec}."

    else:
        outcome = "How can we assist you today with your accounts?"

    state = await engagement_agent.generate_outreach_message(state, outcome)
    return await engagement_agent.run(state)

# Router logic
def route_next_agent(state: SharedState) -> str:
    steps = state.workflow_steps
    idx = state.current_step_index
    
    if idx >= len(steps):
        return END
        
    next_agent = steps[idx]
    return next_agent

class WorkflowManager:
    """
    Manages compiling and executing the LangGraph agent state graph.
    """
    def __init__(self):
        # Compile StateGraph
        builder = StateGraph(SharedState)
        
        # Add Nodes
        builder.add_node("plan", plan_node)
        builder.add_node("customer_agent", customer_agent_node)
        builder.add_node("advisor_agent", advisor_agent_node)
        builder.add_node("risk_agent", risk_agent_node)
        builder.add_node("operations_agent", operations_agent_node)
        builder.add_node("knowledge_agent", knowledge_agent_node)
        builder.add_node("engagement_agent", engagement_agent_node)
        
        # Add entry point
        builder.set_entry_point("plan")
        
        # Add conditional edges from 'plan' to sequence nodes
        builder.add_conditional_edges("plan", route_next_agent, {
            "customer_agent": "customer_agent",
            "advisor_agent": "advisor_agent",
            "risk_agent": "risk_agent",
            "operations_agent": "operations_agent",
            "knowledge_agent": "knowledge_agent",
            "engagement_agent": "engagement_agent",
            END: END
        })
        
        # Add conditional transitions from each agent back to router
        for agent in ["customer_agent", "advisor_agent", "risk_agent", "operations_agent", "knowledge_agent", "engagement_agent"]:
            builder.add_conditional_edges(agent, route_next_agent, {
                "customer_agent": "customer_agent",
                "advisor_agent": "advisor_agent",
                "risk_agent": "risk_agent",
                "operations_agent": "operations_agent",
                "knowledge_agent": "knowledge_agent",
                "engagement_agent": "engagement_agent",
                END: END
            })
            
        self.graph = builder.compile()

    async def execute_workflow(self, customer_id: str, message: str) -> SharedState:
        """
        Executes the compiled multi-agent state graph.
        """
        state = SharedState(
            customer_id=customer_id,
            current_user_message=message
        )
        return await self.graph.ainvoke(state)

# Global instance
workflow_manager = WorkflowManager()
