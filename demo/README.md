# SBI Enterprise Semantic Banking AI Demo
Welcome to the interactive demonstration suite and presentation layer.

## Project Structure
- `scripts/`: Seeding, resetting, and startup launchers.
- `walkthrough/`: Guided narration and system architecture story.
- `monitoring/`: Real-time observability tracking (latency, tracing, metrics).
- `deployment/`: Configuration matrices for Docker/Kubernetes environments.

---

## ⚡ Quick Start: Run Everything in One Command

To start the database, backend services, and Next.js frontend, execute:
```bash
python3 scripts/run_demo.py
```
This script will:
1. Spin up the Neo4j database containers (if not already running).
2. Run data generator scripts and seed standard banking properties.
3. Start the FastAPI backend server on `http://localhost:8000`.
4. Start the Next.js dev server on `http://localhost:3000`.

---

## 🔬 Presentation Walkthrough

### Option 1: Interactive Judge Dashboard (Recommended)
1. Open your browser and navigate to `http://localhost:3000`.
2. Click the **Judge Dashboard** tab on the sidebar.
3. Use the one-click scenario runners to execute Home Loan Journey, Fraud Prevention, or Salary Credits.
4. Toggle parameters under the **Policy parameter Hot-Swap** widget to show immediate, code-free decision changes.

### Option 2: CLI Walkthrough
If presenting in a terminal environment, execute:
```bash
python3 walkthrough/guided_demo.py
```
This interactive prompt guides you through each scenario step-by-step with log traces and output metrics.
