import React from "react";
import { useBankingStore } from "@/store/bankingStore";
import { bankingApi } from "@/lib/api";
import { PlayCircle, ShieldCheck, BadgeAlert, Coins, RefreshCw, Key, CreditCard } from "lucide-react";

export const ScenarioManager: React.FC = () => {
  const { 
    customerId, 
    setIsProcessing, 
    setWorkflowResults, 
    updateLatencyMetric, 
    setActiveTab,
    addChatMessage
  } = useBankingStore();

  const scenarios = [
    {
      id: "home_loan",
      title: "Home Loan Application",
      desc: "Evaluates debt-to-income limits and credit score ranges against RBI regulatory rules.",
      prompt: "I want to apply for a SBI Home Loan of INR 3,500,000.",
      icon: Coins,
      color: "text-blue-400"
    },
    {
      id: "fraud_assessment",
      title: "Suspicious Transaction Check",
      desc: "Assesses velocity logs, device parameters, and merchant ratings for fraud risk.",
      prompt: "Process transaction: Suspicious charge of INR 60,000.00 at M-999 in Delhi.",
      icon: BadgeAlert,
      color: "text-rose-400"
    },
    {
      id: "credit_card_upgrade",
      title: "Credit Card Upgrade Suitability",
      desc: "Analyzes financial wellness, segment profile, and savings affinity rules for premium upgrades.",
      prompt: "I want to upgrade my credit card to SBI Elite.",
      icon: CreditCard,
      color: "text-indigo-400"
    },
    {
      id: "kyc_renewal",
      title: "KYC Expiration Grace Check",
      desc: "Evaluates compliance flags, sets grace periods, and outlines required KYC update channels.",
      prompt: "Check my KYC status and outline renewal options.",
      icon: Key,
      color: "text-amber-400"
    },
    {
      id: "loan_refinancing",
      title: "Loan Refinancing Program",
      desc: "Assesses financial health indices and suggests debt refinancing schedules.",
      prompt: "Check if I am eligible for the SBI Loan Refinancing Plan.",
      icon: RefreshCw,
      color: "text-emerald-400"
    },
    {
      id: "mutual_fund_investment",
      title: "Investment Portfolio Advisory",
      desc: "Matches wealth management affinity and budget availability against suitabilities.",
      prompt: "I want to find the best mutual fund investment portfolio.",
      icon: ShieldCheck,
      color: "text-purple-400"
    }
  ];

  const handleRunScenario = async (prompt: string) => {
    setIsProcessing(true);
    setActiveTab("copilot");
    
    // Clear and add start message
    addChatMessage({
      id: Math.random().toString(),
      sender: "user",
      text: prompt,
      timestamp: new Date().toLocaleTimeString()
    });

    try {
      const startTime = Date.now();
      const res = await bankingApi.chatWithAgent(customerId, prompt);
      const totalLatency = Date.now() - startTime;
      updateLatencyMetric(totalLatency);

      setWorkflowResults({
        workflowName: res.workflow_name || "Scenario Flow",
        finalOutput: res.final_output || "Workflow execution finished.",
        reasoningChain: res.explainability?.reasoning_chain || [],
        latencyLogs: res.observability?.execution_logs || [],
        policiesConsulted: res.explainability?.policies_used || [],
        evidence: res.explainability?.evidence || null,
        confidence: res.explainability?.confidence_score || "100.0%"
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
    } catch (e) {
      console.error(e);
      addChatMessage({
        id: Math.random().toString(),
        sender: "system",
        text: "Error executing scenario: FastAPI backend or Neo4j server is unreachable.",
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 py-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Scenario Demonstrator</h2>
        <p className="text-zinc-400 text-sm">
          Run standard end-to-end banking workflows to evaluate coordinated agent actions, ontology constraints, and live decision explainability.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scenarios.map((scen) => {
          const Icon = scen.icon;
          return (
            <div key={scen.id} className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:border-white/15 transition-all duration-300">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <Icon className={`w-5 h-5 ${scen.color}`} />
                  </div>
                  <h3 className="font-bold text-sm text-white">{scen.title}</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">{scen.desc}</p>
                <div className="p-2 rounded bg-black/30 border border-white/5">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase block">Mock Prompt</span>
                  <span className="text-[10px] text-zinc-300 font-mono italic">&quot;{scen.prompt}&quot;</span>
                </div>
              </div>

              <button
                onClick={() => handleRunScenario(scen.prompt)}
                className="w-full mt-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition duration-200"
              >
                <PlayCircle className="w-4 h-4" /> Run Scenario
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
