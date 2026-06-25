# Cypher query templates for Recommendations operations

GET_CUSTOMER_RECOMMENDATIONS = """
MATCH (c:Customer {customerId: $customerId})-[:RECEIVED_RECOMMENDATION]->(reco:Recommendation)
MATCH (reco)-[:RECOMMENDS_PRODUCT]->(p:Product)
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

GET_RECOMMENDATION_DETAILS = """
MATCH (reco:Recommendation {recommendationId: $recommendationId})
MATCH (c:Customer)-[:RECEIVED_RECOMMENDATION]->(reco)
MATCH (reco)-[:RECOMMENDS_PRODUCT]->(p:Product)
RETURN reco {
    .recommendationId,
    .action,
    .confidence
} AS recommendation,
c {
    .customerId,
    .firstName,
    .lastName,
    .segment
} AS customer,
p {
    .productId,
    .productName,
    .productType,
    .baseRate
} AS product
"""
