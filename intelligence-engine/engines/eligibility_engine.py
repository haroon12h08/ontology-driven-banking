import sys
import os
from datetime import datetime
from typing import Dict, Any, List

sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from app.services.customer_service import customer_service
from engines.policy_engine import policy_engine
from explainability.explanation_engine import explanation_engine

class EligibilityEngine:
    def _calculate_age(self, dob_str: str) -> int:
        try:
            birth_year = int(dob_str.split("-")[0])
            return datetime.utcnow().year - birth_year
        except Exception:
            return 35  # Default fallback age

    async def evaluate_eligibility(self, customer_id: str, product_type: str, requested_amount: float = 0.0) -> Dict[str, Any]:
        """
        Evaluates customer eligibility for Loans, Cards, FDs, Insurance, or Investment products.
        Returns a detailed explainability structure.
        """
        # Fetch profile and financial health data
        profile_res = await customer_service.get_profile(customer_id)
        if profile_res.status == "error" or not profile_res.entities:
            return {
                "decision": "Ineligible",
                "reasoning_steps": ["Customer profile could not be found."],
                "confidence": 0.0
            }

        cust_props = profile_res.entities[0].get("properties", {})
        credit_score = int(cust_props.get("creditScore", 0))
        dob_str = cust_props.get("dateOfBirth", "1990-01-01")
        age = self._calculate_age(dob_str)
        annual_income = float(cust_props.get("annualIncome", 0.0))
        segment = cust_props.get("segment", "MassRetail")

        # Fetch financial health metrics
        fh_res = await customer_service.get_financial_health(customer_id)
        dti_ratio = 0.0
        savings_balance = 0.0
        if fh_res.status == "success" and fh_res.evidence:
            metrics = fh_res.evidence.metrics
            dti_ratio = metrics.get("dti_ratio_pct", 0.0) / 100.0
            savings_balance = metrics.get("savings_balance", 0.0)

        # Determine which policy rules file to load
        rule = {}
        policy_id = ""
        policy_name = ""
        is_loan_or_card = product_type in ["home_loan", "car_loan", "education_loan", "credit_card"]

        if is_loan_or_card:
            rule = policy_engine.get_loan_policy(product_type)
            policy_id = rule.get("id", "POL-LOAN-001")
            policy_name = rule.get("name", "SBI Loan Policy")
        else:
            rule = policy_engine.get_investment_policy(product_type)
            policy_id = rule.get("id", "POL-INV-001")
            policy_name = rule.get("name", "SBI Investment Policy")

        if not rule:
            return {
                "decision": "Ineligible",
                "reasoning_steps": [f"No active eligibility policy configured for product type '{product_type}'."],
                "confidence": 0.0
            }

        eligible = True
        reasoning_steps = []
        improvements = []
        evidence = {
            "age": age,
            "credit_score": credit_score,
            "annual_income": annual_income,
            "dti_ratio": dti_ratio,
            "segment": segment,
            "requested_amount": requested_amount
        }

        # Evaluate rules based on the loaded policy configuration
        # 1. Age check
        min_age = rule.get("min_age")
        max_age = rule.get("max_age")
        if min_age is not None and age < min_age:
            eligible = False
            reasoning_steps.append(f"Rejected: Age {age} is below minimum requirement of {min_age}.")
            improvements.append(f"Re-apply when age satisfies minimum limit of {min_age}.")
        elif max_age is not None and age > max_age:
            eligible = False
            reasoning_steps.append(f"Rejected: Age {age} exceeds maximum requirement of {max_age}.")
        else:
            reasoning_steps.append(f"Passed: Age {age} satisfies the policy range.")

        # 2. Credit score check
        min_credit = rule.get("min_credit_score")
        if min_credit is not None:
            if credit_score < min_credit:
                eligible = False
                reasoning_steps.append(f"Rejected: Credit score {credit_score} is below requirement of {min_credit}.")
                improvements.append(f"Improve credit score to at least {min_credit} by reducing defaults.")
            else:
                reasoning_steps.append(f"Passed: Credit score {credit_score} meets or exceeds required {min_credit}.")

        # 3. Income check
        min_income = rule.get("min_annual_income_inr")
        if min_income is not None:
            if annual_income < min_income:
                eligible = False
                reasoning_steps.append(f"Rejected: Annual income INR {annual_income:,.2f} is below requirement of INR {min_income:,.2f}.")
                improvements.append(f"Increase annual income to at least INR {min_income:,.2f} or declare auxiliary income.")
            else:
                reasoning_steps.append(f"Passed: Annual income INR {annual_income:,.2f} meets required threshold.")

        # 4. Debt ratio (DTI) check
        max_dti = rule.get("max_dti_ratio")
        if max_dti is not None:
            # If requested amount is provided, project the new DTI
            projected_dti = dti_ratio
            if requested_amount > 0 and is_loan_or_card:
                # Assume 1% monthly payment for requested amount
                projected_monthly_debt = (dti_ratio * annual_income / 12) + (requested_amount * 0.01)
                projected_dti = projected_monthly_debt / (annual_income / 12) if annual_income > 0 else 1.0
            
            if projected_dti > max_dti:
                eligible = False
                reasoning_steps.append(f"Rejected: Projected Debt-to-Income ratio {projected_dti*100:.2f}% exceeds limit of {max_dti*100:.0f}%.")
                improvements.append(f"Reduce existing debt load or ask for a lower loan amount than INR {requested_amount:,.2f}.")
            else:
                reasoning_steps.append(f"Passed: Debt-to-Income ratio {projected_dti*100:.2f}% is within acceptable limit of {max_dti*100:.0f}%.")
                evidence["projected_dti_pct"] = round(projected_dti * 100, 2)

        # 5. Segment checks (for mutual funds/investments)
        allowed_segments = rule.get("allowed_customer_segments")
        if allowed_segments is not None:
            if segment not in allowed_segments:
                eligible = False
                reasoning_steps.append(f"Rejected: Customer segment '{segment}' is not eligible for this product. Requires one of: {allowed_segments}.")
            else:
                reasoning_steps.append(f"Passed: Customer segment '{segment}' is eligible.")

        # 6. Minimum deposit (for FD check)
        min_deposit = rule.get("min_deposit_amount_inr")
        if min_deposit is not None and requested_amount > 0:
            if requested_amount < min_deposit:
                eligible = False
                reasoning_steps.append(f"Rejected: Deposit amount INR {requested_amount:,.2f} is below minimum requirement of INR {min_deposit:,.2f}.")
                improvements.append(f"Increase deposit principal to at least INR {min_deposit:,.2f}.")
            else:
                reasoning_steps.append(f"Passed: Deposit amount INR {requested_amount:,.2f} meets requirement.")

        decision = "Eligible" if eligible else "Ineligible"
        confidence = 0.98 if eligible else 0.95

        explanation = explanation_engine.create_explanation(
            decision=decision,
            evidence=evidence,
            supporting_policies=[{
                "id": policy_id,
                "name": policy_name
            }],
            reasoning_steps=reasoning_steps,
            confidence=confidence,
            alternative_outcomes=improvements if not eligible else [
                "Proceed to application filing.",
                "Review promotional interest rate options."
            ]
        )

        return explanation.to_dict()

# Global EligibilityEngine instance
eligibility_engine = EligibilityEngine()
