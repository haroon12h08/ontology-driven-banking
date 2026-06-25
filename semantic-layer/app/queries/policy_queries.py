# Cypher query templates for Policy and Rules lookup

SEARCH_POLICIES = """
MATCH (p:Policy)
WHERE p.policyName CONTAINS $searchTerm OR p.policyId CONTAINS $searchTerm
RETURN p {
    .policyId,
    .policyName,
    .version,
    .effectiveDate,
    .status
} AS policy
LIMIT 50
"""

GET_POLICY_WITH_PRODUCTS = """
MATCH (pol:Policy {policyId: $policyId})
OPTIONAL MATCH (p:Product)-[:CONSTRAINED_BY]->(pol)
RETURN pol {
    .policyId,
    .policyName,
    .version,
    .effectiveDate,
    .status
} AS policy,
collect(p {
    .productId,
    .productName,
    .productType,
    .baseRate
}) AS constrainedProducts
"""

GET_PRODUCT_POLICIES = """
MATCH (p:Product {productId: $productId})-[:CONSTRAINED_BY]->(pol:Policy)
RETURN p {
    .productId,
    .productName,
    .productType
} AS product,
pol {
    .policyId,
    .policyName,
    .version,
    .effectiveDate,
    .status
} AS policy
"""
