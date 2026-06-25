import logging
from typing import Dict, Any, List
from datetime import datetime
from app.services.graph_service import graph_service
from app.queries import advisor_queries
from app.schemas.responses import SemanticResponse, SemanticReasoning, SemanticEvidence

logger = logging.getLogger("AdvisorService")

class AdvisorService:
    async def find_home_loan_eligibility(self, customer_id: str, requested_amount: float) -> SemanticResponse:
        records, metrics = graph_service.run_read_query(
            advisor_queries.GET_CUSTOMER_FINANCIAL_PROFILE, {"customerId": customer_id}
        )

        if not records or not records[0]["customer"]:
            return SemanticResponse(
                status="error",
                summary=f"Customer with ID {customer_id} not found",
                confidence=0.0,
                timestamp=datetime.utcnow()
            )

        row = records[0]
        customer = row["customer"]
        total_assets = row.get("totalAssets") or 0.0
        total_debt = row.get("totalDebt") or 0.0
        
        annual_income = customer.get("annualIncome") or 0.0
        credit_score = customer.get("creditScore") or 0
        
        # Policy rules:
        # 1. Credit Score must be >= 650 (POL-CRD-001)
        # 2. Debt-to-Income (DTI) including the new loan must not exceed 50% (POL-CRD-002)
        # Let's assume EMI on the new loan is roughly: requested_amount / 240 (20 years) * 1.08 (interest multiplier)
        estimated_annual_emi = (requested_amount / 20) * 1.08
        new_dti = ((total_debt + estimated_annual_emi) / annual_income * 100) if annual_income > 0 else 100.0

        is_eligible = True
        rejection_reasons = []
        logical_steps = []

        logical_steps.append(f"Retrieved credit score of {credit_score} for Customer:{customer_id}")
        if credit_score < 650:
            is_eligible = False
            rejection_reasons.append("Credit score is below the minimum required threshold of 650.")
            logical_steps.append("Policy check failed: Credit score is insufficient (< 650)")
        else:
            logical_steps.append("Policy check passed: Credit score is sufficient (>= 650)")

        logical_steps.append(f"Computed projected post-loan DTI ratio: {new_dti:.2f}%")
        if new_dti > 50:
            is_eligible = False
            rejection_reasons.append("Projected Debt-to-Income ratio exceeds the maximum policy limit of 50%.")
            logical_steps.append("Policy check failed: Projected DTI exceeds limit (> 50%)")
        else:
            logical_steps.append("Policy check passed: Projected DTI is within acceptable limit (<= 50%)")

        summary = ""
        if is_eligible:
            summary = f"Customer {customer.get('firstName')} {customer.get('lastName')} is ELIGIBLE for a Home Loan of INR {requested_amount:,.2f}."
        else:
            summary = f"Customer {customer.get('firstName')} {customer.get('lastName')} is NOT ELIGIBLE. Reason(s): {'; '.join(rejection_reasons)}"

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=0.95,
            supporting_policies=["POL-CRD-001", "POL-CRD-002", "POL-LOAN-005"]
        )

        evidence = SemanticEvidence(
            graph_path=[
                {"node": f"Customer:{customer_id}"},
                {"rel": "CONSTRAINED_BY", "node": "Policy:POL-CRD-001 (Credit Rating)"},
                {"rel": "CONSTRAINED_BY", "node": "Policy:POL-CRD-002 (DTI Threshold)"}
            ],
            metrics={
                "annual_income": annual_income,
                "credit_score": credit_score,
                "current_assets": total_assets,
                "current_debt": total_debt,
                "projected_annual_emi": estimated_annual_emi,
                "projected_dti_pct": round(new_dti, 2),
                "is_eligible": is_eligible
            }
        )

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=[{"type": "EligibilityAssessment", "id": f"EL-HL-{customer_id}", "properties": {"isEligible": is_eligible, "loanType": "HomeLoan", "requestedAmount": requested_amount}}],
            relationships=[],
            reasoning=reasoning,
            evidence=evidence,
            confidence=0.95,
            timestamp=datetime.utcnow()
        )

    async def recommend_savings_plan(self, customer_id: str) -> SemanticResponse:
        records, metrics = graph_service.run_read_query(
            advisor_queries.GET_CUSTOMER_FINANCIAL_PROFILE, {"customerId": customer_id}
        )

        if not records or not records[0]["customer"]:
            return SemanticResponse(status="error", summary="Customer not found", confidence=0.0)

        row = records[0]
        customer = row["customer"]
        total_assets = row.get("totalAssets") or 0.0

        # Simple heuristic: if checking or total liquid balance > 50,000 INR, suggest moving 60% of excess to High-Yield Savings
        excess_checking = max(0.0, total_assets - 50000.0)
        recommendation_details = {}
        logical_steps = []

        if excess_checking > 0:
            suggested_allocation = excess_checking * 0.60
            recommendation_details = {
                "planName": "SBI High-Yield Wealth Maximize Plan",
                "action": "Transfer funds from checking account to High-Yield Savings Account",
                "suggestedTransferAmount": suggested_allocation,
                "projectedAnnualReturnIncrease": suggested_allocation * 0.055 # Assuming 5.5% differential rate
            }
            logical_steps.append(f"Identified surplus liquid balance of INR {excess_checking:,.2f} over the standard holding buffer of INR 50,000")
            logical_steps.append(f"Calculated 60% wealth allocation: INR {suggested_allocation:,.2f} at a 5.5% annual rate increase")
            summary = f"Recommended Plan: Transfer INR {suggested_allocation:,.2f} to High-Yield Savings for an incremental return of INR {suggested_allocation * 0.055:,.2f}/year."
        else:
            recommendation_details = {
                "planName": "SBI Smart Savings Build Plan",
                "action": "Initiate Monthly Recurring Deposit of INR 2,000",
                "suggestedTransferAmount": 2000.0,
                "projectedAnnualReturnIncrease": 2000.0 * 12 * 0.06
            }
            logical_steps.append("Liquid balance is within standard buffers; recommending regular monthly savings accumulation")
            summary = "Recommended Plan: Set up a Monthly Recurring Deposit of INR 2,000 to steadily build cash reserves."

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=0.85,
            supporting_policies=["POL-ADV-001", "POL-SAV-003"]
        )

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=[{"type": "SavingsPlanRecommendation", "id": f"SR-{customer_id}", "properties": recommendation_details}],
            relationships=[],
            reasoning=reasoning,
            confidence=0.85,
            timestamp=datetime.utcnow()
        )

    async def find_cross_sell_opportunities(self, customer_id: str) -> SemanticResponse:
        # Retrieve existing recommendation nodes for the customer
        records, metrics = graph_service.run_read_query(
            advisor_queries.GET_RECOMMENDED_PRODUCTS_FOR_CUSTOMER, {"customerId": customer_id}
        )

        entities = []
        relationships = []
        logical_steps = []

        for row in records:
            reco = row["recommendation"]
            prod = row["product"]

            entities.append({"type": "Recommendation", "id": reco["recommendationId"], "properties": reco})
            entities.append({"type": "Product", "id": prod["productId"], "properties": prod})
            
            relationships.append({
                "type": "RECEIVED_RECOMMENDATION",
                "source": customer_id,
                "target": reco["recommendationId"]
            })
            relationships.append({
                "type": "RECOMMENDS_PRODUCT",
                "source": reco["recommendationId",],
                "target": prod["productId"]
            })
            
            logical_steps.append(f"Found active recommendation {reco['recommendationId']} for product '{prod['productName']}' (Confidence: {reco['confidence']:.2f})")

        summary = f"Identified {len(records)} active product cross-sell opportunities for Customer:{customer_id}."

        reasoning = SemanticReasoning(
            logical_steps=logical_steps,
            confidence=0.9,
            supporting_policies=["POL-MKT-007"]
        )

        return SemanticResponse(
            status="success",
            summary=summary,
            entities=entities,
            relationships=relationships,
            reasoning=reasoning,
            confidence=0.9,
            timestamp=datetime.utcnow()
        )

    def estimate_emi(self, loan_amount: float, annual_rate: float, tenure_months: int) -> Dict[str, Any]:
        """Calculates loan EMI (Equated Monthly Installment) using standard formula."""
        monthly_rate = (annual_rate / 12) / 100
        if monthly_rate == 0:
            emi = loan_amount / tenure_months
        else:
            emi = loan_amount * monthly_rate * ((1 + monthly_rate) ** tenure_months) / (((1 + monthly_rate) ** tenure_months) - 1)
        
        total_payment = emi * tenure_months
        total_interest = total_payment - loan_amount

        return {
            "loanAmount": loan_amount,
            "annualRatePercent": annual_rate,
            "tenureMonths": tenure_months,
            "monthlyEmi": round(emi, 2),
            "totalInterest": round(total_interest, 2),
            "totalPayment": round(total_payment, 2)
        }

advisor_service = AdvisorService()
