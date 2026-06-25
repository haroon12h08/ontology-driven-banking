// Neosemantics Configuration and Ontology Import Schema

// Initialize the Neosemantics Graph Configuration
// We use "SHORTEN" to map namespaces to prefixes (e.g. sbi:Customer instead of full URIs)
CALL n10s.graphconfig.init({
  handleVocabUris: "SHORTEN",
  handleMultival: "OVERWRITE",
  keepLangTag: false
});

// Import the OWL ontology from the local imports directory using absolute container path
CALL n10s.onto.import.fetch("file:///var/lib/neo4j/import/banking.ttl", "Turtle");

// Verify class hierarchy is loaded
MATCH (c:Class)
RETURN c.uri AS classUri, c.comment AS classDescription
LIMIT 20;
