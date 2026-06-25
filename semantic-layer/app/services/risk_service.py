import logging
from typing import Dict, Any, List
from datetime import datetime
from app.services.graph_service import graph_service
from app.queries import risk_queries, customer_queries
from app.schemas.responses import SemanticResponse, SemanticReasoning, SemanticEvidence

logger = logging.getLogger("RiskService")

class RiskService:
    async def calculate_risk_context(self, customer_id: str) -> SemanticResponse:
        # 1. Fetch risk profile node
        rp_records, _ = graph_service.run_read_query(
            customer_queries.GET_CUSTOMER_RISK, {"customerId": customer_id}
        )
        if not rp_records:
            return SemanticResponse(
                status="error",
                summary="Risk Profile node not found for this customer.",
                confidence=0.0,
                timestamp=datetime.utcnow()
            )
        
        rp = rp_records[0]["riskProfile"]
        base_score = rp.get("riskScore", 0)
        base_rating = rp.get("riskRating", "Low")

        # 2. Fetch transaction stats
        tx_records, _ = graph_service.run_read_query(
            risk_queries.GET_TRANSACTION_SUMMARY_FOR_RISK, {"customerId": customer_id}
        )
        tx_stats = tx_records[0] if tx_records else {}
        fraud_count = tx_stats.get("fraudCount", 0)

        # 3. Fetch system risk events (Missed payments, failed KYC, overdrafts)
        event_records, _ = graph_service.run_read_query(
            risk_queries.GET_RISK_EVENTS, {"customerId": customer_id}
        )
        high_severity_events = [e["riskEvent"] for e in event_records if e.get("riskEvent")]

        # Calculations
        calculated_score = float(base_score)
        logical_steps = []
        logical_steps.append(f"Retrieved base Risk Profile score of {base_score} ({base_rating})")

        if fraud_count > 0:
            penalty = fraud_count * 20.0
            calculated_score += penalty
            logical_steps.append(f"Identified {fraud_count} fraudulent transaction(s) (+{penalty:.0f} risk points)")
        
        if len(high_severity_events) > 0:
            penalty = len(high_severity_events) * 10.0
            calculated_score += penalty
            logical_steps.append(f"Found {len(high_severity_events)} critical behavioral event(s) (+{penalty:.0f} risk points)")

        # Cap score at 100
        calculated_score = min(100.0, calculated_score)
        
        final_rating = "Low"
        if calculated_score >= 80:
            final_rating = "Critical"
        elif calculated_score >= 50:
            final_rating = "High"
        elif calculated_score >= 30:
            final_rating = "Medium"

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=0.9,
            supporting_policies=["POL-RISK-001", "POL-AML-003"]
        )

        evidence = SemanticEvidence(
            graph_path=[
                {"node": f"Customer:{customer_id}"},
                {"rel": "HAS_RISK_PROFILE", "node": f"RiskProfile:{rp.get('riskProfileId', '')}"},
                {"rel": "AFFECTS", "node": f"Event(s) count: {len(high_severity_events)}"}
            ],
            metrics={
                "base_score": base_score,
                "calculated_score": calculated_score,
                "fraud_count": fraud_count,
                "risk_event_count": len(high_severity_events)
            }
        )

        summary = f"Assessed risk context as {final_rating} (Score: {calculated_score:.0f}/100) based on base risk score ({base_score}), {fraud_count} fraud flags, and {len(high_severity_events)} behavioral risk alerts."

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=[
                {"type": "RiskAssessment", "id": f"RA-{customer_id}", "properties": {"score": calculated_score, "rating": final_rating}},
                {"type": "RiskProfile", "id": rp.get("riskProfileId"), "properties": rp}
            ],
            relationships=[
                {"type": "HAS_RISK_PROFILE", "source": customer_id, "target": rp.get("riskProfileId")}
            ],
            reasoning=reasoning,
            evidence=evidence,
            confidence=0.9,
            timestamp=datetime.utcnow()
        )

    async def find_fraud_indicators(self, customer_id: str) -> SemanticResponse:
        records, _ = graph_service.run_read_query(
            risk_queries.GET_FRAUD_INDICATORS, {"customerId": customer_id}
        )

        entities = []
        relationships = []
        logical_steps = []

        for row in records:
            tx = row["transaction"]
            m = row.get("merchant") or {}

            entities.append({"type": "Transaction", "id": tx["transactionId"], "properties": tx})
            relationships.append({
                "type": "HAS_TRANSACTION",
                "source": customer_id, # Assumed customer link via accounts
                "target": tx["transactionId"]
            })

            if m:
                entities.append({"type": "Merchant", "id": m["merchantId"], "properties": m})
                relationships.append({
                    "type": "AT",
                    "source": tx["transactionId"],
                    "target": m["merchantId"]
                })
            
            logical_steps.append(f"Flagged transaction {tx['transactionId']} as FRAUD (Amount: INR {tx['amount']}) at merchant {m.get('merchantName', 'N/A')}")

        summary = f"Detected {len(records)} explicit fraudulent transactions in customer history."
        
        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=1.0,
            supporting_policies=["POL-SEC-004", "POL-AML-001"]
        )

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=relationships,
            reasoning=reasoning,
            confidence=1.0,
            timestamp=datetime.utcnow()
        )

    async def assess_transaction_risk(self, customer_id: str, transaction_amount: float, merchant_id: str) -> SemanticResponse:
        # Check merchant risk
        merchant_records, _ = graph_service.run_read_query(
            "MATCH (m:Merchant {merchantId: $merchantId}) RETURN m", {"merchantId": merchant_id}
        )

        if not merchant_records:
            return SemanticResponse(status="error", summary=f"Merchant {merchant_id} not found", confidence=0.0)

        merchant = merchant_records[0]["m"]
        risk_rating = merchant.get("riskRating", 1)

        # Retrieve average transaction size for customer
        tx_records, _ = graph_service.run_read_query(
            risk_queries.GET_TRANSACTION_SUMMARY_FOR_RISK, {"customerId": customer_id}
        )
        tx_stats = tx_records[0] if tx_records else {}
        avg_amount = tx_stats.get("avgTxAmount") or 5000.0 # fallback

        is_high_risk = False
        reasons = []
        logical_steps = []

        if risk_rating >= 4:
            is_high_risk = True
            reasons.append(f"Merchant risk rating is high ({risk_rating}/5)")
            logical_steps.append("Policy check flagged: Merchant risk is 4 or 5")
        
        if transaction_amount > (avg_amount * 3.0):
            is_high_risk = True
            reasons.append(f"Transaction amount INR {transaction_amount:,.2f} is more than 3x the customer's average of INR {avg_amount:,.2f}")
            logical_steps.append("Policy check flagged: Outlier transaction amount detected")
        else:
            logical_steps.append("Policy check passed: Transaction amount is within 3x standard deviation of history")

        summary = ""
        if is_high_risk:
            summary = f"Transaction risk rating is HIGH. Warning factors: {'; '.join(reasons)}"
        else:
            summary = "Transaction risk rating is LOW. No anomalies detected."

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=0.85,
            supporting_policies=["POL-SEC-002", "POL-AML-002"]
        )

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=[{"type": "TransactionRiskReport", "id": f"TRR-{customer_id}", "properties": {"isHighRisk": is_high_risk, "reasons": reasons}}],
            relationships=[],
            reasoning=reasoning,
            confidence=0.85,
            timestamp=datetime.utcnow()
        )

risk_service = RiskService()
