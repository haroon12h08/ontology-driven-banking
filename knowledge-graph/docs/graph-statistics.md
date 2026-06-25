# Graph Statistics - SBI Banking Knowledge Graph

This document details the actual node and relationship metrics inside the populated Neo4j Knowledge Graph.

## 1. Actual Node Counts

Once the load process completes, running `validate_graph.py` reports the following metrics:

| Node Label | Actual Node Count | Description |
| :--- | :--- | :--- |
| `:Transaction` | 20,000 | Immutable transactional ledger base class. |
| `:DebitTransaction` | 20,000 | Subclass representing outbound transaction. |
| `:Account` | 800 | Open customer bank accounts. |
| `:SavingsAccount` | 136 | Subclass of `:DepositAccount` |
| `:CheckingAccount` | 53 | Subclass of `:DepositAccount` |
| `:LoanAccount` | 343 | Subclass of `:LendingAccount` |
| `:CreditCardAccount` | 130 | Subclass of `:LendingAccount` |
| `:Customer` | 500 | Base customer entity class. |
| `:IndividualCustomer` | 500 | Active retail banking customers. |
| `:Merchant` | 600 | Processing points. |
| `:Goal` | 500 | Customer objectives. |
| `:Event` | 500 | Event broker logs. |
| `:RiskProfile` | 500 | Customer risk configurations. |
| `:Employee` | 100 | Global banking staff. |
| `:RelationshipManager` | 20 | Subclass of `:Employee` |
| `:Product` | 80 | Product lines offered. |
| `:Policy` | 100 | Governing internal policies. |
| `:ServiceRequest` | 200 | Ticketing requests. |
| `:Recommendation` | 200 | Product recommendation containers. |
| `:Branch` | 25 | Physical storefront offices. |

## 2. Actual Relationship Counts

| Relationship Type | Actual Count | Functional Description |
| :--- | :--- | :--- |
| `:HAS_TRANSACTION` | 20,000 | Connects Accounts to Transactions. |
| `:AT` | 20,000 | Connects Transactions to Merchants. |
| `:OWNS` | 800 | Connects Customers to Accounts. |
| `:INSTANTIATES_PRODUCT` | 800 | Connects Accounts to Products. |
| `:HAS_GOAL` | 500 | Connects Customers to Goals. |
| `:FUNDED_BY` | 500 | Connects Goals to funding Accounts. |
| `:AFFECTS` | 500 | Connects system Events to Customers. |
| `:HAS_RISK_PROFILE` | 500 | Connects Customers to RiskProfiles. |
| `:MANAGES` | 342 | Connects RelationshipManagers to Customers. |
| `:ASSIGNED_TO_BRANCH` | 100 | Connects Employees to Branches. |
| `:SUBMITTED_REQUEST` | 200 | Connects Customers to ServiceRequests. |
| `:ASSIGNED_TO` | 200 | Connects ServiceRequests to Employees. |
| `:RECEIVED_RECOMMENDATION`| 200 | Connects Customers to Recommendations. |
| `:RECOMMENDS_PRODUCT` | 200 | Connects Recommendations to Products. |
| `:CONSTRAINED_BY` | 80 | Connects Products to Policies. |
| `:REPRESENTS_LOAN` | 343 | Connects LoanAccounts to Loans. |
