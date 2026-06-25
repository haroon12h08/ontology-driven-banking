import sys
import os
import asyncio
import json

# Ensure parent and semantic-layer paths are correct
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from app.services.graph_service import graph_service
from services.intelligence_service import intelligence_service

async def run_scenario_header(name: str):
    print("\n" + "="*80)
    print(f" SCENARIO: {name}")
    print("="*80)

async def main():
    print("Initializing Neo4j Graph Connection...")
    graph_service.connect()
    
    # Customer IDs to test
    c_low_score = "CUST-001"  # Score: 598
    c_high_score = "CUST-006" # Score: 748, Income: 132,702.39
    
    try:
        # Scenario 1: Home Loan Journey
        await run_scenario_header("1. Home Loan Journey")
        # Test eligible customer
        res_elig = await intelligence_service.eligibility.evaluate_eligibility(c_high_score, "home_loan", 2000000.0)
        print(f"Customer {c_high_score} (Good Credit) Home Loan Application (requested: INR 20 Lakhs):")
        print(f"  Decision: {res_elig['decision']}")
        print(f"  Confidence: {res_elig['confidence']}")
        print("  Reasoning:")
        for step in res_elig['reasoning_steps']:
            print(f"    - {step}")
            
        # Test ineligible customer
        res_inelig = await intelligence_service.eligibility.evaluate_eligibility(c_low_score, "home_loan", 5000000.0)
        print(f"\nCustomer {c_low_score} (Low Credit) Home Loan Application (requested: INR 50 Lakhs):")
        print(f"  Decision: {res_inelig['decision']}")
        print("  Reasoning:")
        for step in res_inelig['reasoning_steps']:
            print(f"    - {step}")
        print("  Suggested Improvements:")
        for imp in res_inelig['alternative_outcomes']:
            print(f"    - {imp}")

        # Scenario 2: Fraud Detection
        await run_scenario_header("2. Fraud Detection")
        # Normal transaction
        normal_res = await intelligence_service.fraud.evaluate_transaction(
            customer_id=c_high_score,
            transaction_amount=5000.0,
            merchant_id="M-001",
            location="Mumbai",
            device_id="DEV-PHONE-12"
        )
        print(f"Normal transaction: {normal_res['decision']} (Prob: {normal_res['evidence']['fraud_probability_pct']}%)")
        
        # Suspicious transaction
        suspicious_res = await intelligence_service.fraud.evaluate_transaction(
            customer_id=c_high_score,
            transaction_amount=60000.0,
            merchant_id="M-999", # Blacklisted merchant
            location="Delhi",
            device_id="NEW_DEVICE_33",
            recent_tx_count_1h=8
        )
        print(f"Suspicious transaction: {suspicious_res['decision']} (Prob: {suspicious_res['evidence']['fraud_probability_pct']}%)")
        print("  Reasoning:")
        for step in suspicious_res['reasoning_steps']:
            print(f"    - {step}")

        # Scenario 3: Salary Increase Event
        await run_scenario_header("3. Salary Increase (Fresh Inflow)")
        event_res = await intelligence_service.events.process_event(
            customer_id=c_high_score,
            event_name="Salary Credited",
            event_data={"amount": 150000.0}
        )
        print("Reacting to Salary Credit:")
        print("  Engagement actions triggered:")
        for act in event_res["engagement_actions"]:
            print(f"    - {act['channel']}: {act['message']}")
        print("  Target investment recommendations:")
        for rec in event_res["recommendations"]:
            print(f"    - Product: {rec['productName']} (Score: {rec['score']})")

        # Scenario 4: Investment Recommendation
        await run_scenario_header("4. Investment Recommendation")
        recs_res = await intelligence_service.recommendations.generate_recommendations(c_high_score)
        print(f"Investment Recommendations for {c_high_score}:")
        investments = [r for r in recs_res["recommendations"] if r["category"] == "Investment"]
        for inv in investments:
            print(f"  - {inv['productName']} (Suitability Score: {inv['score']:.2f})")
            print(f"    Match factors: {inv['suitability_factors']}")

        # Scenario 5: Customer Churn Evaluation
        await run_scenario_header("5. Customer Churn Risk")
        intel_res = await intelligence_service.intelligence.infer_intelligence(c_low_score)
        inferences = intel_res["inferences"]
        print(f"Customer {c_low_score} Inferred Profile:")
        print(f"  Segment: {inferences['segment']}")
        print(f"  Behavioral spending pattern: {inferences['behaviour_pattern']}")
        print(f"  Churn risk score: {inferences['churn_risk']}")

        # Scenario 6: Card Upgrade Suite
        await run_scenario_header("6. Card Upgrade Eligibility")
        card_res = await intelligence_service.eligibility.evaluate_eligibility(c_high_score, "credit_card")
        print(f"Elite Card Upgrade Eligibility for {c_high_score}:")
        print(f"  Decision: {card_res['decision']}")
        print("  Supporting policies:")
        for pol in card_res['supporting_policies']:
            print(f"    - {pol['id']}: {pol['name']}")

        # Scenario 7: Insurance Recommendation
        await run_scenario_header("7. Insurance Recommendation")
        ins_res = await intelligence_service.eligibility.evaluate_eligibility(c_high_score, "insurance_term")
        print(f"Term Life Shield suitability for {c_high_score}:")
        print(f"  Decision: {ins_res['decision']}")
        if ins_res['decision'] == "Eligible":
            print(f"  Suggested next steps: {ins_res['alternative_outcomes']}")

        # Scenario 8: EMI Missed Event
        await run_scenario_header("8. EMI Missed (Negative Alert)")
        emi_res = await intelligence_service.events.process_event(
            customer_id=c_low_score,
            event_name="EMI Missed",
            event_data={"accountId": "ACC-LOAN-99", "amount": 15000.0}
        )
        print("EMI Missed Reaction:")
        print("  Risk changes applied:")
        for r_upd in emi_res["risk_updates"]:
            print(f"    - {r_upd['type']} -> Impact: {r_upd['impact']} ({r_upd['details']})")
        print("  Engagement message:")
        for act in emi_res["engagement_actions"]:
            print(f"    - {act['channel']}: {act['message']}")

        # Scenario 9: KYC Expired Event
        await run_scenario_header("9. KYC Expired (Compliance Alert)")
        kyc_res = await intelligence_service.events.process_event(
            customer_id=c_high_score,
            event_name="KYC Expired"
        )
        print("KYC Expired Reaction:")
        print("  Compliance State updates:")
        for r_upd in kyc_res["risk_updates"]:
            print(f"    - {r_upd['type']} -> Impact: {r_upd['impact']}")
        print("  Engagement call-to-action:")
        for act in kyc_res["engagement_actions"]:
            print(f"    - {act['channel']}: {act['message']}")

    finally:
        print("\nClosing Neo4j Connection...")
        graph_service.close()

if __name__ == "__main__":
    asyncio.run(main())
