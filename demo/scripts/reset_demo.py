#!/usr/bin/env python3
import os
import sys
from neo4j import GraphDatabase

# Config
URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
PASSWORD = os.getenv("NEO4J_PASSWORD", "sbi_banking_password")

def reset_database():
    print(f"Connecting to Neo4j at {URI} to wipe database...")
    try:
        driver = GraphDatabase.driver(URI, auth=(USERNAME, PASSWORD))
        driver.verify_connectivity()
        with driver.session() as session:
            # Delete all nodes, relationships, and n10s configuration
            print("Wiping all nodes and relationships...")
            session.run("MATCH (n) DETACH DELETE n").consume()
            
            # Wipe Neosemantics configuration if present
            try:
                session.run("CALL n10s.graphconfig.show()").consume()
                print("Wiping n10s graph config...")
                session.run("CALL n10s.graphconfig.drop()").consume()
            except Exception:
                # n10s config might not be initialized yet
                pass
            
            print("Database has been reset to a clean state.")
        driver.close()
    except Exception as e:
        print(f"Error resetting database: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    reset_database()
