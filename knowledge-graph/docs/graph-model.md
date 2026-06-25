# Neo4j Graph Model - SBI Banking Knowledge Graph

This document details the mapping of the SBI Enterprise Banking OWL Ontology into the Neo4j Property Graph schema.

## 1. Class-to-Label Mapping

Every class in the OWL ontology is mapped to a node label in Neo4j. To support class hierarchies, nodes can carry multiple labels (e.g. `:Customer:IndividualCustomer`).

| OWL Class | Neo4j Label | Core Node Properties |
| :--- | :--- | :--- |
| `sbi:Customer` | `:Customer` | `customerId`, `onboardingDate`, `riskToleranceScore`, `netWorthClass` |
| `sbi:IndividualCustomer`| `:IndividualCustomer`| `firstName`, `lastName`, `dateOfBirth`, `annualIncome`, `occupation`, `city` |
| `sbi:CorporateCustomer` | `:CorporateCustomer` | `legalName`, `annualRevenue` |
| `sbi:Account` | `:Account` | `accountId`, `accountNumber`, `balance`, `availableBalance`, `dateOpened`, `status` |
| `sbi:SavingsAccount` | `:SavingsAccount` | Extends `:Account` |
| `sbi:CheckingAccount` | `:CheckingAccount` | Extends `:Account` |
| `sbi:Loan` | `:Loan` | `loanId`, `loanAmount`, `interestRate`, `tenureMonths`, `outstandingBalance` |
| `sbi:Transaction` | `:Transaction` | `transactionId`, `amount`, `timestamp`, `channel`, `isFraud` |
| `sbi:Merchant` | `:Merchant` | `merchantId`, `merchantName`, `category`, `riskRating`, `city` |
| `sbi:Product` | `:Product` | `productId`, `productName`, `productType`, `baseRate` |
| `sbi:Policy` | `:Policy` | `policyId`, `policyName`, `version`, `effectiveDate`, `status` |
| `sbi:Goal` | `:Goal` | `goalId`, `goalType`, `targetAmount`, `targetDate` |
| `sbi:RiskProfile` | `:RiskProfile` | `riskProfileId`, `riskScore`, `riskRating` |
| `sbi:Branch` | `:Branch` | `branchId`, `branchName`, `streetAddress`, `city`, `cashReserves` |
| `sbi:Employee` | `:Employee` | `employeeId`, `fullName`, `email`, `role`, `isRM` |
| `sbi:RelationshipManager`| `:RelationshipManager`| Extends `:Employee` |

## 2. Object Property-to-Relationship Mapping

Object properties map directly to directed Cypher relationships using uppercase snake_case:

| OWL Object Property | Neo4j Relationship Type | Cypher Path Representation |
| :--- | :--- | :--- |
| `sbi:ownsAccount` | `:OWNS` | `(c:Customer)-[:OWNS]->(a:Account)` |
| `sbi:instantiatesProduct` | `:INSTANTIATES_PRODUCT` | `(a:Account)-[:INSTANTIATES_PRODUCT]->(p:Product)` |
| `sbi:originatesTransaction` | `:HAS_TRANSACTION` | `(a:Account)-[:HAS_TRANSACTION]->(t:Transaction)` |
| `sbi:occursAtMerchant` | `:AT` | `(t:Transaction)-[:AT]->(m:Merchant)` |
| `sbi:belongsToCategory` | `:BELONGS_TO_CATEGORY` | `(m:Merchant)-[:BELONGS_TO_CATEGORY]->(mc:MerchantCategory)` |
| `sbi:pursuesGoal` | `:HAS_GOAL` | `(c:Customer)-[:HAS_GOAL]->(g:Goal)` |
| `sbi:fundedByAccount` | `:FUNDED_BY` | `(g:Goal)-[:FUNDED_BY]->(a:Account)` |
| `sbi:securedByCollateral` | `:SECURED_BY` | `(l:Loan)-[:SECURED_BY]->(col:Collateral)` |
| `sbi:hasRiskProfile` | `:HAS_RISK_PROFILE` | `(c:Customer)-[:HAS_RISK_PROFILE]->(rp:RiskProfile)` |
| `sbi:triggersFraudAlert` | `:TRIGGERS_ALERT` | `(t:Transaction)-[:TRIGGERS_ALERT]->(fa:FraudAlert)` |
| `sbi:hasKYCRecord` | `:HAS_KYC` | `(c:Customer)-[:HAS_KYC]->(k:KYCRecord)` |
| `sbi:managesCustomer` | `:MANAGES` | `(rm:RelationshipManager)-[:MANAGES]->(c:Customer)` |
| `sbi:employeeAssignedToBranch` | `:ASSIGNED_TO_BRANCH` | `(e:Employee)-[:ASSIGNED_TO_BRANCH]->(b:Branch)` |
| `sbi:productConstrainedByPolicy` | `:CONSTRAINED_BY` | `(p:Product)-[:CONSTRAINED_BY]->(pol:Policy)` |
