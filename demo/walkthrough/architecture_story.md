# The Technical Story: Architecture & Design Decisions
**Platform Name:** SBI Enterprise Semantic AI Banking Platform  
**Architect:** Principal Staff Systems Architect

---

## 1. Unified Semantic Memory
In typical LLM systems, agents fetch data using raw Vector Search (RAG) and construct temporary prompt context. This leads to disjointed reasoning, memory loss, and hallucinations.

Our platform utilizes a **Neo4j Knowledge Graph** as the single source of truth and shared semantic memory. All agents read from and write back to this graph. When the `AdvisorAgent` updates a customer's profile or evaluates an account, the modifications are committed to Neo4j. Subsequently, when the `RiskAgent` executes, it reads the updated state.

### Key Graph Schema Paradigms
- **Entity Identity:** Nodes like `(:Customer)`, `(:Account)`, `(:Branch)`, and `(:Employee)` represent banking reality.
- **Semantic Mapping:** Relationships like `(:Customer)-[:HAS_ACCOUNT]->(:Account)` and `(:Product)-[:CONSTRAINED_BY]->(:Policy)` maintain explicit structural semantics.
- **n10s Ontology Import:** We use Neosemantics (`n10s`) to map our OWL ontology classes directly to graph node labels, assuring semantic alignment.

---

## 2. Decoupled Business Logic (Ontology-driven Policies)
Rather than hardcoding business logic inside Python code blocks (e.g., `if credit_score > 650`), our system decouples rules:
1. Rules are defined declaratively in YAML config policies (`loan_rules.yaml`, `fraud_rules.yaml`).
2. These policies are linked dynamically to products in the Neo4j graph.
3. The `PolicyEngine` parses these rules on demand. When parameters are hot-swapped, the engine re-evaluates the active graph state instantly.

---

## 3. Coordinated Agentic Orchestration
Rather than independent chatbots, we use a structured **Planner-Worker Orchestration** model:
- **Planner (LangGraph-based):** Receives user intents, analyzes requirements, and constructs a pipeline sequence.
- **Specialized Workers:**
  - `CustomerAgent`: Fetches profile contexts.
  - `AdvisorAgent`: Calculates product eligibilities.
  - `RiskAgent`: Scores risk limits and checks velocity flags.
  - `KnowledgeAgent`: Searches OWL ontological classifications.
  - `EngagementAgent`: Drafts outreach messaging.

Every execution step is traced, logging execution duration, resource usage, and confidence telemetry.
