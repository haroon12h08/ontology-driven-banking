# Cypher query templates for Risk analysis operations

GET_FRAUD_INDICATORS = """
MATCH (c:Customer {customerId: $customerId})-[:OWNS]->(a:Account)-[:HAS_TRANSACTION]->(t:Transaction)
WHERE t.isFraud = true
OPTIONAL MATCH (t)-[:AT]->(m:Merchant)
RETURN t {
    .transactionId,
    .amount,
    .timestamp,
    .channel,
    .isFraud
} AS transaction,
m {
    .merchantId,
    .merchantName,
    .category,
    .riskRating
} AS merchant
"""

GET_HIGH_RISK_MERCHANT_TRANSACTIONS = """
MATCH (c:Customer {customerId: $customerId})-[:OWNS]->(a:Account)-[:HAS_TRANSACTION]->(t:Transaction)-[:AT]->(m:Merchant)
WHERE m.riskRating >= 4
RETURN t {
    .transactionId,
    .amount,
    .timestamp,
    .channel
} AS transaction,
m {
    .merchantId,
    .merchantName,
    .category,
    .riskRating
} AS merchant
ORDER BY t.timestamp DESC
LIMIT 50
"""

GET_TRANSACTION_SUMMARY_FOR_RISK = """
MATCH (c:Customer {customerId: $customerId})-[:OWNS]->(a:Account)-[:HAS_TRANSACTION]->(t:Transaction)
WITH count(t) AS totalTxCount, 
     avg(t.amount) AS avgTxAmount,
     max(t.amount) AS maxTxAmount,
     sum(case when t.isFraud = true then 1 else 0 end) AS fraudCount
RETURN totalTxCount, avgTxAmount, maxTxAmount, fraudCount
"""

GET_RISK_EVENTS = """
MATCH (c:Customer {customerId: $customerId})
OPTIONAL MATCH (e:Event)-[:AFFECTS]->(c)
WHERE e.severity IN ['High', 'Critical'] OR e.eventName CONTAINS 'Missed' OR e.eventName CONTAINS 'Overdraft' OR e.eventName CONTAINS 'Failed'
RETURN e {
    .eventId,
    .eventName,
    .timestamp,
    .severity
} AS riskEvent
ORDER BY e.timestamp DESC
"""
