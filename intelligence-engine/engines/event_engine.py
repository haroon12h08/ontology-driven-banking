import sys
import os
from typing import Dict, Any, List

sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from engines.recommendation_engine import recommendation_engine
from engines.eligibility_engine import eligibility_engine
from engines.fraud_engine import fraud_engine
from engines.policy_engine import policy_engine
from app.services.risk_service import risk_service

class EventEngine:
    async def process_event(self, customer_id: str, event_name: str, event_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Reacts to banking events, producing recommendations, risk adjustments, and customer engagement actions.
        """
        event_data = event_data or {}
        recommendations = []
        risk_updates = []
        engagement_actions = []
        reasoning_steps = []

        reasoning_steps.append(f"Received event '{event_name}' for Customer:{customer_id}.")

        if event_name == "Salary Credited":
            # 1. Recommending savings/investments
            recs_res = await recommendation_engine.generate_recommendations(customer_id)
            if recs_res.get("recommendations"):
                # Filter to investment/savings products
                investments = [r for r in recs_res["recommendations"] if r["category"] in ["Investment", "Savings"]]
                recommendations.extend(investments[:2])
            
            # 2. Risk updates: positive cash inflow decreases short-term liquidity risk
            risk_updates.append({
                "type": "Liquidity risk update",
                "impact": "Decreased",
                "details": f"Salary credit of INR {event_data.get('amount', 0.0):,.2f} recorded."
            })
            
            # 3. Engagement
            engagement_actions.append({
                "channel": "PushNotification",
                "message": f"Salary of INR {event_data.get('amount', 0.0):,.2f} has been credited. Would you like to allocate 15% to a tax-saving Mutual Fund SIP?"
            })
            reasoning_steps.append("Processed fresh cash inflow: recommended savings and suggested a high-yield investment campaign.")

        elif event_name == "EMI Missed":
            # 1. Recommendations: refinancing/debt advice
            elig_res = await eligibility_engine.evaluate_eligibility(customer_id, "home_loan")
            if elig_res.get("decision") == "Eligible":
                recommendations.append({
                    "productId": "loan_refinance",
                    "productName": "SBI Loan Refinancing Plan",
                    "description": "Consolidate outstanding debt at a lower EMI schedule.",
                    "score": 0.85
                })

            # 2. Risk updates: increase risk profile score (missed payment penalty)
            risk_updates.append({
                "type": "Credit risk update",
                "impact": "Increased",
                "details": f"EMI Missed for Account {event_data.get('accountId', 'N/A')}. Flagged payment default alert (+20 risk points)."
            })

            # 3. Engagement: urgent repayment alerts
            engagement_actions.append({
                "channel": "SMS/Email",
                "priority": "Critical",
                "message": "SBI Alert: Your EMI payment was missed. Fund your account immediately to avoid negative impacts on your credit score."
            })
            reasoning_steps.append("Processed missed payment event: flagged credit score warnings and queued debt consolidation opportunities.")

        elif event_name == "KYC Expired":
            # 2. Risk updates
            risk_updates.append({
                "type": "Compliance risk update",
                "impact": "Block Triggered",
                "details": "KYC expired. Grace period of 30 days initiated."
            })

            # 3. Engagement
            engagement_actions.append({
                "channel": "MobileAppPopUp",
                "priority": "High",
                "message": "SBI Compliance: Your KYC documentation has expired. Complete your re-KYC online via Video-KYC in under 2 minutes to keep your accounts active."
            })
            reasoning_steps.append("Processed KYC expiration: triggered compliance notifications and set grace period flags.")

        elif event_name == "FD Matured":
            # 1. Recommendations: reinvestment options
            recommendations.append({
                "productId": "fixed_deposit",
                "productName": "SBI Golden Jubilee Fixed Deposit",
                "description": "Reinvest maturity principal at an elevated promo rate of 7.25% p.a.",
                "score": 0.95
            })

            # 3. Engagement
            engagement_actions.append({
                "channel": "RMCallAlert",
                "message": f"Fixed Deposit {event_data.get('accountId', 'N/A')} has matured. Prompt RM to discuss auto-renewal or mutual fund deployment."
            })
            reasoning_steps.append("Processed FD maturity: queued reinvestment options and scheduled RM customer outreach.")

        elif event_name == "Large Transaction":
            # 1. Validate via fraud engine
            tx_amount = float(event_data.get("amount", 0.0))
            merchant_id = event_data.get("merchantId", "Unknown")
            loc = event_data.get("location", "Unknown")
            dev = event_data.get("deviceId", "Unknown")
            recent_count = event_data.get("recent_tx_count_1h", 0)

            fraud_res = await fraud_engine.evaluate_transaction(
                customer_id, tx_amount, merchant_id, loc, dev, recent_count
            )

            # 2. Risk updates based on fraud evaluation
            decision = fraud_res.get("decision")
            risk_updates.append({
                "type": "Fraud assessment",
                "decision": decision,
                "fraud_probability_pct": fraud_res["evidence"].get("fraud_probability_pct", 0)
            })

            # 3. Engagement: approve, challenge or block
            if decision == "Block / Decline":
                engagement_actions.append({
                    "channel": "SystemDecline",
                    "priority": "Critical",
                    "message": "Transaction declined due to suspicious merchant flags or velocity limit breaches."
                })
            elif decision == "Flag / Step-up MFA":
                engagement_actions.append({
                    "channel": "PushMFA",
                    "priority": "High",
                    "message": "Authenticate transaction using SBI Secure OTP."
                })
            else:
                engagement_actions.append({
                    "channel": "Approval",
                    "message": "Transaction approved. No anomalies detected."
                })
            reasoning_steps.append(f"Processed large transaction: calculated fraud risk, resulted in decision '{decision}'.")

        elif event_name == "Card Blocked":
            # 1. Recommendations
            recommendations.append({
                "productId": "card_replacement",
                "productName": "SBI Card Replacement Service",
                "description": "Order a contactless replacement card.",
                "score": 0.90
            })

            # 3. Engagement
            engagement_actions.append({
                "channel": "MobileAppNotify",
                "message": "Your card was blocked safely. You can activate a virtual debit card inside the app for immediate online shopping."
            })
            reasoning_steps.append("Processed Card Block: offered virtual debit card access and queued physical replacement delivery.")

        elif event_name == "Customer Complaint":
            # 3. Engagement
            engagement_actions.append({
                "channel": "RMAction",
                "priority": "High",
                "message": f"Priority Alert: Relationship Manager assigned to resolve complaint ticket {event_data.get('ticketId', 'N/A')} immediately."
            })
            reasoning_steps.append("Processed customer complaint: assigned Relationship Manager for immediate customer resolution.")

        else:
            reasoning_steps.append("Unrecognized event type. Standard audit log registered.")

        return {
            "customer_id": customer_id,
            "event": event_name,
            "recommendations": recommendations,
            "risk_updates": risk_updates,
            "engagement_actions": engagement_actions,
            "reasoning_steps": reasoning_steps
        }

# Global EventEngine instance
event_engine = EventEngine()
