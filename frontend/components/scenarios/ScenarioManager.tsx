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
      icon: Coins
    },
    {
      id: "fraud_assessment",
      title: "Suspicious Transaction Check",
      desc: "Assesses velocity logs, device parameters, and merchant ratings for fraud risk.",
      prompt: "Process transaction: Suspicious charge of INR 60,000.00 at M-999 in Delhi.",
      icon: BadgeAlert
    },
    {
      id: "credit_card_upgrade",
      title: "Credit Card Suitability",
      desc: "Analyzes financial wellness, segment profile, and savings affinity rules for premium upgrades.",
      prompt: "I want to upgrade my credit card to SBI Elite.",
      icon: CreditCard
    },
    {
      id: "kyc_renewal",
      title: "KYC Expiration Grace Check",
      desc: "Evaluates compliance flags, sets grace periods, and outlines required KYC update channels.",
      prompt: "Check my KYC status and outline renewal options.",
      icon: Key
    },
    {
      id: "loan_refinancing",
      title: "Loan Refinancing Program",
      desc: "Assesses financial health indices and suggests debt refinancing schedules.",
      prompt: "Check if I am eligible for the SBI Loan Refinancing Plan.",
      icon: RefreshCw
    },
    {
      id: "mutual_fund_investment",
      title: "Investment Portfolio Advisory",
      desc: "Matches wealth management affinity and budget availability against suitabilities.",
      prompt: "I want to find the best mutual fund investment portfolio.",
      icon: ShieldCheck
    }
  ];

  const handleRunScenario = async (prompt: string) => {
    setIsProcessing(true);
    setActiveTab("copilot");
    
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
    <div className="space-y-6 py-4 max-w-5xl mx-auto font-mono text-xs">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-[#F2F2F2] uppercase tracking-wider">SCENARIO DEMONSTRATOR CONSOLE</h2>
        <p className="text-[#808080] font-sans">
          Execute standard retail banking workflows to evaluate coordinated agent actions, OWL ontology constraints, and live decision audits.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scen) => {
          const Icon = scen.icon;
          return (
            <div key={scen.id} className="border border-[#2A2A2A] bg-[#171717] p-4 flex flex-col justify-between rounded-sm">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 border border-[#2A2A2A] bg-[#111111]">
                    <Icon className="w-4 h-4 text-[#F2F2F2]" />
                  </div>
                  <h3 className="font-bold text-xs text-[#F2F2F2] uppercase tracking-wide">{scen.title}</h3>
                </div>
                <p className="text-[11px] text-[#808080] leading-relaxed font-sans">{scen.desc}</p>
                <div className="p-2 bg-[#111111] border border-[#2A2A2A]">
                  <span className="text-[9px] text-[#808080] font-bold uppercase block">MOCK_INPUT_QUERY</span>
                  <span className="text-[10px] text-[#B8B8B8] font-mono italic block mt-0.5">&quot;{scen.prompt}&quot;</span>
                </div>
              </div>

              <button
                onClick={() => handleRunScenario(scen.prompt)}
                className="w-full mt-4 py-2 bg-[#F2F2F2] hover:bg-[#B8B8B8] text-xs font-semibold text-black flex items-center justify-center gap-1.5 transition duration-150 rounded-sm"
              >
                <PlayCircle className="w-4 h-4" /> EXECUTE SCENARIO
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
