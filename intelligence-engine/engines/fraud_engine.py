import sys
import os
from typing import Dict, Any, List
from datetime import datetime

sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from app.services.customer_service import customer_service
from app.services.graph_service import graph_service
from app.services.risk_service import risk_service
from engines.policy_engine import policy_engine
from explainability.explanation_engine import explanation_engine

class FraudEngine:
    async def evaluate_transaction(
        self,
        customer_id: str,
        transaction_amount: float,
        merchant_id: str,
        location: str = "Unknown",
        device_id: str = "Unknown",
        recent_tx_count_1h: int = 0
    ) -> Dict[str, Any]:
        """
        Evaluates fraud risk for a transaction, combining merchant ratings, transaction amount outlier status,
        velocity limits, location distance anomalies, and device changes.
        """
        # Load Fraud Rules
        rule = policy_engine.get_fraud_policy("transaction_risk")
        velocity_limit = rule.get("velocity_limit_per_hour", 5)
        amount_threshold = rule.get("single_tx_amount_threshold_inr", 50000.0)
        distance_limit = rule.get("distance_anomaly_threshold_km", 200)
        merchant_blacklist = rule.get("merchant_blacklist", [])

        # Fetch risk statistics
        assess_res = await risk_service.assess_transaction_risk(customer_id, transaction_amount, merchant_id)
        
        fraud_prob = 0.0
        risk_score = 0.0
        reasoning_steps = []
        is_fraud = False

        # 1. Blacklisted Merchant Check
        if merchant_id in merchant_blacklist:
            fraud_prob += 0.85
            risk_score += 85.0
            reasoning_steps.append(f"High risk flagged: Merchant {merchant_id} is on the system blacklist.")
            is_fraud = True
        else:
            reasoning_steps.append(f"Passed: Merchant {merchant_id} is not blacklisted.")

        # 2. Transaction Amount Threshold check
        if transaction_amount >= amount_threshold:
            fraud_prob += 0.20
            risk_score += 20.0
            reasoning_steps.append(f"Flagged: Transaction amount INR {transaction_amount:,.2f} exceeds threshold INR {amount_threshold:,.2f}.")
        
        # Check if transaction is an outlier according to risk service
        if assess_res.status == "success" and len(assess_res.entities) > 0:
            risk_report = assess_res.entities[0].get("properties", {})
            if risk_report.get("isHighRisk"):
                fraud_prob += 0.30
                risk_score += 30.0
                reasons = risk_report.get("reasons", [])
                reasoning_steps.append(f"Risk service outlier analysis: {'; '.join(reasons)}")

        # 3. Velocity Check
        if recent_tx_count_1h > velocity_limit:
            fraud_prob += 0.40
            risk_score += 40.0
            reasoning_steps.append(f"Flagged: Velocity limit exceeded. {recent_tx_count_1h} transactions in the last hour exceeds limit of {velocity_limit}.")
        else:
            reasoning_steps.append(f"Passed: Velocity ({recent_tx_count_1h} tx/hr) is within safe limits.")

        # 4. Location Anomaly Check
        # Example logic: if location contains 'Mumbai' and customer's home is 'Kolkata'
        profile_res = await customer_service.get_profile(customer_id)
        cust_city = "Unknown"
        if profile_res.status == "success" and len(profile_res.entities) > 0:
            cust_city = profile_res.entities[0].get("properties", {}).get("city", "Unknown")

        if location != "Unknown" and cust_city != "Unknown" and location != cust_city:
            fraud_prob += 0.25
            risk_score += 25.0
            reasoning_steps.append(f"Flagged: Location anomaly. Transaction initiated from '{location}' while customer's home city is '{cust_city}'.")
        else:
            reasoning_steps.append(f"Passed: Location matches customer profile city.")

        # 5. Device Change Check
        # Assume a simple check if device_id starts with 'NEW_'
        if device_id.startswith("NEW_") or device_id == "Unknown":
            fraud_prob += 0.15
            risk_score += 15.0
            reasoning_steps.append(f"Flagged: Transaction initiated from an unrecognized/new device '{device_id}'.")
        else:
            reasoning_steps.append("Passed: Device is recognized.")

        # Cap values
        fraud_prob = min(0.99, fraud_prob)
        risk_score = min(100.0, risk_score)

        decision = "Block / Decline" if (risk_score >= 70 or fraud_prob >= 0.70) else "Flag / Step-up MFA" if (risk_score >= 40 or fraud_prob >= 0.40) else "Approve"

        evidence = {
            "amount": transaction_amount,
            "merchantId": merchant_id,
            "location": location,
            "device_id": device_id,
            "recent_tx_count_1h": recent_tx_count_1h,
            "customer_home_city": cust_city,
            "calculated_risk_score": risk_score,
            "fraud_probability_pct": round(fraud_prob * 100, 2)
        }

        explanation = explanation_engine.create_explanation(
            decision=decision,
            evidence=evidence,
            supporting_policies=[{
                "id": rule.get("id", "POL-FRAUD-TX-001"),
                "name": rule.get("name", "SBI Real-time Transaction Risk Policy")
            }],
            reasoning_steps=reasoning_steps,
            confidence=0.95,
            alternative_outcomes=[
                "Approve transaction after successful SMS OTP / Biometric MFA challenge."
            ] if decision == "Flag / Step-up MFA" else []
        )

        return explanation.to_dict()

# Global FraudEngine instance
fraud_engine = FraudEngine()
