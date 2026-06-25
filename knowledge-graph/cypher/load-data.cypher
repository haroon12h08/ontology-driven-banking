// LOAD CSV Script for SBI Banking Knowledge Graph

// 1. Load Branches
LOAD CSV WITH HEADERS FROM 'file:///branches.csv' AS row
CREATE (b:Branch {branchId: row.branchId})
SET b.branchName = row.branchName,
    b.streetAddress = row.streetAddress,
    b.city = row.city,
    b.cashReserves = toFloat(row.cashReserves);

// 2. Load Employees
LOAD CSV WITH HEADERS FROM 'file:///employees.csv' AS row
CREATE (e:Employee {employeeId: row.employeeId})
SET e.fullName = row.fullName,
    e.email = row.email,
    e.role = row.role,
    e.isRM = toBoolean(row.isRM)
WITH e, row
MATCH (b:Branch {branchId: row.branchId})
CREATE (e)-[:ASSIGNED_TO_BRANCH]->(b);

// Set label for Relationship Managers
MATCH (e:Employee)
WHERE e.isRM = true
SET e:RelationshipManager;

// 3. Load Policies
LOAD CSV WITH HEADERS FROM 'file:///policies.csv' AS row
CREATE (p:Policy {policyId: row.policyId})
SET p.policyName = row.policyName,
    p.version = row.version,
    p.effectiveDate = Date(row.effectiveDate),
    p.status = row.status;

// 4. Load Products
LOAD CSV WITH HEADERS FROM 'file:///products.csv' AS row
CREATE (p:Product {productId: row.productId})
SET p.productName = row.productName,
    p.productType = row.productType,
    p.baseRate = toFloat(row.baseRate)
WITH p, row
MATCH (pol:Policy {policyId: row.policyId})
CREATE (p)-[:CONSTRAINED_BY]->(pol);

// 5. Load Customers
LOAD CSV WITH HEADERS FROM 'file:///customers.csv' AS row
CREATE (c:Customer:IndividualCustomer {customerId: row.customerId})
SET c.firstName = row.firstName,
    c.lastName = row.lastName,
    c.dateOfBirth = Date(row.dateOfBirth),
    c.annualIncome = toFloat(row.annualIncome),
    c.occupation = row.occupation,
    c.city = row.city,
    c.segment = row.segment,
    c.creditScore = toInteger(row.creditScore)
WITH c, row
WHERE row.relationshipManagerId <> ""
MATCH (rm:RelationshipManager {employeeId: row.relationshipManagerId})
CREATE (rm)-[:MANAGES]->(c);

// 6. Load Accounts
LOAD CSV WITH HEADERS FROM 'file:///accounts.csv' AS row
CREATE (a:Account {accountId: row.accountId})
SET a.accountNumber = row.accountNumber,
    a.balance = toFloat(row.balance),
    a.availableBalance = toFloat(row.availableBalance),
    a.dateOpened = Date(row.dateOpened),
    a.status = row.status
WITH a, row
MATCH (c:Customer {customerId: row.customerId})
CREATE (c)-[:OWNS]->(a)
WITH a, row
MATCH (p:Product {productId: row.productId})
CREATE (a)-[:INSTANTIATES_PRODUCT]->(p);

// Add subclass labels based on product type
MATCH (a:Account)-[:INSTANTIATES_PRODUCT]->(p:Product)
FOREACH (ignoreMe IN CASE WHEN p.productType = 'Savings' THEN [1] ELSE [] END | SET a:DepositAccount:SavingsAccount)
FOREACH (ignoreMe IN CASE WHEN p.productType = 'Checking' THEN [1] ELSE [] END | SET a:DepositAccount:CheckingAccount)
FOREACH (ignoreMe IN CASE WHEN p.productType IN ['HomeLoan', 'AutoLoan', 'PersonalLoan'] THEN [1] ELSE [] END | SET a:LendingAccount:LoanAccount)
FOREACH (ignoreMe IN CASE WHEN p.productType = 'CreditCard' THEN [1] ELSE [] END | SET a:LendingAccount:CreditCardAccount);

// 7. Load Loans
LOAD CSV WITH HEADERS FROM 'file:///loans.csv' AS row
CREATE (l:Loan {loanId: row.loanId})
SET l.loanAmount = toFloat(row.loanAmount),
    l.interestRate = toFloat(row.interestRate),
    l.tenureMonths = toInteger(row.tenureMonths),
    l.outstandingBalance = toFloat(row.outstandingBalance)
