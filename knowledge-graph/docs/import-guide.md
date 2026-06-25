# Import Guide - SBI Banking Knowledge Graph

This guide outlines step-by-step instructions to boot the Neo4j instance, generate synthetic datasets, load constraints, and run the ingestion pipeline.

## 1. Prerequisites
Ensure you have the following installed:
*   Docker & Docker Compose
*   Python 3.10+
*   Neo4j Python Driver (`pip install neo4j`)

## 2. Step 1: Start Neo4j via Docker Compose
Navigate to the docker directory and spin up the database container:
```bash
cd /home/haroon/Desktop/SBI/knowledge-graph/docker
docker-compose up -d
```
Verify the container is active:
```bash
docker ps
```
The container loads the standard community edition of Neo4j 5.18, enabling the Bolt protocol on port `7687` and HTTP on port `7474`. APOC and Neosemantics (n10s) are automatically installed and enabled.

## 3. Step 2: Generate Datasets
Run the synthetic generator to construct the transaction ledger entries, customer details, and branch records:
```bash
cd /home/haroon/Desktop/SBI/knowledge-graph/scripts
python3 generate_synthetic_data.py
```
This generates 14 CSV files inside the `datasets/` folder containing internally consistent mock banking data.

## 4. Step 3: Run Ingestion Pipeline
Execute the master loader script to configure schemas, run Neosemantics, and load CSV tables:
```bash
python3 load_graph.py
```
The script performs the following actions:
1.  Copies generated CSV files into the Neo4j container's `import/` directory.
2.  Copies ontology files (`banking.ttl`) into the container.
3.  Establishes a connection to Neo4j.
4.  Applies database constraints (`constraints.cypher`) and range indexes (`indexes.cypher`).
5.  Configures Neosemantics and imports the OWL taxonomy structure (`schema.cypher`).
6.  Executes data import queries (`load-data.cypher`).

## 5. Step 4: Validate the Graph
Verify referential integrity and examine total node and relationship counts:
```bash
python3 validate_graph.py
```
This prints the status check logs of the knowledge graph.
