import os
import shutil
from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable

# Configurations
uri = "bolt://localhost:7687"
username = "neo4j"
password = "sbi_banking_password"

base_dir = "/home/haroon/Desktop/SBI/knowledge-graph"
datasets_dir = os.path.join(base_dir, "datasets")
import_dir = os.path.join(base_dir, "neo4j", "import")
ontology_src_dir = "/home/haroon/Desktop/SBI/banking-ontology/ontology"
ontology_dest_dir = os.path.join(base_dir, "ontology")
cypher_dir = os.path.join(base_dir, "cypher")

os.makedirs(import_dir, exist_ok=True)
os.makedirs(ontology_dest_dir, exist_ok=True)

print("Preparing import directory and copying datasets...")

# 1. Copy CSV files to import directory
if os.path.exists(datasets_dir):
    for filename in os.listdir(datasets_dir):
        if filename.endswith(".csv"):
            shutil.copy(os.path.join(datasets_dir, filename), os.path.join(import_dir, filename))
            print(f"Copied {filename} to Neo4j import directory.")
else:
    print(f"Error: Datasets directory {datasets_dir} not found. Run generate_synthetic_data.py first.")
    exit(1)

# 2. Copy ontology files to destination and import directories
ttl_src = os.path.join(ontology_src_dir, "banking.ttl")
owl_src = os.path.join(ontology_src_dir, "banking.owl")

if os.path.exists(ttl_src) and os.path.exists(owl_src):
    shutil.copy(ttl_src, os.path.join(ontology_dest_dir, "banking.ttl"))
    shutil.copy(owl_src, os.path.join(ontology_dest_dir, "banking.owl"))
    # APOC/n10s reads from import root
    shutil.copy(ttl_src, os.path.join(import_dir, "banking.ttl"))
    shutil.copy(owl_src, os.path.join(import_dir, "banking.owl"))
    print("Copied ontology files to destination and import directory.")
else:
    print(f"Warning: Ontology files not found in {ontology_src_dir}. Please ensure they are generated.")

# 3. Connect to Neo4j and execute Cypher scripts
def run_cypher_file(session, file_path):
    print(f"Executing Cypher file: {file_path}")
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()
    
    # Preprocess line-by-line to strip out whole-line comments and blank lines
    cleaned_lines = []
    for line in lines:
        trimmed = line.strip()
        if trimmed.startswith("//") or not trimmed:
            continue
        cleaned_lines.append(line)
        
    cleaned_content = "".join(cleaned_lines)
    
    # Split by semicolon to extract individual Cypher statements
    queries = [q.strip() for q in cleaned_content.split(";") if q.strip()]
    
    for query in queries:
        try:
            # Run the query and consume the result to force database roundtrip and error surfacing
            result = session.run(query)
            result.consume()
        except Exception as e:
            print(f"Failed query:\n{query}\nError: {e}")
            raise e

try:
    print(f"Attempting to connect to Neo4j at {uri}...")
    driver = GraphDatabase.driver(uri, auth=(username, password))
    # Test connection
    driver.verify_connectivity()
    
    with driver.session() as session:
        print("Connected to Neo4j successfully.")
        
        # Clear existing data
        print("Wiping existing nodes and relationships from Neo4j...")
        session.run("MATCH (n) DETACH DELETE n").consume()
        
        # Wipe Neosemantics configuration if present
        try:
            session.run("CALL n10s.graphconfig.show()").consume()
            print("Wiping existing Neosemantics graph config...")
            session.run("CALL n10s.graphconfig.drop()").consume()
        except Exception:
            pass
        
        # Run constraints
        run_cypher_file(session, os.path.join(cypher_dir, "constraints.cypher"))
        print("Constraints configured successfully.")
        
        # Run indexes
        run_cypher_file(session, os.path.join(cypher_dir, "indexes.cypher"))
        print("Indexes configured successfully.")
        
        # Run schema (Neosemantics ontology import)
        run_cypher_file(session, os.path.join(cypher_dir, "schema.cypher"))
        print("Neosemantics ontology schema imported successfully.")
        
        # Run data loading
        run_cypher_file(session, os.path.join(cypher_dir, "load-data.cypher"))
        print("CSV dataset loaded successfully into graph model.")
        
    driver.close()
    print("Graph loading process completed successfully!")

except ServiceUnavailable:
    print("\n" + "="*80)
    print("ERROR: Neo4j is not currently running or reachable.")
    print("To start the Neo4j instance, please run:")
    print("  cd /home/haroon/Desktop/SBI/knowledge-graph/docker && docker-compose up -d")
    print("After the container starts, re-run this loading script.")
    print("="*80 + "\n")
