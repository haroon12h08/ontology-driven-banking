import { create } from "zustand";

export interface AgentLog {
  agent: string;
  action: string;
  details?: string;
  summary?: string;
  confidence?: number;
  risk_rating?: string;
  status?: string;
  compliance?: string;
  violations_count?: number;
  channel?: string;
  steps?: string[];
}

export interface LatencyLog {
  action: string;
  resource: string;
  latency_ms: string;
}

export interface CustomerProfileData {
  customerId: string;
  firstName: string;
  lastName: string;
  creditScore: number;
  segment: string;
  spendingPattern: string;
  churnRisk: string;
  digitalAdoption: string;
  age: number;
  occupation: string;
  riskRating: string;
  riskScore: number;
}

export interface AccountData {
  accountId: string;
  accountNumber: string;
  balance: number;
  availableBalance: number;
  status: string;
  label: string;
}

export interface RecommendationData {
  productId: string;
  productName: string;
  category: string;
  score: number;
  description: string;
}

export interface RiskUpdateData {
  type: string;
  impact: string;
}

export interface EngagementActionData {
  channel: string;
  message: string;
}

export interface EvidenceData {
  financial_health?: {
    decision: string;
    evidence?: {
      financial_health_score?: number;
      savings_ratio_pct?: number;
      debt_ratio_pct?: number;
    };
    reasoning_steps?: string[];
  };
  risk_assessment?: {
    credit_score?: number;
    risk_rating: string;
    risk_score: number;
    status: string;
  };
  recommendations_count?: number;
  event_response?: {
    customer_id?: string;
    event?: string;
    recommendations?: RecommendationData[];
    risk_updates?: RiskUpdateData[];
    engagement_actions?: EngagementActionData[];
    reasoning_steps?: string[];
  };
}

export interface ChatMessage {
  id: string;
  sender: "user" | "copilot" | "system";
  text: string;
  timestamp: string;
  workflowName?: string;
  reasoningChain?: AgentLog[];
  latencyLogs?: LatencyLog[];
  policiesConsulted?: string[];
  evidence?: EvidenceData | null;
  confidence?: string;
}

export interface SimulatedEvent {
  id: string;
  eventName: string;
  customerId: string;
  timestamp: string;
  recommendations: RecommendationData[];
  riskUpdates: RiskUpdateData[];
  engagementActions: EngagementActionData[];
  reasoningSteps: string[];
}

interface BankingState {
  // Navigation
  activeTab: "landing" | "copilot" | "agents" | "graph" | "reasoning" | "ontology" | "scenarios" | "events" | "customer" | "dashboard" | "judge";
  
  // Data State
  customerId: string;
  customerProfile: CustomerProfileData | null;
  accounts: AccountData[];
  chatHistory: ChatMessage[];
  simulatedEvents: SimulatedEvent[];
  isProcessing: boolean;
  activeWorkflow: string | null;
  activeReasoningChain: AgentLog[];
  activeLatencyLogs: LatencyLog[];
  activePolicies: string[];
  activeEvidence: EvidenceData | null;
  activeConfidence: string | null;
  activeFinalOutput: string | null;
  judgeModeEnabled: boolean;
  
  // Stats
  metrics: {
    totalCustomers: number;
    totalTransactions: number;
    totalGraphNodes: number;
    totalRelationships: number;
    totalPolicies: number;
    totalOntologyClasses: number;
    averageLatencyMs: number;
    totalAgentCalls: number;
  };

  // Actions
  setActiveTab: (tab: BankingState["activeTab"]) => void;
  setCustomerId: (id: string) => void;
  setCustomerProfile: (profile: CustomerProfileData | null) => void;
  setAccounts: (accounts: AccountData[]) => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  addSimulatedEvent: (evt: SimulatedEvent) => void;
  setIsProcessing: (val: boolean) => void;
  setWorkflowResults: (data: {
    workflowName: string;
    finalOutput: string;
    reasoningChain: AgentLog[];
    latencyLogs: LatencyLog[];
    policiesConsulted: string[];
    evidence: EvidenceData | null;
    confidence: string;
  }) => void;
  incrementAgentCalls: (count: number) => void;
  updateLatencyMetric: (latency: number) => void;
  setJudgeModeEnabled: (val: boolean) => void;
}

export const useBankingStore = create<BankingState>((set) => ({
  activeTab: "landing",
  customerId: "CUST-006",
  customerProfile: null,
  accounts: [],
  chatHistory: [
    {
      id: "welcome",
      sender: "copilot",
      text: "Welcome to SBI Enterprise AI Banking Copilot. Select a quick scenario or prompt me to analyze credit, assess fraud risks, or inspect financial health.",
      timestamp: new Date().toLocaleTimeString(),
    }
  ],
  simulatedEvents: [],
  isProcessing: false,
  activeWorkflow: null,
  activeReasoningChain: [],
  activeLatencyLogs: [],
  activePolicies: [],
  activeEvidence: null,
  activeConfidence: null,
  activeFinalOutput: null,
  judgeModeEnabled: false,
  metrics: {
    totalCustomers: 10,
    totalTransactions: 284,
    totalGraphNodes: 1240,
    totalRelationships: 3840,
    totalPolicies: 18,
    totalOntologyClasses: 64,
    averageLatencyMs: 254.2,
    totalAgentCalls: 45,
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setJudgeModeEnabled: (val) => set({ judgeModeEnabled: val }),
  setCustomerId: (id) => set({ customerId: id }),
  setCustomerProfile: (profile) => set({ customerProfile: profile }),
  setAccounts: (accounts) => set({ accounts }),
  addChatMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
  clearChat: () => set({ chatHistory: [] }),
  addSimulatedEvent: (evt) => set((state) => ({ 
    simulatedEvents: [evt, ...state.simulatedEvents],
    metrics: {
      ...state.metrics,
      totalAgentCalls: state.metrics.totalAgentCalls + 1
    }
  })),
  setIsProcessing: (val) => set({ isProcessing: val }),
  setWorkflowResults: (data) => set((state) => ({
    activeWorkflow: data.workflowName,
    activeFinalOutput: data.finalOutput,
    activeReasoningChain: data.reasoningChain,
    activeLatencyLogs: data.latencyLogs,
    activePolicies: data.policiesConsulted,
    activeEvidence: data.evidence,
    activeConfidence: data.confidence,
    metrics: {
      ...state.metrics,
      totalAgentCalls: state.metrics.totalAgentCalls + data.reasoningChain.length
    }
  })),
  incrementAgentCalls: (count) => set((state) => ({
    metrics: { ...state.metrics, totalAgentCalls: state.metrics.totalAgentCalls + count }
  })),
  updateLatencyMetric: (latency) => set((state) => ({
    metrics: {
      ...state.metrics,
      averageLatencyMs: Number(((state.metrics.averageLatencyMs * 9 + latency) / 10).toFixed(1))
    }
  })),
}));
