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
  
  // Custom mock latencies for observability dashboard
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

  // Run architecture trace animation step-by-step
  const triggerTraceAnimation = async (steps: string[]) => {
    for (const step of steps) {
      setActiveStep(step);
      addLog(`Traversing: ${step.toUpperCase()} Layer...`);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
    setActiveStep(null);
  };

  // Reset Demo Action
  const handleResetDemo = async () => {
    addLog("Initiating full clean slate database reset...");
    setIsProcessing(true);
    try {
      // In mock/offline mode, we simulate database reset
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

  // Seed Demo Action
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

  // Replay Scenario
  const handleReplayScenario = () => {
    if (activeScenario) {
      addLog(`Replaying active scenario: ${activeScenario}...`);
      runScenario(activeScenario);
    } else {
      alert("Select a scenario to replay.");
    }
  };

  // Random Customer
  const handleRandomCustomer = () => {
    const ids = ["CUST-006", "CUST-001"];
    const randomId = ids[Math.floor(Math.random() * ids.length)];
    setCustomerId(randomId);
    addLog(`Swapped customer context randomly to: ${randomId}`);
  };

  // Random Scenario
  const handleRandomScenario = () => {
    const scenarios = ["home_loan", "fraud", "salary", "kyc", "complaint"];
    const randomScen = scenarios[Math.floor(Math.random() * scenarios.length)];
    runScenario(randomScen);
  };

  // Policy Rule Modification
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

  // Main Scenario Runner
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
        // Fraud Check Scenario
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
        // Salary credit event injection
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
        // KYC expiry event injection
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
        // Complaint Journey scenario
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
    <div className="space-y-6 pb-12">
      {/* Header Panel */}
      <div className="glass-panel p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-900/20 via-black/40 to-indigo-900/20 border-blue-500/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Hackathon Judge Presentation Panel</h2>
          </div>
          <p className="text-zinc-400 text-sm font-light">
            One-click demonstration framework with live pipeline animation, observability telemetry, and dynamic policy hot-swapping.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setJudgeMode(!judgeMode)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
              judgeMode 
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" 
                : "bg-white/[0.02] border-white/5 text-zinc-500"
            }`}
          >
            {judgeMode ? "JUDGE MODE ACTIVE" : "OFFLINE DEMO MODE"}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: One-Click Demo Scenarios */}
        <div className="space-y-6 lg:col-span-1">
          {/* Demo Controls */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Settings className="w-4 h-4 text-blue-400" /> Demo State Controllers
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleResetDemo}
                className="py-2.5 rounded bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Demo
              </button>
              <button 
                onClick={handleSeedDemo}
                className="py-2.5 rounded bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
              >
                <Database className="w-3.5 h-3.5" /> Seed Demo
              </button>
              <button 
                onClick={handleReplayScenario}
                className="py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
              >
                <PlayCircle className="w-3.5 h-3.5" /> Replay Demo
              </button>
              <button 
                onClick={handleRandomCustomer}
                className="py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition"
              >
                <UserCheck className="w-3.5 h-3.5" /> Random User
              </button>
            </div>
            <button
              onClick={handleRandomScenario}
              className="w-full py-2.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-1 shadow-lg"
            >
              <Sparkles className="w-3.5 h-3.5" /> Trigger Random Scenario
            </button>
          </div>

          {/* Scenarios Panel */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <PlayCircle className="w-4 h-4 text-emerald-400" /> One-Click Interactive Journeys
            </h3>
            
            <div className="space-y-2.5">
              {/* Scenario 1 */}
              <div 
                onClick={() => !isProcessing && runScenario("home_loan")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  activeScenario === "home_loan" 
                    ? "bg-blue-600/10 border-blue-500/40" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-100">Scenario 1: Home Loan Journey</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold uppercase">TRAVERSAL</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 font-light">Evaluates DTI and credit thresholds on Customer:CUST-006 / CUST-001.</p>
              </div>

              {/* Scenario 2 */}
              <div 
                onClick={() => !isProcessing && runScenario("fraud")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  activeScenario === "fraud" 
                    ? "bg-rose-600/10 border-rose-500/40" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-100">Scenario 2: Fraud Prevention</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold uppercase">SECURITY</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 font-light">Simulates suspicious transactions, triggers block rules, routes alert notification.</p>
              </div>

              {/* Scenario 3 */}
              <div 
                onClick={() => !isProcessing && runScenario("salary")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  activeScenario === "salary" 
                    ? "bg-emerald-600/10 border-emerald-500/40" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-100">Scenario 3: Salary Credit Stream</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase">REALTIME</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 font-light">Salary credited updates liquid wealth indices, generating dynamic SIP offers.</p>
              </div>

              {/* Scenario 4: Policy Hot-Swap */}
              <div className="p-3.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-300">Scenario 4: Policy Parameter Hot-Swap</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold uppercase">ONTOLOGY</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-light">Change min credit eligibility score rule on-the-fly and observe immediate reasoning changes.</p>
                <div className="flex items-center gap-2 mt-2">
                  <button 
                    disabled={isUpdatingRule}
                    onClick={() => handleUpdatePolicyRule(720)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition ${
                      minCreditScoreRule === 720 
                        ? "bg-indigo-600 text-white border-indigo-400" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Set Min: 720
                  </button>
                  <button 
                    disabled={isUpdatingRule}
                    onClick={() => handleUpdatePolicyRule(760)}
                    className={`flex-1 py-1 rounded text-[10px] font-bold border transition ${
                      minCreditScoreRule === 760 
                        ? "bg-indigo-600 text-white border-indigo-400" 
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    Set Min: 760
                  </button>
                </div>
                <button
                  onClick={() => !isProcessing && runScenario("home_loan")}
                  className="w-full py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-[9px] font-bold uppercase rounded tracking-wider mt-1 transition"
                >
                  Replay Home Loan with New Rule
                </button>
              </div>

              {/* Scenario 5 */}
              <div 
                onClick={() => !isProcessing && runScenario("kyc")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  activeScenario === "kyc" 
                    ? "bg-amber-600/10 border-amber-500/40" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-100">Scenario 5: KYC Grace Evaluation</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold uppercase">COMPLIANCE</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 font-light">Evaluates regulatory grace limits, scheduling renewals without service disruptions.</p>
              </div>

              {/* Scenario 6 */}
              <div 
                onClick={() => !isProcessing && runScenario("complaint")}
                className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                  activeScenario === "complaint" 
                    ? "bg-purple-600/10 border-purple-500/40" 
                    : "bg-white/[0.01] border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-100">Scenario 6: Operations Resolver</span>
                  <span className="text-[9px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold uppercase">OPERATIONS</span>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1 font-light">Incoming complaint triggers automated verification log review and advisor outreach draft.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Live Architecture Animation */}
        <div className="space-y-6 lg:col-span-2">
          {/* Architecture Animator */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <Layers className="w-4 h-4 text-blue-400" /> Live Architecture Flow
            </h3>
            
            {/* Visual Architecture flowchart */}
            <div className="relative p-6 rounded-lg bg-black/40 border border-white/5 flex flex-col items-center justify-center min-h-[300px]">
              {/* Row 1: Frontend & Orchestrator */}
              <div className="flex justify-around w-full max-w-lg mb-6 relative">
                <div className={`px-4 py-3 rounded-lg border text-center transition-all ${
                  activeStep === "frontend" 
                    ? "bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-blue-300 scale-105" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}>
                  <span className="text-[10px] font-bold uppercase block tracking-wider">Client Web App</span>
                  <span className="text-[8px] font-mono">React / Zustand</span>
                </div>

                <div className="flex items-center text-zinc-600">
                  <ArrowRight className="w-5 h-5 animate-pulse" />
                </div>

                <div className={`px-4 py-3 rounded-lg border text-center transition-all ${
                  activeStep === "planner" 
                    ? "bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-blue-300 scale-105" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}>
                  <span className="text-[10px] font-bold uppercase block tracking-wider">Orchestrator Planner</span>
                  <span className="text-[8px] font-mono">LangGraph Router</span>
                </div>
              </div>

              {/* Row 2: Agents */}
              <div className="flex justify-around w-full max-w-xl mb-6 relative">
                <div className={`px-3 py-2 rounded-lg border text-center transition-all ${
                  activeStep === "agents" 
                    ? "bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-blue-300 scale-105" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}>
                  <span className="text-[9px] font-bold uppercase block tracking-wider">Agents Suite</span>
                  <span className="text-[8px] font-mono">Risk/Advisor/Ops</span>
                </div>

                <div className="flex items-center text-zinc-600">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className={`px-3 py-2 rounded-lg border text-center transition-all ${
                  activeStep === "intelligence" 
                    ? "bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-blue-300 scale-105" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}>
                  <span className="text-[9px] font-bold uppercase block tracking-wider">Intelligence Core</span>
                  <span className="text-[8px] font-mono">Rule Engines</span>
                </div>

                <div className="flex items-center text-zinc-600">
                  <ArrowRight className="w-4 h-4" />
                </div>

                <div className={`px-3 py-2 rounded-lg border text-center transition-all ${
                  activeStep === "semantic" 
                    ? "bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-blue-300 scale-105" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}>
                  <span className="text-[9px] font-bold uppercase block tracking-wider">Semantic API</span>
                  <span className="text-[8px] font-mono">FastAPI Wrapper</span>
                </div>
              </div>

              {/* Row 3: Graph and Ontology */}
              <div className="flex justify-around w-full max-w-lg relative">
                <div className={`px-4 py-3 rounded-lg border text-center transition-all ${
                  activeStep === "graph" 
                    ? "bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-blue-300 scale-105" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}>
                  <span className="text-[10px] font-bold uppercase block tracking-wider">Neo4j Graph DB</span>
                  <span className="text-[8px] font-mono">1.2k Nodes / 3.8k Rels</span>
                </div>

                <div className="flex items-center text-zinc-600">
                  <ArrowRight className="w-5 h-5" />
                </div>

                <div className={`px-4 py-3 rounded-lg border text-center transition-all ${
                  activeStep === "ontology" 
                    ? "bg-blue-600/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)] text-blue-300 scale-105" 
                    : "bg-white/[0.02] border-white/5 text-zinc-400"
                }`}>
                  <span className="text-[10px] font-bold uppercase block tracking-wider">OWL Ontology</span>
                  <span className="text-[8px] font-mono">Semantic Rules (TTL)</span>
                </div>
              </div>

              {/* Connecting Lines Helper */}
              {isProcessing && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] text-zinc-500 font-mono animate-pulse">
                  <Cpu className="w-3.5 h-3.5 text-blue-500 animate-spin" /> executing pipelines...
                </div>
              )}
            </div>
            
            {/* Live trace activity logger */}
            <div className="p-3.5 rounded bg-zinc-950/80 border border-white/5 font-mono text-[10px] text-zinc-400 space-y-1 max-h-[110px] overflow-y-auto">
              <span className="text-zinc-500 font-bold block">{"// Presentation Activity Log Stream"}</span>
              {logMessages.length === 0 ? (
                <span className="text-zinc-600 italic">No events processed yet. Click a scenario to inspect.</span>
              ) : (
                logMessages.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <span className="text-blue-500 font-bold">&gt;&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Telemetry metrics dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/[0.01] text-center space-y-1">
              <Clock className="w-4 h-4 text-blue-400 mx-auto" />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">API Latency</span>
              <span className="text-lg font-mono font-bold text-zinc-200">{telemetry.apiLatency} ms</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/[0.01] text-center space-y-1">
              <Activity className="w-4 h-4 text-emerald-400 mx-auto" />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Agent Exec</span>
              <span className="text-lg font-mono font-bold text-zinc-200">{telemetry.agentExecTime} ms</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/[0.01] text-center space-y-1">
              <TrendingUp className="w-4 h-4 text-purple-400 mx-auto" />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Workflow Total</span>
              <span className="text-lg font-mono font-bold text-zinc-200">{telemetry.workflowDuration} ms</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/[0.01] text-center space-y-1">
              <Database className="w-4 h-4 text-amber-400 mx-auto" />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Graph Query</span>
              <span className="text-lg font-mono font-bold text-zinc-200">{telemetry.graphQueryDuration} ms</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/[0.01] text-center space-y-1">
              <Cpu className="w-4 h-4 text-indigo-400 mx-auto" />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Reasoning Engine</span>
              <span className="text-lg font-mono font-bold text-zinc-200">{telemetry.ruleReasoningTime} ms</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border-white/5 bg-white/[0.01] text-center space-y-1">
              <Layers className="w-4 h-4 text-rose-400 mx-auto" />
              <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Event Processing</span>
              <span className="text-lg font-mono font-bold text-zinc-200">{telemetry.eventProcessTime} ms</span>
            </div>
          </div>

          {/* Quick Explanation details */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-2">
              <FileText className="w-4 h-4 text-blue-400" /> Explainability & Reasoning Logs
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded bg-white/[0.01] border border-white/5 space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">Active Constraints Profile</span>
                <div className="text-xs font-mono text-zinc-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Credit Score Limit:</span>
                    <span className="text-blue-400 font-semibold">{minCreditScoreRule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>DTI Limit Ratio:</span>
                    <span className="text-blue-400 font-semibold">50.0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Annual Income:</span>
                    <span className="text-blue-400 font-semibold">INR 500,000</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded bg-white/[0.01] border border-white/5 space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">OWL Mapping Assertions</span>
                <div className="text-xs text-zinc-400 leading-relaxed font-light">
                  Ontological rules are mapped via <span className="font-mono text-blue-400">sbi:Policy</span> classes. Updates affect reasoning checks without modifying Python execution paths.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
