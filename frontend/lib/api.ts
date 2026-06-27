import { CustomerProfileData, AccountData, RecommendationData, EvidenceData, AgentLog, LatencyLog } from "@/store/bankingStore";

const API_BASE_URL = "http://localhost:8000";

// Fallback Mock Data in case backend is offline
const MOCK_PROFILES: Record<string, CustomerProfileData> = {
  "CUST-006": {
    customerId: "CUST-006",
    firstName: "CustomerFirstName6",
    lastName: "CustomerLastName6",
    creditScore: 748,
    segment: "MassAffluent",
    spendingPattern: "Disciplined Saver",
    churnRisk: "Low Churn Risk",
    digitalAdoption: "Medium",
    age: 29,
    occupation: "Consultant",
    riskRating: "High",
    riskScore: 531
  },
  "CUST-001": {
    customerId: "CUST-001",
    firstName: "CustomerFirstName1",
    lastName: "CustomerLastName1",
    creditScore: 598,
    segment: "HNWI",
    spendingPattern: "Debt Dependent Spender",
    churnRisk: "High Churn Risk",
    digitalAdoption: "High",
    age: 66,
    occupation: "Retired",
    riskRating: "Medium",
    riskScore: 320
  }
};

const MOCK_ACCOUNTS: Record<string, AccountData[]> = {
  "CUST-006": [
    { accountId: "ACC-694", accountNumber: "SBI-5880922736", balance: 338678.02, availableBalance: 321669.79, status: "Active", label: "MutualFund" },
    { accountId: "ACC-484", accountNumber: "SBI-5659086958", balance: 471849.60, availableBalance: 439518.68, status: "Active", label: "Savings" },
    { accountId: "ACC-769", accountNumber: "SBI-4990891827", balance: 94278.03, availableBalance: 87116.06, status: "Active", label: "Savings" },
    { accountId: "ACC-273", accountNumber: "SBI-5346341182", balance: 415928.91, availableBalance: 378399.59, status: "Active", label: "HomeLoan" }
  ],
  "CUST-001": [
    { accountId: "ACC-101", accountNumber: "SBI-1002003001", balance: 120500.50, availableBalance: 110000.00, status: "Active", label: "Savings" },
    { accountId: "ACC-102", accountNumber: "SBI-4445556667", balance: 50000.00, availableBalance: 48000.00, status: "Active", label: "CreditCard" }
  ]
};

const MOCK_RECOMMENDATIONS: Record<string, RecommendationData[]> = {
  "CUST-006": [
    { productId: "mutual_fund_conservative", productName: "SBI Conservative Mutual Fund", category: "Investment", score: 0.85, description: "Debt-oriented safe mutual funds." },
    { productId: "mutual_fund_aggressive", productName: "SBI Aggressive Equity Fund", category: "Investment", score: 0.85, description: "High-growth equity mutual funds." },
    { productId: "savings_promo", productName: "SBI High Yield Savings Promo", category: "Savings", score: 0.70, description: "Special tier savings rate p.a." }
  ],
  "CUST-001": [
    { productId: "fixed_deposit", productName: "SBI Golden Jubilee Fixed Deposit", category: "Savings", score: 0.95, description: "Reinvest maturity principal at 7.25% p.a." },
    { productId: "loan_refinance", productName: "SBI Loan Refinancing Plan", category: "Lending", score: 0.85, description: "Refinance your mortgage at a lower rate." }
  ]
};

interface SemanticResponseEntity {
  type: string;
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
}

interface SemanticResponsePayload {
  status: string;
  summary: string;
  entities?: SemanticResponseEntity[];
  relationships?: Array<{ type: string; source: string; target: string }>;
  confidence?: number;
  timestamp?: string;
  workflow_name?: string;
  final_output?: string;
  explainability?: {
    reasoning_chain?: AgentLog[];
    evidence?: EvidenceData | null;
    policies_used?: string[];
    confidence_score?: string;
  };
  observability?: {
    execution_logs?: LatencyLog[];
  };
}

