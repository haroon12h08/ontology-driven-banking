# SBI Enterprise Banking Intelligence Engine

The **Banking Intelligence Engine** is the core reasoning and decision-making framework of the SBI AI-First banking platform. It acts as the single source of truth for all cognitive agents (Customer Intelligence, Financial Advisor, Risk, Operations, and Engagement), ensuring no business rules or logic are duplicated or hardcoded inside individual agents.

---

## Architectural Principles
- **No Hardcoded Rules**: Business rules live inside clean YAML configuration files.
- **No Direct DB Access**: Engines do not use Cypher queries. They consume semantic graph representations resolved by the **Semantic Layer**.
- **Unified Explainability**: Every decision returns a standardized explanation payload containing decisions, evidence, graph paths, rules, reasoning steps, confidence scores, and alternative outcomes.

---

## Project Structure
```
intelligence-engine/
├── engines/
│   ├── customer_intelligence_engine.py  # Infers segments, life stages, and churn risks
│   ├── eligibility_engine.py            # Evaluates loans/investments eligibility
│   ├── engagement_engine.py             # Determines customer touchpoint strategies
│   ├── event_engine.py                  # Reacts to lifecycle banking events
│   ├── financial_health_engine.py       # Computes net worth and wellness scores
│   ├── fraud_engine.py                  # Evaluates real-time transaction anomalies
│   ├── policy_engine.py                 # Loads and caches rules from YAML files
│   └── reasoning_engine.py              # Unifies explanation orchestration
├── explainability/
│   └── explanation_engine.py            # Formats standard explainable outputs
├── rules/
│   ├── engagement_rules.yaml            # Affluence, retention, and NBA rules
│   ├── fraud_rules.yaml                 # Velocity, location, and blacklists
│   ├── loan_rules.yaml                  # Age, credit, income, and DTI caps
│   ├── risk_rules.yaml                  # Credit risk and missed payment weights
│   └── investment_rules.yaml            # Suitability segments and minimums
├── services/
│   └── intelligence_service.py          # Unified entry-point orchestrator
├── tests/
│   └── test_engines.py                  # Pytest verification suite
├── README.md                            # Documentation
├── requirements.txt                     # Dependencies
└── run_scenarios.py                     # 9 Customer Journey Scenarios simulator
```

---

## Reusable Scenarios Demonstrated
We have built a scenario simulator (`run_scenarios.py`) demonstrating **9 core journeys**:
1. **Home Loan Journey**: Evaluates credit scoring, income, and debt ratios for approved and rejected candidates.
2. **Fraud Detection**: Flags suspicious transactions targeting blacklisted merchants, unrecognized devices, and location discrepancies.
3. **Salary Increase**: Suggests investment products and sticky campaigns upon cash inflows.
4. **Investment Recommendation**: Identifies mutual fund and FD matches based on segment and habits.
5. **Customer Churn**: Inferring low savings and high debt ratios to flag churn risks.
6. **Card Upgrade**: Recommends card tiers matching credit scores and policies.
7. **Insurance Recommendation**: Checks Term Life Shield eligibility.
8. **EMI Missed**: Reacts to payment defaults by adjusting risk scores and pushing alerts.
9. **KYC Expired**: Triggers grace period timers and app block notices.

---

## Installation & Running

### Prerequisites
Ensure the Neo4j database is active and the Semantic Layer dependencies are present:
```bash
# Start the Neo4j DB container if not already running
cd ../knowledge-graph/docker && docker-compose up -d
```

### Installation
1. Navigate to the `intelligence-engine/` folder:
   ```bash
   cd intelligence-engine
   ```
2. Activate your virtual environment and install the engine dependencies:
   ```bash
   source ../semantic-layer/.venv/bin/activate
   pip install -r requirements.txt
   ```

### Running the Scenarios Simulator
Execute the complete customer journey simulation:
```bash
python run_scenarios.py
```

### Running the Test Suite
Validate the entire decision logic, rule parsing, fraud thresholds, and explainability payloads:
```bash
pytest tests/
```
