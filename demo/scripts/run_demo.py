#!/usr/bin/env python3
import os
import sys
import socket
import time
import subprocess

base_dir = "/home/haroon/Desktop/SBI"

def check_port(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def run_demo():
    print("=== SBI Enterprise Semantic Banking AI Demo Launcher ===")
    
    # 1. Check if Neo4j is online
    if not check_port(7687):
        print("Neo4j database appears offline. Starting docker-compose services...")
        docker_compose_dir = os.path.join(base_dir, "knowledge-graph", "docker")
        if os.path.exists(os.path.join(docker_compose_dir, "docker-compose.yml")):
            subprocess.Popen(["docker", "compose", "up", "-d"], cwd=docker_compose_dir)
            print("Waiting for Neo4j to launch...")
            for _ in range(30):
                if check_port(7687):
                    print("Neo4j is online!")
                    break
                time.sleep(1)
        else:
            print("Error: docker-compose.yml not found. Please start Neo4j manually on port 7687.", file=sys.stderr)
            sys.exit(1)
    else:
        print("Neo4j database is online on port 7687.")

    # 2. Seed database
    print("\nRunning database seeding check...")
    subprocess.run([sys.executable, os.path.join(base_dir, "demo", "scripts", "seed_demo.py")])

    # 3. Start Backend FastAPI
    if not check_port(8000):
        print("\nStarting FastAPI backend server on port 8000...")
        backend_dir = os.path.join(base_dir, "semantic-layer")
        # Run in background
        subprocess.Popen([sys.executable, "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"], cwd=backend_dir)
        # Wait a moment
        time.sleep(2)
    else:
        print("FastAPI backend is already running on port 8000.")

    # 4. Start Next.js Frontend
    if not check_port(3000):
        print("\nStarting Next.js frontend server on port 3000...")
        frontend_dir = os.path.join(base_dir, "frontend")
        subprocess.Popen(["npm", "run", "dev"], cwd=frontend_dir)
        time.sleep(2)
    else:
        print("Next.js frontend is already running on port 3000.")

    print("\n=======================================================")
    print("Demo launched successfully!")
    print("Access Frontend: http://localhost:3000")
    print("Access Backend API: http://localhost:8000/docs")
    print("=======================================================")

if __name__ == "__main__":
    run_demo()
