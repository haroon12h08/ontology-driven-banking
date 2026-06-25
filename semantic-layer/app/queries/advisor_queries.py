# Cypher query templates for Advisor operations

GET_PRODUCTS_AND_POLICIES = """
MATCH (p:Product)
OPTIONAL MATCH (p)-[:CONSTRAINED_BY]->(pol:Policy)
RETURN p {
    .productId,
    .productName,
    .productType,
    .baseRate
} AS product,
collect(pol {
    .policyId,
    .policyName,
    .version,
    .effectiveDate,
    .status
}) AS policies
"""

GET_CUSTOMER_FINANCIAL_PROFILE = """
MATCH (c:Customer {customerId: $customerId})
OPTIONAL MATCH (c)-[:OWNS]->(a:Account)
OPTIONAL MATCH (a)-[:REPRESENTS_LOAN]->(l:Loan)
RETURN c {
    .customerId,
    .firstName,
    .lastName,
    .annualIncome,
    .creditScore,
    .occupation
} AS customer,
sum(a.balance) AS totalAssets,
sum(l.outstandingBalance) AS totalDebt
"""

GET_RECOMMENDED_PRODUCTS_FOR_CUSTOMER = """
MATCH (c:Customer {customerId: $customerId})-[:RECEIVED_RECOMMENDATION]->(reco:Recommendation)-[:RECOMMENDS_PRODUCT]->(p:Product)
RETURN reco {
    .recommendationId,
    .action,
    .confidence
} AS recommendation,
p {
    .productId,
    .productName,
    .productType,
    .baseRate
} AS product
"""
