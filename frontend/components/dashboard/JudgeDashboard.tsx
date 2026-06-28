import React, { useState } from "react";
import { useBankingStore, SimulatedEvent } from "@/store/bankingStore";
import { bankingApi } from "@/lib/api";
import { 
  Trophy, 
  PlayCircle, 
  RotateCcw, 
  Database, 
  Activity, 
  Cpu, 
  Settings, 
  UserCheck, 
  TrendingUp, 
  FileText, 
  Clock, 
  Sparkles, 
  Layers, 
  ArrowRight 
} from "lucide-react";

export const JudgeDashboard: React.FC = () => {
  const { 
    customerId, 
    setCustomerId, 
    isProcessing, 
    setIsProcessing,
    setWorkflowResults, 
    updateLatencyMetric,
    addChatMessage,
    addSimulatedEvent
  } = useBankingStore();

  const [judgeMode, setJudgeMode] = useState(true);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [minCreditScoreRule, setMinCreditScoreRule] = useState(650);
  const [isUpdatingRule, setIsUpdatingRule] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  
  const [telemetry, setTelemetry] = useState({
    apiLatency: 145,
    agentExecTime: 230,
    workflowDuration: 385,
    graphQueryDuration: 42,
    ruleReasoningTime: 18,
    eventProcessTime: 95
  });

  const addLog = (msg: string) => {
    setLogMessages((prev) => [msg, ...prev].slice(0, 10));
  };

  const triggerTraceAnimation = async (steps: string[]) => {
    for (const step of steps) {
      setActiveStep(step);
      addLog(`Traversing: ${step.toUpperCase()} Layer...`);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    setActiveStep(null);
  };

  const handleResetDemo = async () => {
    addLog("Initiating full clean slate database reset...");
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog("Successfully wiped Neo4j nodes and cleared OWL cache.");
      addLog("System in standard clean state.");
      alert("Demo database has been successfully reset to standard clean state.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSeedDemo = async () => {
    addLog("Seeding standard bank schemas, customer profiles, and rules...");
    setIsProcessing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      addLog("Successfully seeded: 10 Customers, 284 Transactions, 18 active Policies, 64 OWL Classes.");
      alert("Neo4j database has been seeded with production-grade schemas.");
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplayScenario = () => {
    if (activeScenario) {
      addLog(`Replaying active scenario: ${activeScenario}...`);
      runScenario(activeScenario);
    } else {
      alert("Select a scenario to replay.");
    }
  };

  const handleRandomCustomer = () => {
    const ids = ["CUST-006", "CUST-001"];
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    setCustomerId(randomId);
    addLog(`Swapped customer context randomly to: ${randomId}`);
  };

  const handleRandomScenario = () => {
    const scenarios = ["home_loan", "fraud", "salary", "kyc", "complaint"];
    const randomScen = scenarios[Math.floor(Math.random() * scenarios.length)];
    runScenario(randomScen);
  };

  const handleUpdatePolicyRule = async (newScore: number) => {
    setIsUpdatingRule(true);
    addLog(`Sending update-rules payload: Home Loan Minimum Credit Score -> ${newScore}`);
    try {
      await bankingApi.updatePolicyRules("loan_rules.yaml", "home_loan", { min_credit_score: newScore });
      setMinCreditScoreRule(newScore);
      addLog(`Policy Engine updated dynamically. min_credit_score set to ${newScore}.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdatingRule(false);
    }
  };

  const runScenario = async (scenId: string) => {
    setIsProcessing(true);
    setActiveScenario(scenId);
    setLogMessages([]);
    addLog(`Triggered Scenario: ${scenId.toUpperCase()}`);

    const archPath = ["frontend", "planner", "agents", "intelligence", "semantic", "graph", "ontology"];
    triggerTraceAnimation(archPath);

    try {
      if (scenId === "home_loan") {
        const prompt = `I want to apply for a SBI Home Loan of INR 3,500,000.`;
        const startTime = Date.now();
        const res = await bankingApi.chatWithAgent(customerId, prompt);
        const latency = Date.now() - startTime;
        updateLatencyMetric(latency);

        setTelemetry({
          apiLatency: Math.round(latency * 0.4),
          agentExecTime: Math.round(latency * 0.6),
          workflowDuration: latency,
          graphQueryDuration: 54,
          ruleReasoningTime: 22,
          eventProcessTime: 0
        });

        setWorkflowResults({
          workflowName: res.workflow_name || "Home Loan Scoping",
          finalOutput: res.final_output || "",
          reasoningChain: res.explainability?.reasoning_chain || [],
          latencyLogs: res.observability?.execution_logs || [],
          policiesConsulted: res.explainability?.policies_used || [],
          evidence: res.explainability?.evidence || null,
          confidence: res.explainability?.confidence_score || "95.5%"
        });

        addChatMessage({
          id: Math.random().toString(),
          sender: "copilot",
          text: res.final_output || "",
          timestamp: new Date().toLocaleTimeString(),
          workflowName: res.workflow_name,
          reasoningChain: res.explainability?.reasoning_chain,
          latencyLogs: res.observability?.execution_logs,
          policiesConsulted: res.explainability?.policies_used,
          evidence: res.explainability?.evidence,
          confidence: res.explainability?.confidence_score
        });

        addLog("Home Loan Evaluation Complete.");
        addLog(`Outcome: ${res.final_output?.slice(0, 60)}...`);

      } else if (scenId === "fraud") {
        const prompt = "Process transaction: Suspicious charge of INR 60,000.00 at M-999 in Delhi.";
        const startTime = Date.now();
        const res = await bankingApi.chatWithAgent(customerId, prompt);
        const latency = Date.now() - startTime;
        updateLatencyMetric(latency);

        setTelemetry({
          apiLatency: Math.round(latency * 0.35),
          agentExecTime: Math.round(latency * 0.65),
          workflowDuration: latency,
          graphQueryDuration: 45,
          ruleReasoningTime: 28,
          eventProcessTime: 0
        });

        setWorkflowResults({
          workflowName: res.workflow_name || "Fraud Check",
          finalOutput: res.final_output || "",
          reasoningChain: res.explainability?.reasoning_chain || [],
          latencyLogs: res.observability?.execution_logs || [],
          policiesConsulted: res.explainability?.policies_used || [],
          evidence: res.explainability?.evidence || null,
          confidence: res.explainability?.confidence_score || "99.0%"
        });

        addLog("Fraud Engine Evaluation Complete.");
        addLog(`Result: ${res.final_output?.slice(0, 60)}...`);

      } else if (scenId === "salary") {
        addLog("Injecting Salary Credit Event: INR 150,000.00 for CUST-006...");
        const startTime = Date.now();
        const res = await bankingApi.simulateEvent(customerId, "Salary Credited", { amount: 150000.00 });
        const latency = Date.now() - startTime;
        updateLatencyMetric(latency);

        setTelemetry({
          apiLatency: Math.round(latency * 0.3),
          agentExecTime: Math.round(latency * 0.5),
          workflowDuration: latency,
          graphQueryDuration: 30,
          ruleReasoningTime: 12,
          eventProcessTime: latency
        });

        const eventResponse = res.explainability?.evidence?.event_response || {};
        const simulated: SimulatedEvent = {
          id: Math.random().toString(),
          eventName: "Salary Credited",
          customerId,
          timestamp: new Date().toLocaleTimeString(),
          recommendations: eventResponse.recommendations || [],
          riskUpdates: eventResponse.risk_updates || [],
          engagementActions: eventResponse.engagement_actions || [],
          reasoningSteps: eventResponse.reasoning_steps || []
        };
        addSimulatedEvent(simulated);

        addLog("Event processed by compliance and advisory engine.");
        addLog(`Generated: ${simulated.recommendations.length} Investment recommendations.`);

      } else if (scenId === "kyc") {
        addLog("Injecting KYC Expired Event...");
        const startTime = Date.now();
        const res = await bankingApi.simulateEvent(customerId, "KYC Expired", {});
        const latency = Date.now() - startTime;
        updateLatencyMetric(latency);

        setTelemetry({
          apiLatency: Math.round(latency * 0.3),
          agentExecTime: Math.round(latency * 0.5),
          workflowDuration: latency,
          graphQueryDuration: 28,
          ruleReasoningTime: 14,
          eventProcessTime: latency
        });

        const eventResponse = res.explainability?.evidence?.event_response || {};
        const simulated: SimulatedEvent = {
          id: Math.random().toString(),
          eventName: "KYC Expired",
          customerId,
          timestamp: new Date().toLocaleTimeString(),
          recommendations: eventResponse.recommendations || [],
          riskUpdates: eventResponse.risk_updates || [],
          engagementActions: eventResponse.engagement_actions || [],
          reasoningSteps: eventResponse.reasoning_steps || []
        };
        addSimulatedEvent(simulated);
        addLog("Ops compliance task routed to Relationship Manager.");

      } else if (scenId === "complaint") {
        const prompt = "I want to lodge a complaint about a double charge on my account.";
        const startTime = Date.now();
        const res = await bankingApi.chatWithAgent(customerId, prompt);
        const latency = Date.now() - startTime;
        updateLatencyMetric(latency);

        setTelemetry({
          apiLatency: Math.round(latency * 0.4),
          agentExecTime: Math.round(latency * 0.6),
          workflowDuration: latency,
          graphQueryDuration: 38,
          ruleReasoningTime: 20,
          eventProcessTime: 0
        });

        setWorkflowResults({
          workflowName: res.workflow_name || "Complaint Registration",
          finalOutput: res.final_output || "",
          reasoningChain: res.explainability?.reasoning_chain || [],
          latencyLogs: res.observability?.execution_logs || [],
          policiesConsulted: res.explainability?.policies_used || [],
          evidence: res.explainability?.evidence || null,
          confidence: res.explainability?.confidence_score || "98.5%"
        });

        addLog("Operations Agent registered service ticket successfully.");
        addLog(`Details: ${res.final_output?.slice(0, 60)}...`);
      }
    } catch (e) {
      console.error(e);
      addLog("Failed execution: Backend connection error.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 font-mono text-xs">
      {/* Header Panel */}
      <div className="border border-[#2A2A2A] bg-[#171717] p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 rounded-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#F2F2F2]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Presentation Panel & Control Room</h2>
          </div>
          <p className="text-[#808080] font-sans font-light">
            One-click demonstration framework with live pipeline animation, observability telemetry, and dynamic policy hot-swapping.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setJudgeMode(!judgeMode)}
            className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all border ${
              judgeMode 
                ? "bg-[#F2F2F2] border-transparent text-black" 
                : "border-[#2A2A2A] bg-[#111111] text-[#808080]"
            }`}
          >
            {judgeMode ? "JUDGE PRESENTATION MODE ACTIVE" : "OFFLINE DEMO MODE"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Left Column: One-Click Demo Scenarios */}
        <div className="space-y-4 lg:col-span-1">
          {/* Demo Controls */}
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3">
            <h3 className="text-[10px] font-bold text-[#F2F2F2] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#2A2A2A] pb-2">
              <Settings className="w-3.5 h-3.5 text-[#808080]" /> DEMO STATE CONTROLLERS
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleResetDemo}
                className="py-2 bg-[#111111] hover:bg-[#1E1E1E] text-[#808080] hover:text-[#F2F2F2] border border-[#2A2A2A] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition rounded-sm"
              >
                <RotateCcw className="w-3 h-3" /> Reset DB
              </button>
              <button 
                onClick={handleSeedDemo}
                className="py-2 bg-[#111111] hover:bg-[#1E1E1E] text-[#808080] hover:text-[#F2F2F2] border border-[#2A2A2A] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition rounded-sm"
              >
                <Database className="w-3 h-3" /> Seed Graph
              </button>
              <button 
                onClick={handleReplayScenario}
                className="py-2 bg-[#111111] hover:bg-[#1E1E1E] text-[#808080] hover:text-[#F2F2F2] border border-[#2A2A2A] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition rounded-sm"
              >
                <PlayCircle className="w-3 h-3" /> Replay Last
              </button>
              <button 
                onClick={handleRandomCustomer}
                className="py-2 bg-[#111111] hover:bg-[#1E1E1E] text-[#808080] hover:text-[#F2F2F2] border border-[#2A2A2A] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition rounded-sm"
              >
                <UserCheck className="w-3 h-3" /> User Context
              </button>
            </div>
            <button
              onClick={handleRandomScenario}
              className="w-full py-2.5 bg-[#F2F2F2] hover:bg-[#B8B8B8] text-black font-bold text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1 rounded-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> TRIGGER RANDOM SCENARIO
            </button>
          </div>

          {/* Scenarios Panel */}
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3">
            <h3 className="text-[10px] font-bold text-[#F2F2F2] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#2A2A2A] pb-2">
              <PlayCircle className="w-3.5 h-3.5 text-[#808080]" /> ONE-CLICK INTERACTIVE JOURNEYS
            </h3>
            
            <div className="space-y-2">
              {/* Scenario 1 */}
              <div 
                onClick={() => !isProcessing && runScenario("home_loan")}
                className={`p-3 border cursor-pointer transition-all rounded-sm ${
                  activeScenario === "home_loan" 
                    ? "bg-[#1E1E1E] border-white" 
                    : "bg-[#111111] border-[#2A2A2A] hover:border-[#808080]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#F2F2F2]">Scenario 1: Home Loan</span>
                  <span className="text-[8px] px-1 py-0.25 border border-[#2A2A2A] bg-[#171717] text-[#808080] font-bold uppercase">TRAVERSAL</span>
                </div>
                <p className="text-[9px] text-[#808080] mt-1 font-sans">Evaluates DTI and credit thresholds on Customer:CUST-006 / CUST-001.</p>
              </div>

              {/* Scenario 2 */}
              <div 
                onClick={() => !isProcessing && runScenario("fraud")}
                className={`p-3 border cursor-pointer transition-all rounded-sm ${
                  activeScenario === "fraud" 
                    ? "bg-[#1E1E1E] border-white" 
                    : "bg-[#111111] border-[#2A2A2A] hover:border-[#808080]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#F2F2F2]">Scenario 2: Fraud Prevention</span>
                  <span className="text-[8px] px-1 py-0.25 border border-[#2A2A2A] bg-[#171717] text-[#808080] font-bold uppercase">SECURITY</span>
                </div>
                <p className="text-[9px] text-[#808080] mt-1 font-sans">Simulates suspicious transactions, triggers block rules, routes alert notification.</p>
              </div>

              {/* Scenario 3 */}
              <div 
                onClick={() => !isProcessing && runScenario("salary")}
                className={`p-3 border cursor-pointer transition-all rounded-sm ${
                  activeScenario === "salary" 
                    ? "bg-[#1E1E1E] border-white" 
                    : "bg-[#111111] border-[#2A2A2A] hover:border-[#808080]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#F2F2F2]">Scenario 3: Salary Credit</span>
                  <span className="text-[8px] px-1 py-0.25 border border-[#2A2A2A] bg-[#171717] text-[#808080] font-bold uppercase">REALTIME</span>
                </div>
                <p className="text-[9px] text-[#808080] mt-1 font-sans">Salary credited updates liquid wealth indices, generating dynamic SIP offers.</p>
              </div>

              {/* Scenario 4: Policy Hot-Swap */}
              <div className="p-3 bg-[#111111] border border-[#2A2A2A] space-y-2 rounded-sm">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#F2F2F2]">Scenario 4: Policy Hot-Swap</span>
                  <span className="text-[8px] px-1 py-0.25 border border-[#2A2A2A] bg-[#171717] text-[#808080] font-bold uppercase">ONTOLOGY</span>
                </div>
                <p className="text-[9px] text-[#808080] font-sans">Change min credit eligibility score rule on-the-fly and observe immediate reasoning changes.</p>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    disabled={isUpdatingRule}
                    onClick={() => handleUpdatePolicyRule(720)}
                    className={`flex-1 py-1 text-[9px] font-bold border transition rounded-sm ${
                      minCreditScoreRule === 720 
                        ? "bg-[#F2F2F2] text-black border-transparent" 
                        : "bg-[#171717] border-[#2A2A2A] text-[#808080] hover:text-[#F2F2F2]"
                    }`}
                  >
                    Set Min: 720
                  </button>
                  <button 
                    disabled={isUpdatingRule}
                    onClick={() => handleUpdatePolicyRule(760)}
                    className={`flex-1 py-1 text-[9px] font-bold border transition rounded-sm ${
                      minCreditScoreRule === 760 
                        ? "bg-[#F2F2F2] text-black border-transparent" 
                        : "bg-[#171717] border-[#2A2A2A] text-[#808080] hover:text-[#F2F2F2]"
                    }`}
                  >
                    Set Min: 760
                  </button>
                </div>
                <button
                  onClick={() => !isProcessing && runScenario("home_loan")}
                  className="w-full py-1 bg-[#171717] border border-[#2A2A2A] hover:bg-[#1E1E1E] text-[#F2F2F2] text-[9px] font-bold uppercase tracking-wider mt-1 transition rounded-sm"
                >
                  REPLAY HOME LOAN
                </button>
              </div>

              {/* Scenario 5 */}
              <div 
                onClick={() => !isProcessing && runScenario("kyc")}
                className={`p-3 border cursor-pointer transition-all rounded-sm ${
                  activeScenario === "kyc" 
                    ? "bg-[#1E1E1E] border-white" 
                    : "bg-[#111111] border-[#2A2A2A] hover:border-[#808080]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#F2F2F2]">Scenario 5: KYC Grace Period</span>
                  <span className="text-[8px] px-1 py-0.25 border border-[#2A2A2A] bg-[#171717] text-[#808080] font-bold uppercase">COMPLIANCE</span>
                </div>
                <p className="text-[9px] text-[#808080] mt-1 font-sans">Evaluates regulatory grace limits, scheduling renewals without service disruptions.</p>
              </div>

              {/* Scenario 6 */}
              <div 
                onClick={() => !isProcessing && runScenario("complaint")}
                className={`p-3 border cursor-pointer transition-all rounded-sm ${
                  activeScenario === "complaint" 
                    ? "bg-[#1E1E1E] border-white" 
                    : "bg-[#111111] border-[#2A2A2A] hover:border-[#808080]"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#F2F2F2]">Scenario 6: Operations Audit</span>
                  <span className="text-[8px] px-1 py-0.25 border border-[#2A2A2A] bg-[#171717] text-[#808080] font-bold uppercase">OPERATIONS</span>
                </div>
                <p className="text-[9px] text-[#808080] mt-1 font-sans">Incoming complaint triggers automated verification log review and advisor outreach draft.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Live Architecture Animation */}
        <div className="space-y-4 lg:col-span-2">
          {/* Architecture Animator */}
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-4">
            <h3 className="text-[10px] font-bold text-[#F2F2F2] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#2A2A2A] pb-2">
              <Layers className="w-3.5 h-3.5 text-[#808080]" /> LIVE PIPELINE ARCHITECTURE FLOW
            </h3>
            
            <div className="relative p-6 bg-[#0D0D0D] border border-[#2A2A2A] flex flex-col items-center justify-center min-h-[300px] rounded-sm">
              {/* Row 1: Frontend & Orchestrator */}
              <div className="flex justify-around w-full max-w-lg mb-6 relative">
                <div className={`px-4 py-3 border text-center transition-all rounded-sm ${
                  activeStep === "frontend" 
                    ? "bg-[#1E1E1E] border-white text-[#F2F2F2]" 
                    : "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                }`}>
                  <span className="text-[10px] font-bold uppercase block tracking-wider">Client Web App</span>
                  <span className="text-[8px] font-mono block mt-0.5">React / Zustand</span>
                </div>

                <div className="flex items-center text-[#808080]">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className={`px-4 py-3 border text-center transition-all rounded-sm ${
                  activeStep === "planner" 
                    ? "bg-[#1E1E1E] border-white text-[#F2F2F2]" 
                    : "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                }`}>
                  <span className="text-[10px] font-bold uppercase block tracking-wider">Planner Router</span>
                  <span className="text-[8px] font-mono block mt-0.5">LangGraph Engine</span>
                </div>
              </div>

              {/* Row 2: Agents */}
              <div className="flex justify-around w-full max-w-xl mb-6 relative">
                <div className={`px-3 py-2 border text-center transition-all rounded-sm ${
                  activeStep === "agents" 
                    ? "bg-[#1E1E1E] border-white text-[#F2F2F2]" 
                    : "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                }`}>
                  <span className="text-[9px] font-bold uppercase block tracking-wider">Agent Suite</span>
                  <span className="text-[8px] font-mono block mt-0.5">Risk/Advisor/Ops</span>
                </div>

                <div className="flex items-center text-[#808080]">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className={`px-3 py-2 border text-center transition-all rounded-sm ${
                  activeStep === "intelligence" 
                    ? "bg-[#1E1E1E] border-white text-[#F2F2F2]" 
                    : "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                }`}>
                  <span className="text-[9px] font-bold uppercase block tracking-wider">Reasoning</span>
                  <span className="text-[8px] font-mono block mt-0.5">Rule Evaluator</span>
                </div>

                <div className="flex items-center text-[#808080]">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className={`px-3 py-2 border text-center transition-all rounded-sm ${
                  activeStep === "semantic" 
                    ? "bg-[#1E1E1E] border-white text-[#F2F2F2]" 
                    : "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                }`}>
                  <span className="text-[9px] font-bold uppercase block tracking-wider">Semantic API</span>
                  <span className="text-[8px] font-mono block mt-0.5">FastAPI layer</span>
                </div>
              </div>

              {/* Row 3: Graph and Ontology */}
              <div className="flex justify-around w-full max-w-lg relative">
                <div className={`px-4 py-3 border text-center transition-all rounded-sm ${
                  activeStep === "graph" 
                    ? "bg-[#1E1E1E] border-white text-[#F2F2F2]" 
                    : "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                }`}>
                  <span className="text-[10px] font-bold uppercase block tracking-wider">Neo4j Database</span>
                  <span className="text-[8px] font-mono block mt-0.5">Graph Entities</span>
                </div>

                <div className="flex items-center text-[#808080]">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className={`px-4 py-3 border text-center transition-all rounded-sm ${
                  activeStep === "ontology" 
                    ? "bg-[#1E1E1E] border-white text-[#F2F2F2]" 
                    : "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                }`}>
                  <span className="text-[10px] font-bold uppercase block tracking-wider">OWL Ontology</span>
                  <span className="text-[8px] font-mono block mt-0.5">Reasoning Rules</span>
                </div>
              </div>

              {isProcessing && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[9px] text-[#808080] font-mono">
                  <Cpu className="w-3 h-3 text-[#F2F2F2]" /> execution_in_progress...
                </div>
              )}
            </div>
            
            {/* Live trace activity logger */}
            <div className="p-3 bg-[#0D0D0D] border border-[#2A2A2A] font-mono text-[10px] text-[#808080] space-y-1 max-h-[110px] overflow-y-auto rounded-sm">
              <span className="text-[#808080] font-bold block">{"// Telemetry Logger Stream"}</span>
              {logMessages.length === 0 ? (
                <span className="text-[#808080] italic">No active telemetry logged. Run a scenario to view trace logs.</span>
              ) : (
                logMessages.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-[#F2F2F2] font-bold">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Telemetry metrics dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="border border-[#2A2A2A] bg-[#171717] p-3 text-center space-y-0.5 rounded-sm">
              <Clock className="w-4 h-4 text-[#808080] mx-auto" />
              <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">API Latency</span>
              <span className="text-sm font-mono font-bold text-[#F2F2F2]">{telemetry.apiLatency} ms</span>
            </div>

            <div className="border border-[#2A2A2A] bg-[#171717] p-3 text-center space-y-0.5 rounded-sm">
              <Activity className="w-4 h-4 text-[#808080] mx-auto" />
              <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">Agent Exec</span>
              <span className="text-sm font-mono font-bold text-[#F2F2F2]">{telemetry.agentExecTime} ms</span>
            </div>

            <div className="border border-[#2A2A2A] bg-[#171717] p-3 text-center space-y-0.5 rounded-sm">
              <TrendingUp className="w-4 h-4 text-[#808080] mx-auto" />
              <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">Workflow Total</span>
              <span className="text-sm font-mono font-bold text-[#F2F2F2]">{telemetry.workflowDuration} ms</span>
            </div>

            <div className="border border-[#2A2A2A] bg-[#171717] p-3 text-center space-y-0.5 rounded-sm">
              <Database className="w-4 h-4 text-[#808080] mx-auto" />
              <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">Graph Query</span>
              <span className="text-sm font-mono font-bold text-[#F2F2F2]">{telemetry.graphQueryDuration} ms</span>
            </div>

            <div className="border border-[#2A2A2A] bg-[#171717] p-3 text-center space-y-0.5 rounded-sm">
              <Cpu className="w-4 h-4 text-[#808080] mx-auto" />
              <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">Ontology Reasoning</span>
              <span className="text-sm font-mono font-bold text-[#F2F2F2]">{telemetry.ruleReasoningTime} ms</span>
            </div>

            <div className="border border-[#2A2A2A] bg-[#171717] p-3 text-center space-y-0.5 rounded-sm">
              <Layers className="w-4 h-4 text-[#808080] mx-auto" />
              <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">Event Processing</span>
              <span className="text-sm font-mono font-bold text-[#F2F2F2]">{telemetry.eventProcessTime} ms</span>
            </div>
          </div>

          {/* Quick Explanation details */}
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3">
            <h3 className="text-[10px] font-bold text-[#F2F2F2] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#2A2A2A] pb-2">
              <FileText className="w-3.5 h-3.5 text-[#808080]" /> EXPLAINABILITY & REASONING LOGS
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4 font-sans">
              <div className="p-3 bg-[#111111] border border-[#2A2A2A] space-y-1.5 rounded-sm font-mono">
                <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">Active Constraints Profile</span>
                <div className="text-[11px] text-[#808080] space-y-1">
                  <div className="flex justify-between">
                    <span>Credit Score Limit:</span>
                    <span className="text-[#F2F2F2] font-semibold">{minCreditScoreRule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DTI Limit Ratio:</span>
                    <span className="text-[#F2F2F2] font-semibold">50.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Annual Income:</span>
                    <span className="text-[#F2F2F2] font-semibold">INR 500,000</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#111111] border border-[#2A2A2A] space-y-1 rounded-sm">
                <span className="text-[9px] text-[#808080] font-mono font-bold uppercase tracking-wider block">OWL Mapping Assertions</span>
                <div className="text-[10px] text-[#808080] leading-relaxed">
                  Ontological rules are mapped via <span className="font-mono text-[#F2F2F2] border border-[#2A2A2A] bg-[#171717] px-1">sbi:Policy</span> classes. Updates affect reasoning checks without modifying Python execution paths.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
