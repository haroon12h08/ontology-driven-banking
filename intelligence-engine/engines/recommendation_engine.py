import sys
import os
from typing import Dict, Any, List

sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.customer_intelligence_engine import customer_intelligence_engine
from engines.eligibility_engine import eligibility_engine
from engines.policy_engine import policy_engine
from explainability.explanation_engine import explanation_engine

class RecommendationEngine:
    async def generate_recommendations(self, customer_id: str) -> Dict[str, Any]:
        """
        Generates, evaluates eligibility for, and ranks product recommendations for a customer.
        """
        # Fetch customer inferences
        intel = await customer_intelligence_engine.infer_intelligence(customer_id)
        if "inferences" not in intel:
            return {
                "decision": "No Recommendations",
                "recommendations": [],
                "confidence": 0.0
            }

        inferences = intel["inferences"]
        segment = inferences["segment"]
        product_affinity = inferences["product_affinity"]
        offer_affinity = inferences["offer_affinity"]
        behaviour_pattern = inferences["behaviour_pattern"]

        raw_recs = []

        # List of potential products to evaluate eligibility for
        products_to_test = [
            ("home_loan", "Home Loan", "Lending", 2500000.0, "SBI Griha Pravesh Home Loan with competitive rates."),
            ("car_loan", "Car Loan", "Lending", 800000.0, "SBI Auto Loan with minimal documentation."),
            ("credit_card", "Elite Credit Card", "Cards", 0.0, "Premium credit card with airport lounge access & reward points."),
            ("fixed_deposit", "Fixed Deposit", "Savings", 50000.0, "High-yield fixed deposit securing interest rate returns."),
            ("mutual_fund_conservative", "Conservative Mutual Fund", "Investment", 10000.0, "Debt-oriented safe mutual funds."),
            ("mutual_fund_aggressive", "Aggressive Equity Fund", "Investment", 25000.0, "High-growth equity mutual funds for capital appreciation."),
            ("insurance_term", "Term Life Insurance", "Insurance", 0.0, "SBI Life Shield covering family against unforeseen risks.")
        ]

        reasoning_steps = []
        reasoning_steps.append(f"Analyzing product matches for segment '{segment}' with affinity for '{product_affinity}'.")

        # Load policy guidelines
        nba_policy = policy_engine.get_engagement_policy("next_best_action")

        for prod_key, prod_name, prod_cat, amount, desc in products_to_test:
            # Check eligibility
            elig_res = await eligibility_engine.evaluate_eligibility(customer_id, prod_key, amount)
            
            if elig_res.get("decision") == "Eligible":
                # Compute recommendation strength score based on affinity
                base_score = 0.50
                match_reasons = []

                # Segment alignment
                if segment == "HNWI" and prod_key in ["mutual_fund_aggressive", "credit_card"]:
                    base_score += 0.20
                    match_reasons.append("Premium HNWI fit (+20%)")
                elif segment == "MassRetail" and prod_key in ["fixed_deposit", "mutual_fund_conservative"]:
                    base_score += 0.15
                    match_reasons.append("Mass Retail safe investment fit (+15%)")

                # Category affinity matching
                if prod_cat == "Lending" and product_affinity == "Lending / Refinancing":
                    base_score += 0.25
                    match_reasons.append(f"Matches primary product affinity: {product_affinity} (+25%)")
                elif prod_cat == "Investment" and product_affinity == "Wealth Management / Mutual Funds":
                    base_score += 0.25
                    match_reasons.append(f"Matches primary product affinity: {product_affinity} (+25%)")
                elif prod_cat == "Cards" and product_affinity == "Credit Cards":
                    base_score += 0.25
                    match_reasons.append(f"Matches primary product affinity: {product_affinity} (+25%)")

                # Behavioral alignment
                if behaviour_pattern == "Disciplined Saver" and prod_cat in ["Savings", "Investment"]:
                    base_score += 0.10
                    match_reasons.append("Aligned with Disciplined Saver habits (+10%)")
                elif behaviour_pattern == "Debt Dependent Spender" and prod_key == "fixed_deposit":
                    base_score -= 0.10
                    match_reasons.append("Low suitability for debt dependent profile (-10%)")

                final_score = min(max(base_score, 0.0), 1.0)

                # Determine NBA context
                nba_type = "Cross Sell"
                if prod_cat == "Cards" and inferences["active_ccs"] > 0:
                    nba_type = "Upsell"
                elif prod_cat == "Savings":
                    nba_type = "Retention / Sticky Product"

                raw_recs.append({
                    "productId": prod_key,
                    "productName": prod_name,
                    "category": prod_cat,
                    "nbaType": nba_type,
                    "description": desc,
                    "score": final_score,
                    "suitability_factors": match_reasons
                })
                reasoning_steps.append(f"Evaluated '{prod_name}': Eligible, matched parameters (Score: {final_score:.2f}).")
            else:
                reasoning_steps.append(f"Evaluated '{prod_name}': Ineligible according to policy criteria.")

        # Sort recommendations by score descending
        ranked_recs = sorted(raw_recs, key=lambda x: x["score"], reverse=True)

        evidence = {
            "customerId": customer_id,
            "segment": segment,
            "inferred_affinity": product_affinity,
            "behaviour_pattern": behaviour_pattern,
            "total_matches_found": len(ranked_recs)
        }

        explanation = explanation_engine.create_explanation(
            decision=f"Generated {len(ranked_recs)} personalized product offers.",
            evidence=evidence,
            supporting_policies=[{
                "id": nba_policy.get("id", "POL-ENG-NBA-001"),
                "name": nba_policy.get("name", "SBI Retail Customer Engagement Campaign")
            }],
            reasoning_steps=reasoning_steps[:8], # limit steps count for readability
            confidence=0.90,
            alternative_outcomes=[r["productName"] for r in ranked_recs[1:4]] if len(ranked_recs) > 1 else []
        )

        output = explanation.to_dict()
        output["recommendations"] = ranked_recs
        return output

# Global RecommendationEngine instance
recommendation_engine = RecommendationEngine()
