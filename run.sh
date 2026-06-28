#!/bin/bash

# SBI Enterprise Banking AI Application Launcher
# Exit on error during preparation
set -e

BASE_DIR="/home/haroon/Desktop/SBI"
VENV_DIR="$BASE_DIR/semantic-layer/.venv"
FRONTEND_DIR="$BASE_DIR/frontend"
DOCKER_DIR="$BASE_DIR/knowledge-graph/docker"
SEEDS_DIR="$BASE_DIR/demo/scripts"

echo "=========================================================="
echo "          SBI Enterprise Banking AI Application           "
echo "=========================================================="

# 1. Start Neo4j via Docker
echo -e "\n[1/4] Checking Neo4j Database..."
if ! docker ps | grep -q "sbi_banking_graph"; then
    echo "Neo4j container is not running. Starting it..."
    cd "$DOCKER_DIR"
    docker compose up -d
    echo "Waiting for Neo4j to start up..."
    until docker exec sbi_banking_graph cypher-shell -u neo4j -p admin "RETURN 1" >/dev/null 2>&1; do
        sleep 2
        echo -n "."
    done
    echo -e "\nNeo4j is ready!"
else
    echo "Neo4j database is already running."
fi

# 2. Activate Virtual Environment & Seed Database
echo -e "\n[2/4] Activating Python Virtual Environment & Seeding Graph..."
if [ ! -d "$VENV_DIR" ]; then
    echo "Error: Virtual environment not found at $VENV_DIR"
    exit 1
fi

source "$VENV_DIR"/bin/activate

# Seed database
cd "$BASE_DIR"
python3 "$SEEDS_DIR"/seed_demo.py

# 3. Start Backend FastAPI Server
echo -e "\n[3/4] Starting FastAPI backend server..."
cd "$BASE_DIR/semantic-layer"
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > "$BASE_DIR"/backend.log 2>&1 &
BACKEND_PID=$!

# 4. Start Next.js Frontend Server
echo -e "\n[4/4] Starting Next.js frontend server..."
cd "$FRONTEND_DIR"
npm run dev > "$BASE_DIR"/frontend.log 2>&1 &
FRONTEND_PID=$!

echo "=========================================================="
echo "Application started successfully!"
echo "- Frontend URL: http://localhost:3000"
echo "- Backend API Docs: http://localhost:8000/docs"
echo "- Logs are saved to: backend.log and frontend.log"
echo "=========================================================="
echo "Press [Ctrl+C] to stop the application."

# Function to clean up background processes on exit
cleanup() {
    echo -e "\nShutting down application servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo "Servers stopped. Goodbye!"
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup EXIT

# Keep script running to keep servers alive
wait
