# SBI Enterprise Banking Knowledge Graph

This project implements a production-grade Neo4j knowledge graph mapping SBI's semantic banking ontology to a shared semantic memory layer for cognitive AI agents.

## Project Structure
*   `docker/`: Deployment orchestration scripts.
*   `neo4j/`: Config, import, and plugin directories.
*   `ontology/`: Stored OWL 2 DL ontology files (OWL & Turtle).
*   `datasets/`: Consistently generated CSV data files at production scale.
*   `cypher/`: DDL schemas, constraints, indexes, and load-scripts.
*   `scripts/`: Load and validation utilities.
*   `docs/`: Extensive architectural documentation.

## Running the Setup
Follow the guides in [docs/import-guide.md](docs/import-guide.md) to start the docker container and run the loading pipelines.
