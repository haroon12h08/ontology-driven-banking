# Cypher query templates for Event logs and alerts

GET_RECENT_EVENTS_BY_CUSTOMER = """
MATCH (c:Customer {customerId: $customerId})<-[:AFFECTS]-(e:Event)
RETURN e {
    .eventId,
    .eventName,
    .timestamp,
    .severity
} AS event
ORDER BY e.timestamp DESC
LIMIT 50
"""

GET_LARGE_TRANSACTIONS = """
MATCH (c:Customer {customerId: $customerId})-[:OWNS]->(a:Account)-[:HAS_TRANSACTION]->(t:Transaction)
WHERE t.amount >= $threshold
OPTIONAL MATCH (t)-[:AT]->(m:Merchant)
RETURN t {
    .transactionId,
    .amount,
    .timestamp,
    .channel,
    .isFraud
} AS transaction,
a {
    .accountId,
    .accountNumber
} AS account,
m {
    .merchantId,
    .merchantName,
    .category
} AS merchant
ORDER BY t.amount DESC
LIMIT 50
"""

GET_MISSED_EMI_EVENTS = """
MATCH (c:Customer {customerId: $customerId})<-[:AFFECTS]-(e:Event)
WHERE e.eventName CONTAINS 'Missed' OR e.eventName CONTAINS 'EMI'
RETURN e {
    .eventId,
    .eventName,
    .timestamp,
    .severity
} AS event
ORDER BY e.timestamp DESC
"""
