import os
from neo4j import GraphDatabase
from neo4j.exceptions import ServiceUnavailable

uri = "bolt://localhost:7687"
username = "neo4j"
password = "sbi_banking_password"

def run_validation_query(session, description, query):
    print(f"\n--- Running: {description} ---")
    result = session.run(query)
    records = list(result)
    if not records:
        print("No results returned.")
        return
    # Print headers
    keys = records[0].keys()
    print(" | ".join(keys))
    print("-" * (len(" | ".join(keys)) + 4))
    for record in records:
        print(" | ".join(str(record[k]) for k in keys))

try:
    print(f"Connecting to Neo4j at {uri} for validation...")
    driver = GraphDatabase.driver(uri, auth=(username, password))
    driver.verify_connectivity()
    
    with driver.session() as session:
        print("Connected. Starting database integrity and statistics validation...")
        
        # 1. Node Counts by Label
        run_validation_query(
            session,
            "Node Counts by Label",
            "MATCH (n) UNWIND labels(n) AS label RETURN label, count(n) AS nodeCount ORDER BY nodeCount DESC"
        )
        
        # 2. Relationship Counts by Type
        run_validation_query(
            session,
            "Relationship Counts by Type",
            "MATCH ()-[r]->() RETURN type(r) AS relationshipType, count(r) AS relationshipCount ORDER BY relationshipCount DESC"
        )
        
        # 3. Orphan Customer Check (Customers without accounts)
        run_validation_query(
            session,
            "Orphan Customer Check (Customers with 0 accounts)",
            "MATCH (c:Customer) WHERE NOT (c)-[:OWNS]->(:Account) RETURN count(c) AS orphanCustomersCount"
        )
        
        # 4. Orphan Account Check (Accounts without owners)
        run_validation_query(
            session,
            "Orphan Account Check (Accounts with 0 owners)",
            "MATCH (a:Account) WHERE NOT (:Customer)-[:OWNS]->(a) RETURN count(a) AS orphanAccountsCount"
        )
        
        # 5. Orphan Transaction Check (Transactions without accounts)
        run_validation_query(
            session,
            "Orphan Transaction Check (Transactions with 0 accounts)",
            "MATCH (t:Transaction) WHERE NOT (:Account)-[:HAS_TRANSACTION]->(t) RETURN count(t) AS orphanTransactionsCount"
        )
        
        # 6. Policies without Products Check
        run_validation_query(
            session,
            "Policies not connected to any Products",
            "MATCH (p:Policy) WHERE NOT (:Product)-[:CONSTRAINED_BY]->(p) RETURN count(p) AS unconnectedPoliciesCount"
        )
        
        # 7. Unassigned Service Request Check
        run_validation_query(
            session,
            "Pending Service Requests without Assignees",
            "MATCH (sr:ServiceRequest) WHERE NOT (sr)-[:ASSIGNED_TO]->(:Employee) RETURN count(sr) AS unassignedRequestsCount"
        )
        
    driver.close()
    print("\nValidation completed successfully!")

except ServiceUnavailable:
    print("\n" + "="*80)
    print("ERROR: Neo4j is not currently running or reachable.")
    print("Cannot validate graph. Start Neo4j using docker-compose and run the loader first.")
    print("="*80 + "\n")
