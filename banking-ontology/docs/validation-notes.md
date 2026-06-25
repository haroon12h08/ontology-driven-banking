# Validation Notes & Reasoning Tests - SBI Enterprise Banking Ontology

This guide explains how to validate the ontology's consistency and run reasoning engines to infer new facts and relationships.

## 1. Static Validation in Protégé

1.  **Syntax Verification**: The ontology has been pre-validated to ensure it meets OWL 2 DL serialization profiles. Both the RDF/XML (`banking.owl`) and Turtle (`banking.ttl`) versions parse with zero syntax errors.
2.  **Reasoner Consistency Check**:
    *   Load `ontology/banking.owl` into Protégé.
    *   Select the **Reasoner** menu, then select **HermiT** or **Pellet**.
    *   Click **Reasoner -> Start Reasoner**.
    *   *Expected Result*: The reasoning task should complete in under 5 seconds. All classes should remain colored in white/grey. If any class transitions to red, it indicates unsatisfiability (logical contradiction), which this model does not exhibit.

## 2. Dynamic Semantic Validation (Sample Queries)

Using a SPARQL query engine, verify that domain and range restrictions enforce data cleanliness.

### Test 1: Active KYC Enforcement
An account is flagged if it belongs to a customer who lacks a verified KYC record.
```sparql
PREFIX sbi: <http://sbi.co.in/ontology/banking#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?accountId ?customerName ?kycStatus
WHERE {
  ?customer rdf:type sbi:IndividualCustomer ;
            sbi:firstName ?firstName ;
            sbi:lastName ?lastName ;
            sbi:ownsAccount ?account .
  ?account sbi:accountId ?accountId .
  OPTIONAL {
    ?customer sbi:hasKYCRecord ?kyc .
    ?kyc sbi:hasVerificationStatus ?status .
    ?status rdfs:label ?kycStatus .
  }
  FILTER(!bound(?kycStatus) || ?kycStatus != "Verified Status")
  BIND(CONCAT(?firstName, " ", ?lastName) AS ?customerName)
}
```

### Test 2: Asset Class Alignment
Ensure all assets held within an investment portfolio map to a valid asset class taxonomy.
```sparql
PREFIX sbi: <http://sbi.co.in/ontology/banking#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?portfolioId ?assetTicker ?assetClassLabel
WHERE {
  ?portfolio rdf:type sbi:InvestmentPortfolio ;
             sbi:portfolioId ?portfolioId ;
             sbi:holdsAssetHolding ?asset .
  ?asset sbi:assetTicker ?assetTicker ;
         sbi:classifiedUnderAssetClass ?class .
  ?class rdfs:label ?assetClassLabel .
}
```

## 3. Neo4j Integration Validation
To test n10s (Neosemantics) parsing in Neo4j:
1.  Configure the database config:
    ```cypher
    CREATE CONSTRAINT n10s_unique_uri FOR (r:Resource) REQUIRE r.uri IS UNIQUE;
    CALL n10s.graphconfig.init({handleVocabUris: "SHORTEN"});
    ```
2.  Import the ontology:
    ```cypher
    CALL n10s.onto.import.fetch("file:///path/to/banking.ttl", "Turtle");
    ```
3.  Query the class hierarchy:
    ```cypher
    MATCH (c:Class)-[:rdfs__subClassOf]->(p:Class)
    RETURN c.uri AS Class, p.uri AS ParentClass;
    ```
