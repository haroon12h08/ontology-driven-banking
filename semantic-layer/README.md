# SBI Enterprise Banking Semantic Query & Reasoning Service

This is the **Ontology Service Layer** that acts as the single gateway for AI agents to query the SBI Knowledge Graph. AI agents must never execute raw Cypher query statements directly against the Neo4j database. Instead, they access semantic domain concepts and logical reasoning explanations via this RESTful API service.

## Core Features
1. **Semantic Query Isolation**: Translates high-level agent queries into optimized read-only Cypher queries.
2. **Explainable AI Reasoning**: Evaluates rules (e.g. loan eligibility, customer risk profiles) and returns step-by-step reasoning logic, metrics, evidence, and confidence scores.
3. **Graph-to-RDF Type Conversion**: Standardizes Neo4j-specific temporal data types (e.g. `Date`, `DateTime`) into standard JSON-compliant ISO formats.
4. **Ontology Reflection**: Allows agents to introspect the underlying OWL ontology class structures and properties directly.

---

## Getting Started

### Prerequisites
- Python 3.10+
- Running Neo4j Instance (configured with Neosemantics and APOC)
  ```bash
  cd ../knowledge-graph/docker && docker-compose up -d
  ```

### Installation
1. Navigate to the `semantic-layer/` directory.
2. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Running the API Server
Start the Uvicorn development server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Access the interactive OpenAPI Swagger documentation at: **`http://localhost:8000/docs`**

### Running the Tests
To validate all endpoints against the live graph database, run:
```bash
pytest tests/
```

---

## API Documentation Summary

### 1. Customer Intelligence (`/api/customers`)
- **`GET /api/customers/{id}/profile`**: Retrieves complete customer demographic details, segment, credit score, and assigned relationship manager.
- **`GET /api/customers/{id}/financial-health`**: Returns calculated financial metrics: DTI ratio, credit utilization rate, total assets, total liabilities, and savings-to-income ratio.

### 2. Products Catalog & Recommendations (`/api/products` & `/api/recommendations`)
- **`GET /api/products`**: Lists all available financial products (Savings, Credit Cards, Mortgages) along with their governing policy constraints.
- **`GET /api/recommendations/customer/{customerId}`**: Returns personalized product recommendations based on customer profile rules.
- **`GET /api/recommendations/{id}/explain`**: Returns the specific rule matching context that triggered the recommendation.

### 3. Transactions & Operations (`/api/transactions` & `/api/operations`)
- **`GET /api/transactions/account/{accountId}`**: Lists transaction history for an account.
- **`GET /api/operations/service-requests/pending`**: Lists open service requests requiring immediate operations team response.
- **`GET /api/operations/branches`**: Retrieves physically mapped branches.

### 4. Semantic Reasoning Engine (`/api/reasoning`)
- **`GET /api/reasoning/explain/loan-eligibility`**: Analyzes the customer's income, debt, and credit score to determine and explain loan eligibility.
- **`GET /api/reasoning/explain/customer-risk`**: Evaluates active risk events, credit card utilization, and loan balances to explain customer risk rating.

### 5. Ontology Navigation (`/api/ontology`)
- **`GET /api/ontology/classes`**: Introspects classes imported from the OWL ontology (`n4sch__Class`).
- **`GET /api/ontology/properties`**: Introspects object and datatype properties (`n4sch__Property` / `n4sch__Relationship`).
