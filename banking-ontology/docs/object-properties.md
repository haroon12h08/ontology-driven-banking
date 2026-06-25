# Object Properties Catalog - SBI Enterprise Banking Ontology

This catalog lists the object properties (semantic relationships) defined in the ontology, including their domains, ranges, and inverse properties.

## 1. Object Properties List

| Property URI | Label | Domain Class | Range Class | Inverse Property | Functional? | Description |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `sbi:ownsAccount` | owns account | `sbi:Customer` | `sbi:Account` | `sbi:ownedBy` | No | Links customers to their owned deposit, credit, or investment accounts. |
| `sbi:ownedBy` | owned by | `sbi:Account` | `sbi:Customer` | `sbi:ownsAccount` | Yes | Links an account to its primary owner. |
| `sbi:memberOfHousehold` | member of household | `sbi:IndividualCustomer` | `sbi:CustomerHousehold` | `sbi:hasHouseholdMember` | No | Links individuals to family households. |
| `sbi:hasHouseholdMember` | has household member | `sbi:CustomerHousehold` | `sbi:IndividualCustomer` | `sbi:memberOfHousehold` | No | Links household aggregates back to members. |
| `sbi:belongsToSegment` | belongs to segment | `sbi:Customer` | `sbi:CustomerSegment` | `sbi:segmentHasCustomer` | Yes | Classifies a customer under a relationship tier. |
| `sbi:hasBeneficialOwner` | has beneficial owner | `sbi:CorporateCustomer` | `sbi:IndividualCustomer` | `sbi:beneficialOwnerOf` | No | Tracks key stakeholders of business accounts for compliance. |
| `sbi:employedBy` | employed by | `sbi:IndividualCustomer` | `sbi:CorporateCustomer` | `sbi:employs` | Yes | Tracks customer employment records. |
| `sbi:governedByRules` | governed by rules | `sbi:BankingProduct` | `sbi:ProductRules` | `sbi:rulesApplyTo` | Yes | Links product templates to fee schedules and terms. |
| `sbi:instantiatesProduct` | instantiates product | `sbi:Account` | `sbi:BankingProduct` | `sbi:productInstantiatedBy` | Yes | Links concrete ledger accounts to product lines. |
| `sbi:hasAccountStatus` | has account status | `sbi:Account` | `sbi:AccountStatus` | `sbi:statusOfAccount` | Yes | Identifies account availability states (Active/Frozen). |
| `sbi:originatesTransaction` | originates transaction | `sbi:Account` | `sbi:Transaction` | `sbi:originatingAccount` | No | Logs accounts originating debits/transfers. |
| `sbi:receivesTransaction` | receives transaction | `sbi:Account` | `sbi:Transaction` | `sbi:receivingAccount` | No | Logs accounts receiving credits/transfers. |
| `sbi:initiatedVia` | initiated via | `sbi:Transaction` | `sbi:TransactionChannel` | `sbi:channelUsedBy` | Yes | Tracks payment initiation routing methods. |
| `sbi:hasTransactionStatus` | has transaction status | `sbi:Transaction` | `sbi:TransactionStatus` | `sbi:statusOfTransaction` | Yes | Tracks clearing lifecycle of transactions. |
| `sbi:occursAtMerchant` | occurs at merchant | `sbi:Transaction` | `sbi:Merchant` | `sbi:processesTransaction` | Yes | Associates transaction spend with merchants. |
| `sbi:belongsToCategory` | belongs to category | `sbi:Merchant` | `sbi:MerchantCategory` | `sbi:containsMerchant` | Yes | Categorizes merchants using standard MCC codes. |
| `sbi:pursuesGoal` | pursues goal | `sbi:Customer` | `sbi:FinancialGoal` | `sbi:pursuedBy` | No | Connects financial plans to customers. |
| `sbi:fundedByAccount` | funded by account | `sbi:FinancialGoal` | `sbi:Account` | `sbi:fundsGoal` | No | Links goals to funding checkings/savings balances. |
| `sbi:securedByCollateral` | secured by collateral | `sbi:Loan` | `sbi:Collateral` | `sbi:securesLoan` | No | Maps lending debt contracts to securing assets. |
| `sbi:hasRiskProfile` | has risk profile | `sbi:Customer` | `sbi:RiskProfile` | `sbi:riskOfCustomer` | Yes | Binds active risk scores to customers. |
| `sbi:triggersFraudAlert` | triggers fraud alert | `sbi:Transaction` | `sbi:FraudAlert` | `sbi:alertedTransaction` | No | Links system alerts to triggering transactions. |
| `sbi:hasKYCRecord` | has KYC record | `sbi:Customer` | `sbi:KYCRecord` | `sbi:kycOfCustomer` | Yes | Connects audit verification files to customers. |
| `sbi:reliesOnDocument` | relies on document | `sbi:KYCRecord` | `sbi:IdentityDocument` | `sbi:verifiesKYC` | No | Connects verification audits to ID docs. |
| `sbi:managesCustomer` | manages customer | `sbi:RelationshipManager` | `sbi:Customer` | `sbi:managedByRM` | No | Allocates relationship managers to client accounts. |
| `sbi:employeeAssignedToBranch` | employee assigned to branch | `sbi:Employee` | `sbi:Branch` | `sbi:employeesAtBranch` | Yes | Identifies local staff branches. |
