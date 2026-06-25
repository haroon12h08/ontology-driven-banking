import sys
import os
from typing import Dict, Any

# Insert semantic-layer path to allow importing its services
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from app.services.customer_service import customer_service
from app.services.graph_service import graph_service
from engines.policy_engine import policy_engine
from explainability.explanation_engine import explanation_engine, Explanation

class FinancialHealthEngine:
    async def compute_health(self, customer_id: str) -> Dict[str, Any]:
        """
        Computes detailed financial health metrics and returns a unified score with explainability.
        """
        # Fetch semantic financial health data
        res = await customer_service.get_financial_health(customer_id)
        if res.status == "error":
            return {
                "decision": "Error",
                "summary": res.summary,
                "confidence": 0.0
            }

        metrics = res.evidence.metrics
        total_balance = metrics.get("total_balance", 0.0)
        savings_balance = metrics.get("savings_balance", 0.0)
        checking_balance = metrics.get("checking_balance", 0.0)
        debt_balance = metrics.get("debt_balance", 0.0)
        tx_volume = metrics.get("transaction_volume", 0.0)
        tx_count = metrics.get("transaction_count", 0)
        annual_income = metrics.get("annual_income", 0.0)

        # 1. Net Worth
        net_worth = (savings_balance + checking_balance) - debt_balance

        # 2. Savings Ratio & Debt Ratio
        savings_ratio = (savings_balance / annual_income) if annual_income > 0 else 0.0
        debt_ratio = (debt_balance / annual_income) if annual_income > 0 else 0.0

        # Fetch profile for occupation-based calculations
        profile_res = await customer_service.get_profile(customer_id)
        occupation = "Unknown"
        credit_score = 650
        if profile_res.status == "success" and len(profile_res.entities) > 0:
            cust_props = profile_res.entities[0].get("properties", {})
            occupation = cust_props.get("occupation", "Unknown")
            credit_score = cust_props.get("creditScore", 650)

        # 3. Income Stability
        # High stability for Doctors, Engineers, Teachers; Medium for Consultants; Low for Students, Artists, Retired
        if occupation in ["Doctor", "Engineer", "Teacher"]:
            income_stability = 0.95
        elif occupation in ["Consultant", "Business Owner"]:
            income_stability = 0.80
        elif occupation in ["Retired"]:
            income_stability = 0.70
        else:
            income_stability = 0.40

        # 4. Emergency Fund (Months of expenses covered)
        # Approximate monthly expense as transaction volume divided by 12, or a default fraction of income
        monthly_expense = (tx_volume / 12) if tx_count > 0 else (annual_income * 0.7 / 12)
        if monthly_expense <= 0:
            monthly_expense = 10000.0  # Fallback
        liquid_assets = savings_balance + checking_balance
        emergency_fund_months = liquid_assets / monthly_expense

        # 5. Cash Flow Stability
        # Volatility index calculated based on transaction counts
        if tx_count > 100:
            cash_flow_stability = 0.90
        elif tx_count > 20:
            cash_flow_stability = 0.75
        else:
            cash_flow_stability = 0.50

        # 6. Expense Behaviour
        # Ratio of expenses to income
        annual_expense = monthly_expense * 12
        expense_ratio = annual_expense / annual_income if annual_income > 0 else 1.0
        if expense_ratio < 0.5:
            expense_behaviour = "Frugal"
        elif expense_ratio < 0.8:
            expense_behaviour = "Balanced"
        else:
            expense_behaviour = "Extravagant"

        # 7. Lifestyle Score
        # Proxy based on segment & spending levels
        if net_worth > 500000:
            lifestyle_score = 85.0
        elif net_worth > 100000:
            lifestyle_score = 70.0
        else:
            lifestyle_score = 50.0

        # 8. Investment Readiness
        # Ready if DTI is low, credit score is decent, and emergency fund covers at least 3 months
        if debt_ratio < 0.40 and credit_score >= 600 and emergency_fund_months >= 3.0:
            investment_readiness = "High"
        elif debt_ratio < 0.55 and emergency_fund_months >= 1.0:
            investment_readiness = "Moderate"
        else:
            investment_readiness = "Low"

        # 9. Unified Health Score (0 - 100)
        # Breakdown:
        # - Net Worth and balance: 25%
        # - DTI (Debt ratio): 25%
        # - Savings ratio: 20%
        # - Emergency fund: 20%
        # - Income stability: 10%
        score = 0.0
        reasoning_steps = []

        if net_worth > 0:
            score += 25.0
            reasoning_steps.append(f"Net worth is positive at INR {net_worth:,.2f} (+25 pts).")
        else:
            reasoning_steps.append("Net worth is zero or negative (0 pts).")

        # DTI score
        if debt_ratio < 0.20:
            score += 25.0
            reasoning_steps.append(f"Debt-to-Income ratio is excellent at {debt_ratio*100:.2f}% (+25 pts).")
        elif debt_ratio < 0.45:
            score += 15.0
            reasoning_steps.append(f"Debt-to-Income ratio is moderate at {debt_ratio*100:.2f}% (+15 pts).")
        else:
            reasoning_steps.append(f"Debt-to-Income ratio is high at {debt_ratio*100:.2f}% (0 pts).")

        # Savings ratio score
        if savings_ratio >= 0.15:
            score += 20.0
            reasoning_steps.append(f"Savings ratio is strong at {savings_ratio*100:.2f}% (+20 pts).")
        elif savings_ratio >= 0.05:
            score += 10.0
            reasoning_steps.append(f"Savings ratio is moderate at {savings_ratio*100:.2f}% (+10 pts).")
        else:
            reasoning_steps.append(f"Savings ratio is weak at {savings_ratio*100:.2f}% (0 pts).")

        # Emergency fund score
        if emergency_fund_months >= 6.0:
            score += 20.0
            reasoning_steps.append(f"Emergency fund covers {emergency_fund_months:.1f} months of expenses (+20 pts).")
        elif emergency_fund_months >= 3.0:
            score += 10.0
            reasoning_steps.append(f"Emergency fund covers {emergency_fund_months:.1f} months of expenses (+10 pts).")
        else:
            reasoning_steps.append(f"Emergency fund is insufficient, covering only {emergency_fund_months:.1f} months (0 pts).")

        # Income stability score
        score += income_stability * 10
        reasoning_steps.append(f"Income stability of {income_stability*100:.0f}% based on occupation '{occupation}' (+{income_stability*10:.1f} pts).")

        decision = "Excellent" if score >= 85 else "Good" if score >= 60 else "Fair" if score >= 40 else "Poor"

        evidence_payload = {
            "financial_health_score": round(score, 2),
            "savings_ratio_pct": round(savings_ratio * 100, 2),
            "debt_ratio_pct": round(debt_ratio * 100, 2),
            "emergency_fund_months": round(emergency_fund_months, 2),
            "cash_flow_stability": cash_flow_stability,
            "income_stability": income_stability,
            "investment_readiness": investment_readiness,
            "expense_behaviour": expense_behaviour,
            "lifestyle_score": lifestyle_score,
            "net_worth": net_worth
        }

        # Policy Reference
        risk_policy = policy_engine.get_risk_policy("financial_risk")

        explanation = explanation_engine.create_explanation(
            decision=decision,
            evidence=evidence_payload,
            supporting_policies=[{
                "id": risk_policy.get("id", "POL-RISK-FIN-001"),
                "name": risk_policy.get("name", "SBI Financial Exposure Risk Policy")
            }],
            reasoning_steps=reasoning_steps,
            confidence=0.95,
            alternative_outcomes=[
                "Boost savings ratio to above 15% to increase overall score.",
                "Build emergency fund to cover at least 6 months of expenses.",
                "Reduce outstanding debt balance to lower debt ratio below 20%."
            ]
        )

        return explanation.to_dict()

# Global FinancialHealthEngine instance
financial_health_engine = FinancialHealthEngine()
