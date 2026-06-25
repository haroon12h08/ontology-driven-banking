import os
import sys
import pytest

# Add parent path to import engines
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
# Add semantic-layer path
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")

from app.services.graph_service import graph_service
from services.intelligence_service import intelligence_service

@pytest.fixture(scope="session", autouse=True)
def setup_db_connection():
    graph_service.connect()
    yield
    graph_service.close()

def test_policy_engine():
    # 1. Test loading loan policies
    rule = intelligence_service.policy.get_loan_policy("home_loan")
    assert rule["id"] == "POL-LOAN-HOME-001"
    assert rule["min_credit_score"] == 650
    assert rule["max_dti_ratio"] == 0.50

    # 2. Test loading fraud policies
    fraud_rule = intelligence_service.policy.get_fraud_policy("transaction_risk")
    assert fraud_rule["id"] == "POL-FRAUD-TX-001"
    assert "M-999" in fraud_rule["merchant_blacklist"]

@pytest.mark.anyio
async def test_eligibility_engine():
    # CUST-006 should be eligible for fixed deposits but ineligible for low-credit products if thresholds fail
    res = await intelligence_service.eligibility.evaluate_eligibility("CUST-006", "fixed_deposit", 50000.0)
    assert res["decision"] == "Eligible"
    assert res["confidence"] >= 0.90
    assert "Passed: Deposit amount INR 50,000.00 meets requirement." in res["reasoning_steps"]

@pytest.mark.anyio
async def test_financial_health_engine():
    res = await intelligence_service.health.compute_health("CUST-006")
    assert res["decision"] in ["Excellent", "Good", "Fair", "Poor"]
    assert "net_worth" in res["evidence"]
    assert res["evidence"]["net_worth"] > 0

@pytest.mark.anyio
async def test_recommendation_engine():
    res = await intelligence_service.recommendations.generate_recommendations("CUST-006")
    assert len(res["recommendations"]) > 0
    # The list should be sorted by score descending
    scores = [r["score"] for r in res["recommendations"]]
    assert scores == sorted(scores, reverse=True)

@pytest.mark.anyio
async def test_fraud_engine():
    # Assuring blacklisted merchant triggers Block decision
    res = await intelligence_service.fraud.evaluate_transaction(
        customer_id="CUST-006",
        transaction_amount=100000.0,
        merchant_id="M-999"
    )
    assert res["decision"] == "Block / Decline"
    assert res["evidence"]["fraud_probability_pct"] >= 70.0

@pytest.mark.anyio
async def test_event_engine():
    res = await intelligence_service.events.process_event(
        customer_id="CUST-001",
        event_name="EMI Missed",
        event_data={"accountId": "ACC-LOAN-99", "amount": 10000.0}
    )
    assert res["customer_id"] == "CUST-001"
    assert any(u["type"] == "Credit risk update" for u in res["risk_updates"])
    assert any("EMI payment was missed" in a["message"] for a in res["engagement_actions"])

@pytest.mark.anyio
async def test_explainability_structure():
    res = await intelligence_service.reasoning.explain_financial_health("CUST-006")
    assert "decision" in res
    assert "evidence" in res
    assert "supporting_policies" in res
    assert "reasoning_steps" in res
    assert "confidence" in res
    assert "alternative_outcomes" in res
