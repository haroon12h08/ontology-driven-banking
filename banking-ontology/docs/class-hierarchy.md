# Class Hierarchy Catalog - SBI Enterprise Banking Ontology

This catalog lists the taxonomies of the core classes defined in the ontology.

## 1. Taxonomic Tree

```text
owl:Thing
 ├── sbi:Customer
 │    ├── sbi:IndividualCustomer
 │    └── sbi:CorporateCustomer
 ├── sbi:CustomerHousehold
 ├── sbi:CustomerSegment
 ├── sbi:BankingProduct
 │    ├── sbi:DepositProduct
 │    ├── sbi:LendingProduct
 │    └── sbi:InvestmentProduct
 ├── sbi:ProductRules
 ├── sbi:Account
 │    ├── sbi:DepositAccount
 │    │    ├── sbi:SavingsAccount
 │    │    └── sbi:CheckingAccount
 │    ├── sbi:LendingAccount
 │    │    ├── sbi:LoanAccount
 │    │    └── sbi:CreditCardAccount
 │    └── sbi:InvestmentAccount
 ├── sbi:AccountStatus
 ├── sbi:Transaction
 │    ├── sbi:DebitTransaction
 │    ├── sbi:CreditTransaction
 │    └── sbi:TransferTransaction
 ├── sbi:TransactionChannel
 ├── sbi:TransactionStatus
 ├── sbi:TransactionCategorization
 ├── sbi:Merchant
 ├── sbi:MerchantCategory
 ├── sbi:MerchantBrand
 ├── sbi:FinancialGoal
 ├── sbi:GoalType
 ├── sbi:GoalMilestone
 ├── sbi:InvestmentPortfolio
 ├── sbi:InvestmentAsset
 ├── sbi:AssetClass
 ├── sbi:PortfolioRebalancingAction
 ├── sbi:Loan
 │    ├── sbi:HomeLoan
 │    ├── sbi:AutoLoan
 │    └── sbi:PersonalLoan
 ├── sbi:Collateral
 ├── sbi:AmortizationSchedule
 ├── sbi:Lien
 ├── sbi:CreditCard
 ├── sbi:BillingStatement
 ├── sbi:RewardsProgram
 ├── sbi:RiskProfile
 ├── sbi:RiskAssessment
 ├── sbi:RiskFactor
 ├── sbi:FraudAlert
 ├── sbi:FraudCase
 ├── sbi:FraudPattern
 ├── sbi:SuspiciousActivityReport
 ├── sbi:KYCRecord
 ├── sbi:VerificationStatus
 ├── sbi:SanctionScreeningResult
 ├── sbi:PEPCheckResult
 ├── sbi:InteractionHistory
 ├── sbi:EngagementCampaign
 ├── sbi:CustomerFeedback
 ├── sbi:NPSMetric
 ├── sbi:SystemProcess
 ├── sbi:OperationsQueue
 ├── sbi:OperationalLog
 ├── sbi:SystemOutage
 ├── sbi:ServiceRequest
 ├── sbi:RequestCategory
 ├── sbi:RequestPriority
 ├── sbi:SLAAgreement
 ├── sbi:Notification
 ├── sbi:NotificationTemplate
 ├── sbi:NotificationChannel
 ├── sbi:Policy
 │    ├── sbi:UnderwritingPolicy
 │    ├── sbi:InterestRatePolicy
 │    ├── sbi:CreditLimitPolicy
 │    └── sbi:RegulatoryPolicy
 ├── sbi:RegulatoryRequirement
 ├── sbi:PolicyException
 ├── sbi:FinancialHealthScore
 ├── sbi:FinancialMetric
 ├── sbi:SpendingBenchmark
 ├── sbi:Recommendation
 ├── sbi:RecommendationAction
 ├── sbi:RecommendationFeedback
 ├── sbi:BankingEvent
 ├── sbi:EventTopic
 ├── sbi:EventPayload
 ├── sbi:InteractionContext
 ├── sbi:DeviceContext
 ├── sbi:LocationContext
 ├── sbi:CustomerJourney
 ├── sbi:JourneyStage
 ├── sbi:JourneyMilestone
 ├── sbi:Document
 │    └── sbi:IdentityDocument
 ├── sbi:DocumentType
 ├── sbi:DigitalSignature
 ├── sbi:Branch
 ├── sbi:ATM
 ├── sbi:Vault
 ├── sbi:Employee
 │    └── sbi:RelationshipManager
 └── sbi:SystemRole
```

## 2. Core Class Descriptions

| Class URI | Label | Parent Class | Description |
| :--- | :--- | :--- | :--- |
| `sbi:Customer` | Customer | `owl:Thing` | Abstract base class representing a retail client or commercial corporate client. |
| `sbi:IndividualCustomer` | Individual Customer | `sbi:Customer` | A natural person client possessing checking, savings, lending, and investment accounts. |
| `sbi:CorporateCustomer` | Corporate Customer | `sbi:Customer` | A business, trust, or enterprise customer that owns corporate deposit accounts and borrows commercial credit lines. |
| `sbi:CustomerHousehold` | Customer Household | `owl:Thing` | Semantic grouping of related individual customer profiles to calculate household-level wealth, risk, and goals. |
| `sbi:BankingProduct` | Banking Product | `owl:Thing` | Core abstract class capturing product templates, operational fee rules, and rate constraints. |
| `sbi:DepositProduct` | Deposit Product | `sbi:BankingProduct` | Product configurations representing assets for the customer (Checking, Savings, Certs of Deposit). |
| `sbi:LendingProduct` | Lending Product | `sbi:BankingProduct` | Product configurations representing debt borrowed by customers (Mortgages, Lines of Credit). |
| `sbi:Account` | Account | `owl:Thing` | An active contract held by a customer containing balance metrics. |
| `sbi:Transaction` | Transaction | `owl:Thing` | Immutable ledger record of cash movement between accounts. |
| `sbi:RiskProfile` | Risk Profile | `owl:Thing` | The central risk classification rating calculated for a customer. |
