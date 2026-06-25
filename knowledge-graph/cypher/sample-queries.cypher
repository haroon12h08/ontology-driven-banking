// Demonstration Cypher Queries for SBI Banking Knowledge Graph

// Query 1: Find High-Value Customers (HNWI with balance over $200k)
MATCH (c:Customer {segment: "HNWI"})-[:OWNS]->(a:Account)
WITH c, sum(a.balance) AS totalBalance
WHERE totalBalance > 200000.0
RETURN c.customerId AS customerId, c.firstName AS firstName, c.lastName AS lastName, totalBalance
ORDER BY totalBalance DESC;

// Query 2: Find Customers at Fraud Risk (Accounts with transactions flagged as fraud)
MATCH (c:Customer)-[:OWNS]->(a:Account)-[:HAS_TRANSACTION]->(t:Transaction {isFraud: true})-[:AT]->(m:Merchant)
RETURN c.customerId AS customerId, c.firstName + ' ' + c.lastName AS customerName, a.accountNumber AS accountNumber, t.transactionId AS transactionId, t.amount AS amount, m.merchantName AS merchantName, m.category AS category
ORDER BY t.amount DESC;

// Query 3: Find Customers Eligible for a Home Loan
// Criteria: Credit Score > 700, Annual Income > $100,000, and has no active LoanAccount
MATCH (c:Customer)
WHERE c.creditScore > 700 AND c.annualIncome > 100000
AND NOT (c)-[:OWNS]->(:LoanAccount)
RETURN c.customerId AS customerId, c.firstName + ' ' + c.lastName AS customerName, c.creditScore AS creditScore, c.annualIncome AS annualIncome
LIMIT 20;

// Query 4: Customer Financial Graph (Full structure for a single customer)
MATCH path = (c:Customer {customerId: "CUST-001"})-[:OWNS]->(a:Account)-[:HAS_TRANSACTION]->(t:Transaction)-[:AT]->(m:Merchant)
RETURN path
LIMIT 10;

// Query 5: Show Policy Dependencies for Banking Products
MATCH (p:Product)-[:CONSTRAINED_BY]->(pol:Policy)
RETURN p.productName AS productName, p.productType AS productType, pol.policyName AS policyName, pol.status AS policyStatus;

// Query 6: Recommend Products based on Active Recommendations and Confidence
MATCH (c:Customer)-[:RECEIVED_RECOMMENDATION]->(r:Recommendation)-[:RECOMMENDS_PRODUCT]->(p:Product)
RETURN c.firstName + ' ' + c.lastName AS customerName, r.action AS proposedAction, r.confidence AS confidence, p.productName AS suggestedProduct
ORDER BY r.confidence DESC
LIMIT 20;

// Query 7: Show Customer Journey and Recent Events
MATCH (c:Customer {customerId: "CUST-001"})<-[:AFFECTS]-(e:Event)
RETURN c.firstName + ' ' + c.lastName AS customerName, e.eventName AS eventName, e.timestamp AS eventTimestamp, e.severity AS severity
ORDER BY e.timestamp DESC;
