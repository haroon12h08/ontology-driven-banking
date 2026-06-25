# Data Properties Catalog - SBI Enterprise Banking Ontology

This catalog lists the data properties (attributes) defined in the ontology, including their domains, XML Schema data ranges, and cardinality constraints.

## 1. Data Properties List

| Property URI | Label | Domain Class | XML Schema Range | Functional? | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `sbi:customerId` | customer ID | `sbi:Customer` | `xsd:string` | Yes | Unique string (UUID) identifying a customer entity. |
| `sbi:onboardingDate` | onboarding date | `sbi:Customer` | `xsd:date` | Yes | Date the customer relationship was initialized. |
| `sbi:riskToleranceScore` | risk tolerance score | `sbi:Customer` | `xsd:integer` | Yes | Numeric indicator (1-100) representing risk appetite. |
| `sbi:netWorthClass` | net worth class | `sbi:Customer` | `xsd:string` | Yes | Tier classification (e.g., Mass Retail, HNWI, UHNWI). |
| `sbi:firstName` | first name | `sbi:IndividualCustomer` | `xsd:string` | Yes | First name of the customer. |
| `sbi:lastName` | last name | `sbi:IndividualCustomer` | `xsd:string` | Yes | Last name of the customer. |
| `sbi:dateOfBirth` | date of birth | `sbi:IndividualCustomer` | `xsd:date` | Yes | Birth date (used for age verification rules). |
| `sbi:annualIncome` | annual income | `sbi:IndividualCustomer` | `xsd:decimal` | Yes | Stated annual salary or wages. |
| `sbi:legalName` | legal name | `sbi:CorporateCustomer` | `xsd:string` | Yes | Registered corporate name of business client. |
| `sbi:annualRevenue` | annual revenue | `sbi:CorporateCustomer` | `xsd:decimal` | Yes | Stated annual corporate earnings. |
| `sbi:productId` | product ID | `sbi:BankingProduct` | `xsd:string` | Yes | Product template reference code. |
| `sbi:productName` | product name | `sbi:BankingProduct` | `xsd:string` | Yes | Public marketing name of product offering. |
| `sbi:baseInterestRate` | base interest rate | `sbi:DepositProduct` | `xsd:decimal` | Yes | Base Annual Percentage Yield (APY) interest rate. |
| `sbi:minimumCreditScore` | minimum credit score | `sbi:LendingProduct` | `xsd:integer` | Yes | Underwriting criteria score limit. |
| `sbi:accountId` | account ID | `sbi:Account` | `xsd:string` | Yes | Unique account UUID. |
| `sbi:balance` | balance | `sbi:Account` | `xsd:decimal` | Yes | Core ledger balance of the account. |
| `sbi:availableBalance` | available balance | `sbi:DepositAccount` | `xsd:decimal` | Yes | Spendable balance excluding hold reserves. |
| `sbi:outstandingPrincipal` | outstanding principal | `sbi:LendingAccount` | `xsd:decimal` | Yes | Unpaid principal loan debt remaining. |
| `sbi:transactionId` | transaction ID | `sbi:Transaction` | `xsd:string` | Yes | Unique clearing ID for a ledger transaction. |
| `sbi:amount` | amount | `sbi:Transaction` | `xsd:decimal` | Yes | Monetary value of the transaction. |
| `sbi:timestamp` | timestamp | `sbi:Transaction` | `xsd:dateTime` | Yes | Exact UTC timestamp of transaction clearing. |
| `sbi:merchantId` | merchant ID | `sbi:Merchant` | `xsd:string` | Yes | Unique corporate identifier of merchant outlet. |
| `sbi:merchantName` | merchant name | `sbi:Merchant` | `xsd:string` | Yes | Trading name of the business outlet. |
| `sbi:merchantRiskRating` | merchant risk rating | `sbi:Merchant` | `xsd:integer` | Yes | Calculated safety/fraud risk score (0-100). |
| `sbi:mccCode` | MCC code | `sbi:MerchantCategory` | `xsd:string` | Yes | Standard 4-digit Merchant Category Code. |
| `sbi:targetAmount` | target amount | `sbi:FinancialGoal` | `xsd:decimal` | Yes | Target financial goal value. |
| `sbi:targetDate` | target date | `sbi:FinancialGoal` | `xsd:date` | Yes | Deadline date for goal completion. |
| `sbi:assetTicker` | asset ticker | `sbi:InvestmentAsset` | `xsd:string` | Yes | Exchange listing ticker symbol (e.g., AAPL). |
| `sbi:assetCurrentPrice` | asset current price | `sbi:InvestmentAsset` | `xsd:decimal` | Yes | Real-time market feed price of security. |
| `sbi:creditLimit` | credit limit | `sbi:CreditCardAccount` | `xsd:decimal` | Yes | Maximum revolving credit line. |
| `sbi:alertScore` | alert score | `sbi:FraudAlert` | `xsd:decimal` | Yes | Fraud model probability score (0.00-1.00). |
| `sbi:fraudLossAmount` | fraud loss amount | `sbi:FraudCase` | `xsd:decimal` | Yes | Financial loss logged under fraud case. |
| `sbi:verificationDate` | verification date | `sbi:KYCRecord` | `xsd:date` | Yes | Completion timestamp of compliance audit. |
| `sbi:sentimentScore` | sentiment score | `sbi:InteractionHistory` | `xsd:decimal` | Yes | NLP sentiment polarity (-1.00 to 1.00). |
| `sbi:healthScoreValue` | health score value | `sbi:FinancialHealthScore` | `xsd:integer` | Yes | Wellness score ranking index (1-100). |
| `sbi:recommendationConfidence`| recommendation confidence| `sbi:Recommendation` | `xsd:decimal` | Yes | Recommender prediction confidence. |
| `sbi:eventId` | event ID | `sbi:BankingEvent` | `xsd:string` | Yes | Broker tracking event ID. |
| `sbi:eventTimestamp` | event timestamp | `sbi:BankingEvent` | `xsd:dateTime` | Yes | Message timestamp. |
| `sbi:employeeId` | employee ID | `sbi:Employee` | `xsd:string` | Yes | Human resources employee ID. |
