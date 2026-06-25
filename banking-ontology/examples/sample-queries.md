# SPARQL Sample Queries for SBI Ontology

Below are representative SPARQL queries demonstrating how cognitive agents or developers can query the SBI Enterprise Banking Knowledge Graph.

## 1. Retrieve all accounts owned by a customer and their active balances
This query is used by the **Financial Advisor Agent** to analyze liquid funds.
```sparql
PREFIX sbi: <http://sbi.co.in/ontology/banking#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?customerName ?accountNumber ?balance ?statusLabel
WHERE {
  ?customer rdf:type sbi:IndividualCustomer ;
            sbi:firstName ?firstName ;
            sbi:lastName ?lastName ;
            sbi:ownsAccount ?account .
  ?account sbi:accountNumber ?accountNumber ;
           sbi:balance ?balance ;
           sbi:hasAccountStatus ?status .
  ?status rdfs:label ?statusLabel .
  BIND(CONCAT(?firstName, " ", ?lastName) AS ?customerName)
}
```

## 2. Check if a customer has a verified KYC record and active identification documents
This query is run by the **Risk Agent** prior to authorizing high-value transactions or lending approvals.
```sparql
PREFIX sbi: <http://sbi.co.in/ontology/banking#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?customerName ?kycId ?statusLabel ?expiryDate
WHERE {
  ?customer rdf:type sbi:IndividualCustomer ;
            sbi:firstName ?firstName ;
            sbi:lastName ?lastName ;
            sbi:hasKYCRecord ?kyc .
  ?kyc sbi:kycRecordId ?kycId ;
       sbi:hasVerificationStatus ?status ;
       sbi:reliesOnDocument ?doc .
  ?doc sbi:documentExpiry ?expiryDate .
  ?status rdfs:label ?statusLabel .
  BIND(CONCAT(?firstName, " ", ?lastName) AS ?customerName)
}
```

## 3. Find debit transactions at merchants with high risk levels
This query is used by the **Fraud Agent** to flag suspicious activity.
```sparql
PREFIX sbi: <http://sbi.co.in/ontology/banking#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?txnId ?amount ?timestamp ?merchantName ?riskRating
WHERE {
  ?txn rdf:type sbi:DebitTransaction ;
       sbi:transactionId ?txnId ;
       sbi:amount ?amount ;
       sbi:timestamp ?timestamp ;
       sbi:occursAtMerchant ?merchant .
  ?merchant sbi:merchantName ?merchantName ;
            sbi:merchantRiskRating ?riskRating .
  FILTER(?riskRating > 50)
}
```

## 4. Retrieve financial goals and calculate target gap
This query is used by the **Financial Advisor Agent** to track goal progress.
```sparql
PREFIX sbi: <http://sbi.co.in/ontology/banking#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

SELECT ?customerName ?goalId ?targetAmount ?accountBalance (?targetAmount - ?accountBalance AS ?fundingGap) ?targetDate
WHERE {
  ?customer rdf:type sbi:IndividualCustomer ;
            sbi:firstName ?firstName ;
            sbi:lastName ?lastName ;
            sbi:pursuesGoal ?goal .
  ?goal sbi:goalId ?goalId ;
        sbi:targetAmount ?targetAmount ;
        sbi:targetDate ?targetDate ;
        sbi:fundedByAccount ?account .
  ?account sbi:balance ?accountBalance .
  BIND(CONCAT(?firstName, " ", ?lastName) AS ?customerName)
}
```
