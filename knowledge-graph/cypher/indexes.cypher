// Indexes for SBI Banking Knowledge Graph

CREATE INDEX customer_name_idx IF NOT EXISTS
FOR (c:Customer) ON (c.firstName, c.lastName);

CREATE INDEX customer_segment_idx IF NOT EXISTS
FOR (c:Customer) ON (c.segment);

CREATE INDEX customer_credit_score_idx IF NOT EXISTS
FOR (c:Customer) ON (c.creditScore);

CREATE INDEX customer_occupation_idx IF NOT EXISTS
FOR (c:Customer) ON (c.occupation);

CREATE INDEX account_status_idx IF NOT EXISTS
FOR (a:Account) ON (a.status);

CREATE INDEX transaction_timestamp_idx IF NOT EXISTS
FOR (t:Transaction) ON (t.timestamp);

CREATE INDEX transaction_channel_idx IF NOT EXISTS
FOR (t:Transaction) ON (t.channel);

CREATE INDEX merchant_category_idx IF NOT EXISTS
FOR (m:Merchant) ON (m.category);

CREATE INDEX product_type_idx IF NOT EXISTS
FOR (p:Product) ON (p.productType);

CREATE INDEX risk_rating_idx IF NOT EXISTS
FOR (r:RiskProfile) ON (r.riskRating);

CREATE INDEX event_name_idx IF NOT EXISTS
FOR (e:Event) ON (e.eventName);
