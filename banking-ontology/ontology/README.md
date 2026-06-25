# SBI Enterprise Banking Ontology

This directory contains the production-quality OWL 2 DL ontology representing the conceptual domain model of SBI's AI-first banking platform.

## Files
*   `banking.owl`: The RDF/XML serialization of the ontology. This file is directly loadable into Protégé, Apache Jena, RDFLib, or Apache Marmotta.
*   `banking.ttl`: The Turtle serialization of the ontology, optimized for human readability and version control diffing.
*   `prefixes.ttl`: Standard Turtle namespace prefixes used across SBI semantic datasets.

## Importing into Protégé
1. Open Protégé.
2. Select **File -> Open...** and choose `banking.owl` or `banking.ttl`.
3. The classes, object properties, data properties, and restriction axioms will load into their respective tabs.
4. Go to **Reasoner -> Start Reasoner** (e.g., HermiT or Pellet) to run consistency and class validation checks.

## Importing into Neo4j using Neosemantics (n10s)
Configure your Neo4j instance for n10s:
```cypher
CREATE CONSTRAINT n10s_unique_uri FOR (r:Resource) REQUIRE r.uri IS UNIQUE;
CALL n10s.graphconfig.init({handleVocabUris: "SHORTEN"});
```
Import the Turtle schema:
```cypher
CALL n10s.onto.import.fetch("file:///path/to/banking.ttl", "Turtle");
```
