import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure the app module can be found
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.services.graph_service import graph_service

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db_connection():
    # Connect before running tests
    graph_service.connect()
    yield
    # Close after tests complete
    graph_service.close()

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "ServiceHealth" in [e["type"] for e in data["entities"]]

def test_list_products():
    response = client.get("/api/products")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["entities"]) > 0
    assert any(e["type"] == "Product" for e in data["entities"])

def test_customer_profile():
    # Customer CUST-001 should exist in the generated dataset
    response = client.get("/api/customers/CUST-001/profile")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert any(e["type"] == "Customer" for e in data["entities"])

def test_customer_financial_health():
    response = client.get("/api/customers/CUST-001/financial-health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "FH-CUST-001" in [e["id"] for e in data["entities"]]
    assert "metrics" in data["evidence"]

def test_explain_loan_eligibility():
    response = client.get("/api/reasoning/explain/loan-eligibility?customerId=CUST-001&requestedAmount=1000000")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "logical_steps" in data["reasoning"]
    assert "projected_dti_pct" in data["evidence"]["metrics"]

def test_explain_customer_risk():
    response = client.get("/api/reasoning/explain/customer-risk?customerId=CUST-001")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "risk_event_count" in data["evidence"]["metrics"]

def test_policy_search():
    response = client.get("/api/policies/search?q=KYC")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

def test_ontology_classes():
    response = client.get("/api/ontology/classes")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["entities"]) > 0
