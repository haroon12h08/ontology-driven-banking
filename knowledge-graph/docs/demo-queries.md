# Demo Cypher Queries - SBI Knowledge Graph

Below are queries demonstrating the graph’s utility for cognitive banking agents.

## 1. Customer Intelligence Agent
Retrieve the spending footprint of a customer over time to build financial segments.
```cypher
MATCH (c:Customer {customerId: 'CUST001'})-[:OWNS_ACCOUNT]->(a:Account)-[:ORIGINATES_TRANSACTION]->(t:Transaction)-[:OCCURS_AT_MERCHANT]->(m:Merchant)
RETURN t.timestamp AS time, t.amount AS amount, m.merchantName AS merchant
ORDER BY time DESC
LIMIT 5;
```

## 2. Risk Agent
Inspect a customer's credit score, risk profile, and KYC documents to ensure AML compliance.
```cypher
MATCH (c:Customer {customerId: 'CUST001'})
MATCH (c)-[:HAS_RISK_PROFILE]->(rp:RiskProfile)
MATCH (c)-[:HAS_KYC_RECORD]->(kyc:KYCRecord)
RETURN c.customerId AS id, c.creditScore AS score, rp.overallRiskClass AS risk, kyc.verificationDate AS kycDate;
```

## 3. Financial Advisor Agent
Find customers whose checking balance is high (> 200,000 INR) but who have no investment portfolio, signaling wealth advisory opportunities.
```cypher
MATCH (c:Customer)-[:OWNS_ACCOUNT]->(a:SavingsAccount)
WHERE a.balance > 200000
MATCH (p:BankingProduct {productType: 'Investment'})
RETURN c.customerId AS id, c.firstName + ' ' + c.lastName AS name, a.balance AS balance, p.productName AS recommendation;
```
