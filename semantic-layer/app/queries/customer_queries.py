# Cypher query templates for Customer operations

GET_CUSTOMER_PROFILE = """
MATCH (c:Customer {customerId: $customerId})
OPTIONAL MATCH (c)-[:HAS_RISK_PROFILE]->(rp:RiskProfile)
OPTIONAL MATCH (rm:RelationshipManager)-[:MANAGES]->(c)
RETURN c {
    .customerId,
    .firstName,
    .lastName,
    .dateOfBirth,
    .annualIncome,
    .occupation,
    .city,
    .segment,
    .creditScore
} AS customer,
rp {
    .riskProfileId,
    .riskScore,
    .riskRating
} AS riskProfile,
rm {
    .employeeId,
    .fullName,
    .email,
    .role
} AS relationshipManager
"""

GET_CUSTOMER_ACCOUNTS = """
MATCH (c:Customer {customerId: $customerId})-[:OWNS]->(a:Account)
OPTIONAL MATCH (a)-[:INSTANTIATES_PRODUCT]->(p:Product)
OPTIONAL MATCH (a)-[:REPRESENTS_LOAN]->(l:Loan)
RETURN a {
    .accountId,
    .accountNumber,
    .balance,
    .availableBalance,
    .dateOpened,
    .status,
    labels: labels(a)
} AS account,
p {
    .productId,
    .productName,
    .productType,
    .baseRate
} AS product,
l {
    .loanId,
    .loanAmount,
    .interestRate,
    .tenureMonths,
    .outstandingBalance
} AS loan
"""

GET_FINANCIAL_HEALTH = """
MATCH (c:Customer {customerId: $customerId})-[:OWNS]->(a:Account)
OPTIONAL MATCH (a)-[:HAS_TRANSACTION]->(t:Transaction)
WITH c, a, t
WITH c,
     sum(distinct a.balance) AS totalBalance,
     sum(distinct case when 'SavingsAccount' in labels(a) then a.balance else 0.0 end) AS savingsBalance,
     sum(distinct case when 'CheckingAccount' in labels(a) then a.balance else 0.0 end) AS checkingBalance,
     sum(distinct case when 'LoanAccount' in labels(a) or 'CreditCardAccount' in labels(a) then a.balance else 0.0 end) AS debtBalance,
     sum(t.amount) AS txVolume,
     count(t) AS txCount
RETURN totalBalance, savingsBalance, checkingBalance, debtBalance, txVolume, txCount, c.annualIncome AS annualIncome
"""

GET_CUSTOMER_JOURNEY = """
MATCH (c:Customer {customerId: $customerId})
OPTIONAL MATCH (e:Event)-[:AFFECTS]->(c)
OPTIONAL MATCH (c)-[:SUBMITTED_REQUEST]->(sr:ServiceRequest)
OPTIONAL MATCH (c)-[:OWNS]->(a:Account)
RETURN collect(distinct e {
    .eventId,
    .eventName,
    .timestamp,
    .severity,
    type: 'event'
}) AS events,
collect(distinct sr {
    .requestId,
    .category,
    .priority,
    .status,
    type: 'service_request'
}) AS requests,
collect(distinct a {
    .accountId,
    .accountNumber,
    .balance,
    .dateOpened,
    type: 'account'
}) AS accounts
"""

GET_CUSTOMER_GOALS = """
MATCH (c:Customer {customerId: $customerId})-[:HAS_GOAL]->(g:Goal)
OPTIONAL MATCH (g)-[:FUNDED_BY]->(a:Account)
RETURN g {
    .goalId,
    .goalType,
    .targetAmount,
    .targetDate,
    fundingAccountId: a.accountId,
    currentAmount: a.balance
} AS goal
"""

GET_CUSTOMER_RISK = """
MATCH (c:Customer {customerId: $customerId})-[:HAS_RISK_PROFILE]->(rp:RiskProfile)
RETURN rp {
    .riskProfileId,
    .riskScore,
    .riskRating
} AS riskProfile
"""
