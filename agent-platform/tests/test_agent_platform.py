import sys
import os
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, "/home/haroon/Desktop/SBI/semantic-layer")
sys.path.insert(0, "/home/haroon/Desktop/SBI/intelligence-engine")

from app.services.graph_service import graph_service
from orchestrator.orchestrator import orchestrator

@pytest.fixture(scope="module", autouse=True)
def setup_neo4j():
    graph_service.connect()
    yield
    graph_service.close()

@pytest.mark.asyncio
async def test_home_loan_workflow():
    res = await orchestrator.process_user_intent("CUST-006", "I want to buy a house.")
    assert res["workflow_name"] == "Home Loan Journey"
    assert "final_output" in res
    assert "explainability" in res
    assert "observability" in res
    assert len(res["explainability"]["reasoning_chain"]) > 0

@pytest.mark.asyncio
async def test_fraud_workflow():
    res = await orchestrator.process_user_intent("CUST-006", "Process transaction: Suspicious charge of INR 60,000.00 at M-999 in Delhi.")
    assert res["workflow_name"] == "Fraud Detection"
    assert "final_output" in res
    assert "transaction_risk" in res["explainability"]["evidence"]["risk_assessment"]

@pytest.mark.asyncio
async def test_investment_workflow():
    res = await orchestrator.process_user_intent("CUST-006", "I want to find the best investment portfolio.")
    assert res["workflow_name"] == "Investment Advice"
    assert res["explainability"]["evidence"]["recommendations_count"] >= 0

@pytest.mark.asyncio
async def test_kyc_workflow():
    res = await orchestrator.process_user_intent("CUST-006", "Trigger KYC expired check.")
    assert res["workflow_name"] == "KYC Renewal"

@pytest.mark.asyncio
async def test_salary_workflow():
    res = await orchestrator.process_user_intent("CUST-006", "Salary credited event.")
    assert res["workflow_name"] == "Salary Credit"

@pytest.mark.asyncio
async def test_complaint_workflow():
    res = await orchestrator.process_user_intent("CUST-006", "File support grievance: double debited.")
    assert res["workflow_name"] == "Customer Complaint"

@pytest.mark.asyncio
async def test_card_upgrade_workflow():
    res = await orchestrator.process_user_intent("CUST-006", "I want to upgrade my credit card.")
    assert res["workflow_name"] == "Card Upgrade"

@pytest.mark.asyncio
async def test_insurance_workflow():
    res = await orchestrator.process_user_intent("CUST-006", "What is my term life suitability?")
    assert res["workflow_name"] == "Insurance Recommendation"
