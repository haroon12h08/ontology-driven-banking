import sys
import os
from datetime import datetime
from typing import Dict, Any, List

sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from app.services.customer_service import customer_service
from engines.policy_engine import policy_engine
from explainability.explanation_engine import explanation_engine

class CustomerIntelligenceEngine:
    def _calculate_age(self, dob_str: str) -> int:
        try:
            birth_year = int(dob_str.split("-")[0])
            return datetime.utcnow().year - birth_year
        except Exception:
            return 40

    async def infer_intelligence(self, customer_id: str) -> Dict[str, Any]:
        """
        Runs semantic inference on the customer profile and financial data to determine segments,
        churn risk, life stage, affinities, relationship value, and behavioral patterns.
        """
        profile_res = await customer_service.get_profile(customer_id)
        if profile_res.status == "error" or not profile_res.entities:
            return {
                "decision": "Error",
                "summary": "Customer profile not found",
                "confidence": 0.0
            }

        cust_props = profile_res.entities[0].get("properties", {})
        dob_str = cust_props.get("dateOfBirth", "1980-01-01")
        age = self._calculate_age(dob_str)
        annual_income = float(cust_props.get("annualIncome", 0.0))
        occupation = cust_props.get("occupation", "Unknown")

        # Fetch accounts and financial health reports
        accounts_res = await customer_service.get_accounts(customer_id)
        total_balance = 0.0
        active_loans = 0
        active_ccs = 0
        if accounts_res.status == "success":
            for ent in accounts_res.entities:
                if ent["type"] == "Account":
                    props = ent.get("properties", {})
                    total_balance += float(props.get("balance", 0.0))
                    acc_type = props.get("accountType", "")
                    if "Loan" in acc_type:
                        active_loans += 1
                    elif "CreditCard" in acc_type:
                        active_ccs += 1

        fh_res = await customer_service.get_financial_health(customer_id)
        dti_ratio = 0.0
        savings_ratio = 0.0
        if fh_res.status == "success" and fh_res.evidence:
            dti_ratio = fh_res.evidence.metrics.get("dti_ratio_pct", 0.0) / 100.0
            savings_ratio = fh_res.evidence.metrics.get("savings_rate_pct", 0.0) / 100.0

        # Load Engagement Rules
        rules = policy_engine.get_engagement_policy("affluence_tiering")
        hnwi_limit = rules.get("hnwi_income_threshold_inr", 200000)
        ma_limit = rules.get("mass_affluent_income_threshold_inr", 100000)

        # 1. Customer Segment & Affluence
        if annual_income >= hnwi_limit:
            segment = "HNWI"
            affluence = "High Net Worth"
        elif annual_income >= ma_limit:
            segment = "MassAffluent"
            affluence = "Affluent"
        else:
            segment = "MassRetail"
            affluence = "Retail"

        # 2. Life Stage
        if age <= 25:
            life_stage = "Student / Early Career"
        elif age <= 35:
            life_stage = "Young Professional / Family Builder"
        elif age <= 55:
            life_stage = "Mid-Career / wealth Accumulator"
        elif age <= 65:
            life_stage = "Pre-Retirement"
        else:
            life_stage = "Retired / Senior Citizen"

        # 3. Relationship Value (TRV)
        trv = total_balance + (annual_income * 0.1) # proxy including estimated product holdings
        if trv > 500000:
            relationship_value = "High Value"
        elif trv > 100000:
            relationship_value = "Medium Value"
        else:
            relationship_value = "Standard Value"

        # 4. Digital Adoption
        # High if student/engineer/doctor, or high transaction density
        if occupation in ["Engineer", "Student"] or active_ccs > 0:
            digital_adoption = "High"
        else:
            digital_adoption = "Medium"

        # 5. Churn Risk (using Engagement Churn Rules)
        churn_rules = policy_engine.get_engagement_policy("churn_risk")
        # If savings ratio is low and DTI is extremely high
        if savings_ratio < 0.02 and dti_ratio > 0.50:
            churn_risk = "High Churn Risk"
        elif savings_ratio < 0.05:
            churn_risk = "Medium Churn Risk"
        else:
            churn_risk = "Low Churn Risk"

        # 6. Offer & Product Affinity
        if active_loans > 0:
            product_affinity = "Lending / Refinancing"
            offer_affinity = "Debt Consolidation Loans"
        elif total_balance > 200000:
            product_affinity = "Wealth Management / Mutual Funds"
            offer_affinity = "SBI Wealth SIP Portfolios"
        elif active_ccs == 0:
            product_affinity = "Credit Cards"
            offer_affinity = "SBI Elite Credit Card (Fee Waiver)"
        else:
            product_affinity = "Savings / FDs"
            offer_affinity = "SBI High Yield Fixed Deposits"

        # 7. Behaviour Pattern
        if savings_ratio >= 0.15:
            behaviour_pattern = "Disciplined Saver"
        elif dti_ratio > 0.40:
            behaviour_pattern = "Debt Dependent Spender"
        elif total_balance > 100000 and savings_ratio < 0.05:
            behaviour_pattern = "Liquid Cash Hoarder"
        else:
            behaviour_pattern = "Balanced Consumer"

        evidence = {
            "customerId": customer_id,
            "age": age,
            "annual_income": annual_income,
            "occupation": occupation,
            "total_balance": total_balance,
            "active_loans": active_loans,
            "active_ccs": active_ccs,
            "savings_ratio": savings_ratio,
            "dti_ratio": dti_ratio
        }

        reasoning_steps = [
            f"Evaluated affluence rules: income threshold INR {annual_income:,.2f} maps to '{segment}' segment.",
            f"Mapped age {age} to lifecyle stage '{life_stage}'.",
            f"Determined relationship value level based on Total Relationship Value (TRV: INR {trv:,.2f}).",
            f"Inferred behavioral spending habits as '{behaviour_pattern}' from savings & debt parameters."
        ]

        explanation = explanation_engine.create_explanation(
            decision=f"Segment: {segment} | Churn: {churn_risk}",
            evidence=evidence,
            supporting_policies=[{
                "id": "POL-ENG-AFF-001",
                "name": "SBI Wealth Management Segments"
            }],
            reasoning_steps=reasoning_steps,
            confidence=0.92,
            alternative_outcomes=[
                f"Digital Adoption level is classified as '{digital_adoption}'.",
                f"Primary product affinity identified is '{product_affinity}'."
            ]
        )

        # Append details as direct fields for easy use
        result = explanation.to_dict()
        result["inferences"] = {
            "segment": segment,
            "affluence": affluence,
            "life_stage": life_stage,
            "relationship_value": relationship_value,
            "digital_adoption": digital_adoption,
            "churn_risk": churn_risk,
            "product_affinity": product_affinity,
            "offer_affinity": offer_affinity,
            "behaviour_pattern": behaviour_pattern
        }

        return result

# Global CustomerIntelligenceEngine instance
customer_intelligence_engine = CustomerIntelligenceEngine()
