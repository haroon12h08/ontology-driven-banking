# Running the SBI Enterprise Banking AI Application

This document outlines how to run the application components (Neo4j, FastAPI Backend, and Next.js Frontend).

---

## ⚡ Option 1: Automated Script (Recommended)

An executable script `run.sh` has been created at the root of the project to boot all services and handle clean shutdown automatically:

```bash
# 1. Navigate to the project root
cd /home/haroon/Desktop/SBI

# 2. Run the script
./run.sh
```

This script will:
1. Verify if the Neo4j Docker container (`sbi_banking_graph`) is running. If not, it spins it up.
2. Activate the Python virtual environment at `semantic-layer/.venv`.
3. Generate synthetic data and seed the Neo4j database.
4. Launch the FastAPI backend on `http://localhost:8000`.
5. Launch the Next.js frontend on `http://localhost:3000`.
6. **Gracefully stop** both the frontend and backend servers when you press `Ctrl+C`.

---

## 🛠️ Option 2: Run Services Manually (Step-by-Step)

If you prefer to run the commands individually in separate terminals, follow these steps:

### 1. Spin up the Neo4j Database
Navigate to the Docker directory and start the database:
```bash
cd /home/haroon/Desktop/SBI/knowledge-graph/docker
docker compose up -d
```

### 2. Activate Virtual Environment and Seed the Database
Navigate to the root directory, activate the python environment, and run the seeding script:
```bash
cd /home/haroon/Desktop/SBI
source semantic-layer/.venv/bin/activate

# Seed database schemas, ontology, and synthetic datasets
python3 demo/scripts/seed_demo.py
```

### 3. Start the FastAPI Backend
In a new terminal window (or with the virtual environment activated):
```bash
cd /home/haroon/Desktop/SBI/semantic-layer
source .venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- Interactive Swagger API docs will be available at: **`http://localhost:8000/docs`**

### 4. Start the Next.js Frontend
In another terminal window:
```bash
cd /home/haroon/Desktop/SBI/frontend
npm run dev
```
- The interactive Judge Dashboard / UI will be available at: **`http://localhost:3000`**

### 5. Run Scenario CLI Simulator (Optional)
To test and simulate customer journey scenarios in the terminal:
```bash
cd /home/haroon/Desktop/SBI/intelligence-engine
source ../semantic-layer/.venv/bin/activate
python3 run_scenarios.py
```