export const bankingApi = {
  async getHealth(): Promise<SemanticResponsePayload> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn("Backend health check failed. Using mock environment.", e);
    }
    return {
      status: "success",
      summary: "Ontology Service Layer running in Mock Mode.",
      entities: [{ type: "ServiceHealth", id: "ontology-service", properties: { status: "healthy", database: "Mock Data Cache", version: "5.18.0", edition: "community" } }]
    };
  },

  async getCustomerProfile(customerId: string): Promise<CustomerProfileData | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/profile`);
      if (res.ok) {
        const data: SemanticResponsePayload = await res.json();
        const profileEnt = data.entities?.find((e) => e.type === "Customer");
        const riskEnt = data.entities?.find((e) => e.type === "RiskProfile");
        
        if (profileEnt) {
          const profile = { ...profileEnt.properties } as unknown as CustomerProfileData;
          if (riskEnt) {
            profile.riskRating = riskEnt.properties.riskRating;
            profile.riskScore = riskEnt.properties.riskScore;
          }
          return profile;
        }
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_PROFILES[customerId] || MOCK_PROFILES["CUST-006"];
  },

  async getCustomerAccounts(customerId: string): Promise<AccountData[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers/${customerId}/accounts`);
      if (res.ok) {
        const data: SemanticResponsePayload = await res.json();
        return (data.entities || [])
          .filter((e) => e.type === "Account")
          .map((e) => ({
            accountId: e.id,
            accountNumber: e.properties.accountNumber,
            balance: e.properties.balance,
            availableBalance: e.properties.availableBalance,
            status: e.properties.status,
            label: e.properties.labels?.[1] || "Account"
          }));
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_ACCOUNTS[customerId] || MOCK_ACCOUNTS["CUST-006"];
  },

  async getRecommendations(customerId: string): Promise<RecommendationData[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recommendations/customer/${customerId}`);
      if (res.ok) {
        const data: SemanticResponsePayload = await res.json();
        return (data.entities || [])
          .filter((e) => e.type === "Recommendation")
          .map((e) => e.properties as unknown as RecommendationData);
      }
    } catch (e) {
      console.error(e);
    }
    return MOCK_RECOMMENDATIONS[customerId] || MOCK_RECOMMENDATIONS["CUST-006"];
  },

  async getOntologyClasses(): Promise<{ entities: Array<{ id: string; properties: { description: string } }> }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ontology/classes`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(e);
    }
    return {
      entities: [
        { id: "Customer", properties: { description: "Represents a retail banking customer entity." } },
        { id: "Account", properties: { description: "A financial account owned by a customer." } },
        { id: "SavingsAccount", properties: { description: "A deposit account that earns interest." } },
        { id: "LoanAccount", properties: { description: "An account tracking a customer loan exposure." } },
        { id: "Transaction", properties: { description: "A monetary debit/credit event against an account." } },
        { id: "Merchant", properties: { description: "Commercial vendor where transactions occur." } },
        { id: "Policy", properties: { description: "Business rules and regulatory guidelines." } },
        { id: "Recommendation", properties: { description: "Product suggestions computed by the advisor agent." } }
      ]
    };
  },

  async getOntologyProperties(): Promise<{ entities: Array<{ id: string; properties: { domain: string; range: string } }> }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ontology/properties`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.error(e);
    }
    return {
      entities: [
        { id: "OWNS", properties: { domain: "Customer", range: "Account" } },
        { id: "HAS_TRANSACTION", properties: { domain: "Account", range: "Transaction" } },
        { id: "AT", properties: { domain: "Transaction", range: "Merchant" } },
        { id: "EVALUATES_COMPLIANCE", properties: { domain: "Policy", range: "Customer" } },
        { id: "SUGGESTS", properties: { domain: "Recommendation", range: "Customer" } }
      ]
    };
  },

  async chatWithAgent(customerId: string, message: string): Promise<SemanticResponsePayload> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, message })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error("Agent chat failed. Running mock agent response.", e);
    }
    
    // Structured mock response based on prompt
    const isLoan = message.toLowerCase().includes("house") || message.toLowerCase().includes("loan");
    const isFraud = message.toLowerCase().includes("suspicious") || message.toLowerCase().includes("fraud");
    
    return {
      status: "success",
      summary: "Processed off line",
      workflow_name: isLoan ? "Home Loan Journey" : isFraud ? "Fraud Detection" : "Investment Advice",
      final_output: isLoan
        ? `Dear CustomerFirstName6,\n\nYour Home Loan application could not be approved at this time.\n\nReasons:\n- Passed: Age 29 satisfies the policy range.\n- Passed: Credit score 748 meets or exceeds required 650.\n- Rejected: Annual income INR 132,702.39 is below requirement of INR 500,000.00.\n- Rejected: Projected Debt-to-Income ratio 629.93% exceeds limit of 50%.`
        : isFraud
        ? `ALERT: A transaction of INR 60,000.00 at merchant M-999 was Blocked / Declined based on velocity flags and location mismatches.`
        : `Based on your MassAffluent segment profile, we recommend deploying INR 15,000.00 into a Diversified Mutual Fund portfolio to leverage your 'Disciplined Saver' score (73/100).`,
      explainability: {
        reasoning_chain: [
          { agent: "Planner", action: "Formulate Plan", steps: ["customer_agent", "advisor_agent", "risk_agent", "knowledge_agent", "engagement_agent"] },
          { agent: "CustomerAgent", action: "Retrieve Profile", details: "Retrieved customer demographics, spend scoring, and Digital Adoption segment." },
          { agent: "AdvisorAgent", action: "Evaluate Suitability", details: isLoan ? "Calculated Home Loan limit cap." : "Identified savings promotion fit." },
          { agent: "RiskAgent", action: "Assess Risk Profile", risk_rating: "High", status: "Compliant" },
          { agent: "KnowledgeAgent", action: "Audit Compliance", details: "Verified rules against RBI master directives." },
          { agent: "EngagementAgent", action: "Construct Outreach", details: "Drafted communication templates." }
        ],
        evidence: {
          financial_health: {
            decision: "Good",
            evidence: { financial_health_score: 73, savings_ratio_pct: 426.6, debt_ratio_pct: 313.4 }
          },
          risk_assessment: { credit_score: 748, risk_rating: "High", risk_score: 531, status: "Compliant" },
          recommendations_count: 3
        },
        policies_used: isLoan
          ? ["POL-LOAN-HOME-001: SBI Griha Pravesh Home Loan Policy", "POL-RISK-FIN-001: SBI Financial Exposure Risk Policy"]
          : isFraud
          ? ["POL-FRAUD-VEL-001: Transaction Velocity Limit Policy"]
          : ["POL-INV-SUIT-001: SBI Mutual Fund Suitability Guideline"],
        confidence_score: "96.8%",
      },
      observability: {
        execution_logs: [
          { action: "get_customer_profile", resource: "semantic_layer_tool", latency_ms: "1323.96 ms" },
          { action: "infer_customer_intelligence", resource: "intelligence_tool", latency_ms: "1521.45 ms" },
          { action: "execute_agent", resource: "customer_agent", latency_ms: "2845.77 ms" }
        ]
      }
    };
  },

  async simulateEvent(customerId: string, eventName: string, eventData: Record<string, unknown>): Promise<SemanticResponsePayload> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/events/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, eventName, eventData })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error("Event simulation failed. Using mock event mapping.", e);
    }
    
    // Mock simulation
    return {
      status: "success",
      summary: `Event ${eventName} simulated in offline mode.`,
      entities: [
        { type: "Recommendation", id: "reinvestment_fd", properties: { productId: "fixed_deposit", productName: "SBI Fixed Deposit Promo", score: 0.95 } },
        { type: "RiskUpdate", id: "risk-upd", properties: { type: "Liquidity risk update", impact: "Favorable" } }
      ],
      explainability: {
        evidence: {
          event_response: {
            customer_id: customerId,
            event: eventName,
            recommendations: [
              { productId: "fixed_deposit", productName: "SBI Fixed Deposit Promo", category: "Savings", score: 0.95, description: "FD promotion suite." }
            ],
            risk_updates: [
              { type: "Liquidity risk update", impact: "Favorable" }
            ],
            engagement_actions: [
              { channel: "PushNotification", message: "Processed offline simulation alert." }
            ],
            reasoning_steps: [
              `Received event '${eventName}' for Customer:${customerId}`,
              `Evaluated mock banking rule sets. Created recommendations and structured notifications.`
            ]
          }
        }
      }
    };
  },

  async updatePolicyRules(fileName: string, category: string, rules: Record<string, unknown>): Promise<SemanticResponsePayload> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/policies/update-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_name: fileName, category, rules })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.error("Rule update failed.", e);
    }
    return {
      status: "success",
      summary: `Updated policy rules in offline mode.`,
    };
  }
};
