import sys
import os
import asyncio
import json

# Insert semantic-layer, intelligence-engine and agent-platform paths
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")
sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")

from app.services.graph_service import graph_service
from orchestrator.orchestrator import orchestrator

async def print_demo_header(name: str):
    print("\n" + "="*80)
    print(f" DEMONSTRATION: {name}")
    print("="*80)

async def display_result(res: Dict[str, Any]):
    print(f"\nWorkflow Resolved: {res['workflow_name']}")
    print(f"Customer Outreach Message:\n{res['final_output']}")
    print("\nCollaboration & Reasoning Chain:")
    for step in res["explainability"]["reasoning_chain"]:
        agent = step.get("agent")
        action = step.get("action")
        # Format logs beautifully
        if action == "Formulate Plan":
            print(f"  [{agent}] -> Formulating plan. Steps queued: {step.get('steps')}")
        elif action == "Retrieve Profile":
            print(f"  [{agent}] -> Retrieving profile context and behavioral segment.")
        elif action == "Synthesize Profile":
            print(f"  [{agent}] -> Synthesized Profile: {step.get('summary')}")
        elif action == "Financial Health Calculated":
            print(f"  [{agent}] -> Computed wellness: '{step.get('decision')}' (recommending {step.get('recommendations_count')} products).")
        elif "Evaluate Specific Product" in action:
            print(f"  [{agent}] -> Checking eligibility for '{step.get('decision')}'. Details: {step.get('details')}")
        elif action == "Risk Evaluation Complete":
            print(f"  [{agent}] -> Enforcing policy rules. Status: '{step.get('status')}' (violations: {step.get('violations_count')})")
        elif action == "Evaluate Transaction Fraud":
            print(f"  [{agent}] -> Scoring transaction anomalies. Decision: '{step.get('decision')}'")
        elif action == "Audit Active Policies":
            print(f"  [{agent}] -> Auditing {len(step.get('policies_consulted', []))} consulted policies.")
        elif action == "Regulatory Check Complete":
            print(f"  [{agent}] -> Confirmed compliance against RBI master directives.")
        else:
            print(f"  [{agent}] -> Action: {action}. details: {step.get('details', step.get('summary', ''))}")

    print("\nPolicies Consulted:")
    for pol in res["explainability"]["policies_used"]:
        print(f"  - {pol}")

    print(f"\nAverage Agent Confidence Score: {res['explainability']['confidence_score']}")
    print("\nObservability Latency Logs:")
    for log in res["observability"]["execution_logs"]:
        print(f"  - Action: {log['action']} ({log['resource']}) -> Latency: {log['latency_ms']}")

async def main():
    print("Connecting to Neo4j Graph...")
    graph_service.connect()
    
    # Test Candidates
    c_good = "CUST-006" # High score: 748, income 132,702
    c_poor = "CUST-001" # Low score: 598, income 20,749
    
    try:
        # Demo 1: Home Loan
        await print_demo_header("1. Home Loan (Approved Path)")
        res1 = await orchestrator.process_user_intent(c_good, "I want to buy a house.")
        await display_result(res1)

        # Demo 2: Fraud Detection
        await print_demo_header("2. Fraud Detection (Suspicious Activity)")
        res2 = await orchestrator.process_user_intent(c_good, "Process transaction: Suspicious charge of INR 60,000.00 at M-999 in Delhi.")
        await display_result(res2)

        # Demo 3: Investment Advice
        await print_demo_header("3. Investment Advice")
        res3 = await orchestrator.process_user_intent(c_good, "I want to find the best investment portfolio.")
        await display_result(res3)

        # Demo 4: Card Upgrade
        await print_demo_header("4. Card Upgrade Suite")
        res4 = await orchestrator.process_user_intent(c_good, "I want to upgrade my credit card.")
        await display_result(res4)

        # Demo 5: KYC Renewal
        await print_demo_header("5. KYC Renewal Alert")
        res5 = await orchestrator.process_user_intent(c_good, "Trigger KYC expired check.")
        await display_result(res5)

        # Demo 6: Salary Credit
        await print_demo_header("6. Salary Credit Inflow")
        res6 = await orchestrator.process_user_intent(c_good, "Salary credited event.")
        await display_result(res6)

        # Demo 7: Customer Complaint
        await print_demo_header("7. Customer Complaint Grievance")
        res7 = await orchestrator.process_user_intent(c_good, "File support grievance: Account was debited twice for a single transaction.")
        await display_result(res7)

        # Demo 8: Insurance Recommendation
        await print_demo_header("8. Insurance Recommendation")
        res8 = await orchestrator.process_user_intent(c_good, "What is my term life suitability?")
        await display_result(res8)

        # Demo 9: Loan Rejection Explanation
        await print_demo_header("9. Loan Rejection Explanation (Rejected Path)")
        res9 = await orchestrator.process_user_intent(c_poor, "I want to buy a house.")
        await display_result(res9)

    finally:
        print("\nClosing Neo4j Connection...")
        graph_service.close()

if __name__ == "__main__":
    asyncio.run(main())
