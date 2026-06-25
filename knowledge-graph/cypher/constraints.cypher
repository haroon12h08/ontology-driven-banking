// Uniqueness Constraints for SBI Banking Knowledge Graph

CREATE CONSTRAINT customer_id_unique IF NOT EXISTS
FOR (c:Customer) REQUIRE c.customerId IS UNIQUE;

CREATE CONSTRAINT account_id_unique IF NOT EXISTS
FOR (a:Account) REQUIRE a.accountId IS UNIQUE;

CREATE CONSTRAINT account_number_unique IF NOT EXISTS
FOR (a:Account) REQUIRE a.accountNumber IS UNIQUE;

CREATE CONSTRAINT transaction_id_unique IF NOT EXISTS
FOR (t:Transaction) REQUIRE t.transactionId IS UNIQUE;

CREATE CONSTRAINT merchant_id_unique IF NOT EXISTS
FOR (m:Merchant) REQUIRE m.merchantId IS UNIQUE;

CREATE CONSTRAINT product_id_unique IF NOT EXISTS
FOR (p:Product) REQUIRE p.productId IS UNIQUE;

CREATE CONSTRAINT branch_id_unique IF NOT EXISTS
FOR (b:Branch) REQUIRE b.branchId IS UNIQUE;

CREATE CONSTRAINT employee_id_unique IF NOT EXISTS
FOR (e:Employee) REQUIRE e.employeeId IS UNIQUE;

CREATE CONSTRAINT policy_id_unique IF NOT EXISTS
FOR (p:Policy) REQUIRE p.policyId IS UNIQUE;

CREATE CONSTRAINT goal_id_unique IF NOT EXISTS
FOR (g:Goal) REQUIRE g.goalId IS UNIQUE;

CREATE CONSTRAINT event_id_unique IF NOT EXISTS
FOR (e:Event) REQUIRE e.eventId IS UNIQUE;

CREATE CONSTRAINT risk_profile_id_unique IF NOT EXISTS
FOR (r:RiskProfile) REQUIRE r.riskProfileId IS UNIQUE;

CREATE CONSTRAINT service_request_id_unique IF NOT EXISTS
FOR (s:ServiceRequest) REQUIRE s.requestId IS UNIQUE;

CREATE CONSTRAINT recommendation_id_unique IF NOT EXISTS
FOR (r:Recommendation) REQUIRE r.recommendationId IS UNIQUE;

// Neosemantics RDF unique URI constraint
CREATE CONSTRAINT n10s_unique_uri IF NOT EXISTS
FOR (r:Resource) REQUIRE r.uri IS UNIQUE;
