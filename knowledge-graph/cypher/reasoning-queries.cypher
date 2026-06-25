// Agent-Specific Reasoning Queries for SBI Banking Knowledge Graph

// ==========================================
// 1. Customer Intelligence Agent
// Goal: Extract household aggregates and find co-dependent members
// ==========================================
// Matches customers residing in the same city, sharing the same last name, 
// and aggregates their overall assets (AUM) to identify household clusters.
MATCH (c1:Customer:IndividualCustomer)-[:OWNS]->(a1:Account)
MATCH (c2:Customer:IndividualCustomer)-[:OWNS]->(a2:Account)
WHERE c1.lastName = c2.lastName AND c1.city = c2.city AND c1.customerId < c2.customerId
WITH c1, c2, sum(DISTINCT a1.balance) + sum(DISTINCT a2.balance) AS householdAUM
RETURN c1.firstName + " " + c1.lastName AS member1, 
       c2.firstName + " " + c2.lastName AS member2, 
       c1.city AS householdLocation, 
       householdAUM
ORDER BY householdAUM DESC
LIMIT 10;

// ==========================================
// 2. Financial Advisor Agent
// Goal: Recommend rebalancing based on high cash holding
// ==========================================
// Identifies customers who hold checking account balances exceeding 50% of their 
// total AUM, signaling that their capital is under-invested.
MATCH (c:Customer)-[:OWNS]->(a:CheckingAccount)
MATCH (c)-[:OWNS]->(allAcc:Account)
WITH c, a.balance AS cashBalance, sum(allAcc.balance) AS totalAUM
WHERE totalAUM > 0
WITH c, cashBalance, totalAUM, (cashBalance / totalAUM) AS cashRatio
WHERE cashRatio > 0.50
RETURN c.customerId AS customerId, c.firstName + ' ' + c.lastName AS customerName, 
       cashBalance, totalAUM, round(cashRatio * 100, 2) AS cashPercentageOfAUM
ORDER BY cashPercentageOfAUM DESC
LIMIT 15;

// ==========================================
// 3. Risk Agent
// Goal: Calculate client debt-to-income ratio dynamics
// ==========================================
// Matches lending loan accounts and calculates outstanding principal liabilities 
// relative to stated annual incomes.
MATCH (c:Customer)-[:OWNS]->(la:LoanAccount)-[:REPRESENTS_LOAN]->(l:Loan)
WITH c, sum(l.outstandingBalance) AS totalDebt, c.annualIncome AS income
WHERE income > 0
RETURN c.customerId AS customerId, c.firstName + ' ' + c.lastName AS customerName, 
       totalDebt, income, round((totalDebt / income) * 100, 2) AS debtToIncomeRatio
ORDER BY debtToIncomeRatio DESC
LIMIT 15;

// ==========================================
// 4. Fraud Agent
// Goal: Real-time velocity checking on customer transaction frequencies
// ==========================================
// Identifies accounts executing more than 5 transactions in a single day,
// flagging them for high velocity.
MATCH (a:Account)-[:HAS_TRANSACTION]->(t:Transaction)
WITH a, t.timestamp.year AS year, t.timestamp.month AS month, t.timestamp.day AS day, count(t) AS dailyTxnCount, sum(t.amount) AS dailyTxnVolume
WHERE dailyTxnCount > 5
MATCH (c:Customer)-[:OWNS]->(a)
RETURN c.firstName + ' ' + c.lastName AS customerName, a.accountNumber AS accountNumber, 
       date({year: year, month: month, day: day}) AS txnDate, dailyTxnCount, dailyTxnVolume
ORDER BY dailyTxnVolume DESC
LIMIT 10;

// ==========================================
// 5. Banking Operations Agent
// Goal: Find branches whose cash reserves are low and have pending high-priority disputes
// ==========================================
MATCH (b:Branch)<-[:ASSIGNED_TO_BRANCH]-(e:Employee)<-[:ASSIGNED_TO]-(sr:ServiceRequest {priority: "Critical", status: "Pending"})
RETURN b.branchId AS branchId, b.branchName AS branchName, b.cashReserves AS cashReserves, count(sr) AS pendingCriticalRequests
ORDER BY pendingCriticalRequests DESC;

// ==========================================
// 6. Engagement Agent
// Goal: Identify customers with high engagement and no active savings product
// ==========================================
// Matches customers who have logged high-priority events, submitted requests, 
// but don't hold a high-yield Savings Account.
MATCH (c:Customer)
WHERE NOT (c)-[:OWNS]->(:SavingsAccount)
OPTIONAL MATCH (c)<-[:AFFECTS]-(e:Event)
OPTIONAL MATCH (c)-[:SUBMITTED_REQUEST]->(sr:ServiceRequest)
WITH c, count(DISTINCT e) AS eventCount, count(DISTINCT sr) AS requestCount
WHERE eventCount + requestCount > 2
RETURN c.customerId AS customerId, c.firstName + ' ' + c.lastName AS customerName, 
       eventCount, requestCount, "Recommend high-yield savings product to increase engagement" AS campaignMessage
LIMIT 10;
