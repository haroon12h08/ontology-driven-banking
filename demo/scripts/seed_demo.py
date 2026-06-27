#!/usr/bin/env python3
import os
import sys
import subprocess

base_dir = "/home/haroon/Desktop/SBI"
kg_scripts_dir = os.path.join(base_dir, "knowledge-graph", "scripts")

def seed_database():
    print("Step 1: Checking synthetic datasets...")
    datasets_path = os.path.join(base_dir, "knowledge-graph", "datasets")
    if not os.path.exists(datasets_path) or not os.listdir(datasets_path):
        print("Generating synthetic datasets...")
        script_path = os.path.join(kg_scripts_dir, "generate_synthetic_data.py")
        res = subprocess.run([sys.executable, script_path], cwd=os.path.join(base_dir, "knowledge-graph"))
        if res.returncode != 0:
            print("Failed to generate synthetic data.", file=sys.stderr)
            sys.exit(1)
    else:
        print("Synthetic datasets already present.")

    print("\nStep 2: Loading dataset schemas, ontology, and instances into Neo4j...")
    load_script_path = os.path.join(kg_scripts_dir, "load_graph.py")
    res = subprocess.run([sys.executable, load_script_path], cwd=os.path.join(base_dir, "knowledge-graph"))
    if res.returncode != 0:
        print("Failed to load graph into Neo4j.", file=sys.stderr)
        sys.exit(1)
        
    print("\nSeeding operations successfully completed. System ready.")

if __name__ == "__main__":
    seed_database()