WITH l, row
MATCH (a:LoanAccount {accountId: row.accountId})
CREATE (a)-[:REPRESENTS_LOAN]->(l);

MATCH (l:Loan)
MATCH (a:LoanAccount {accountId: l.accountId})-[:INSTANTIATES_PRODUCT]->(p:Product)
FOREACH (ignoreMe IN CASE WHEN p.productType = 'HomeLoan' THEN [1] ELSE [] END | SET l:HomeLoan)
FOREACH (ignoreMe IN CASE WHEN p.productType = 'AutoLoan' THEN [1] ELSE [] END | SET l:AutoLoan)
FOREACH (ignoreMe IN CASE WHEN p.productType = 'PersonalLoan' THEN [1] ELSE [] END | SET l:PersonalLoan);

// 8. Load Merchants
LOAD CSV WITH HEADERS FROM 'file:///merchants.csv' AS row
CREATE (m:Merchant {merchantId: row.merchantId})
SET m.merchantName = row.merchantName,
    m.category = row.category,
    m.riskRating = toInteger(row.riskRating),
    m.city = row.city;

// 9. Load Transactions
LOAD CSV WITH HEADERS FROM 'file:///transactions.csv' AS row
CREATE (t:Transaction:DebitTransaction {transactionId: row.transactionId})
SET t.amount = toFloat(row.amount),
    t.timestamp = datetime(row.timestamp),
    t.channel = row.channel,
    t.isFraud = toBoolean(row.isFraud)
WITH t, row
MATCH (a:Account {accountId: row.accountId})
CREATE (a)-[:HAS_TRANSACTION]->(t)
WITH t, row
MATCH (m:Merchant {merchantId: row.merchantId})
CREATE (t)-[:AT]->(m);

// 10. Load Goals
LOAD CSV WITH HEADERS FROM 'file:///goals.csv' AS row
CREATE (g:Goal {goalId: row.goalId})
SET g.goalType = row.goalType,
    g.targetAmount = toFloat(row.targetAmount),
    g.targetDate = Date(row.targetDate)
WITH g, row
MATCH (c:Customer {customerId: row.customerId})
CREATE (c)-[:HAS_GOAL]->(g)
WITH g, row
MATCH (a:Account {accountId: row.fundingAccountId})
CREATE (g)-[:FUNDED_BY]->(a);

// 11. Load Events
LOAD CSV WITH HEADERS FROM 'file:///events.csv' AS row
CREATE (e:Event {eventId: row.eventId})
SET e.eventName = row.eventName,
    e.timestamp = datetime(row.timestamp),
    e.severity = row.severity
WITH e, row
MATCH (c:Customer {customerId: row.customerId})
CREATE (e)-[:AFFECTS]->(c);

// 12. Load Risk Profiles
LOAD CSV WITH HEADERS FROM 'file:///risk_profiles.csv' AS row
CREATE (rp:RiskProfile {riskProfileId: row.riskProfileId})
SET rp.riskScore = toInteger(row.riskScore),
    rp.riskRating = row.riskRating
WITH rp, row
MATCH (c:Customer {customerId: row.customerId})
CREATE (c)-[:HAS_RISK_PROFILE]->(rp);

// 13. Load Service Requests
LOAD CSV WITH HEADERS FROM 'file:///service_requests.csv' AS row
CREATE (sr:ServiceRequest {requestId: row.requestId})
SET sr.category = row.category,
    sr.priority = row.priority,
    sr.status = row.status
WITH sr, row
MATCH (c:Customer {customerId: row.customerId})
CREATE (c)-[:SUBMITTED_REQUEST]->(sr)
WITH sr, row
MATCH (e:Employee {employeeId: row.assignedEmployeeId})
CREATE (sr)-[:ASSIGNED_TO]->(e);

// 14. Load Recommendations
LOAD CSV WITH HEADERS FROM 'file:///recommendations.csv' AS row
CREATE (r:Recommendation {recommendationId: row.recommendationId})
SET r.action = row.action,
    r.confidence = toFloat(row.confidence)
WITH r, row
MATCH (c:Customer {customerId: row.customerId})
CREATE (c)-[:RECEIVED_RECOMMENDATION]->(r)
WITH r, row
MATCH (p:Product {productId: row.recommendedProductId})
CREATE (r)-[:RECOMMENDS_PRODUCT]->(p);
