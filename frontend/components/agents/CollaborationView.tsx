import React from "react";
import { useBankingStore } from "@/store/bankingStore";
import { 
  Bot, 
  User, 
  TrendingUp, 
  AlertTriangle, 
  Settings, 
  HelpCircle, 
  Mail,
  ChevronDown,
  Clock,
  ThumbsUp
} from "lucide-react";

export const CollaborationView: React.FC = () => {
  const { activeReasoningChain, activeWorkflow, activeLatencyLogs } = useBankingStore();

  const agentDetails = [
    { id: "customer_agent", name: "Customer Intelligence Agent", icon: User, desc: "Compiles demographics, behavioral profiling, and churn scoring." },
    { id: "advisor_agent", name: "Financial Advisor Agent", icon: TrendingUp, desc: "Evaluates product suitability, investment affinity, and loan eligibility." },
    { id: "risk_agent", name: "Risk Assessment Agent", icon: AlertTriangle, desc: "Calculates credit caps, verifies limits, and tracks transaction anomalies." },
    { id: "operations_agent", name: "Operations Compliance Agent", icon: Settings, desc: "Tracks account status, cards status, KYC renewals, and complaints." },
    { id: "knowledge_agent", name: "Knowledge Agent", icon: HelpCircle, desc: "Audits decisions against OWL ontology guidelines and RBI master directives." },
    { id: "engagement_agent", name: "Customer Engagement Agent", icon: Mail, desc: "Generates outreach messages and relationship manager task updates." }
  ];

  const getAgentLogs = (agentKey: string) => {
    return activeReasoningChain.filter(
      (log) => log.agent.toLowerCase().includes(agentKey.replace("_agent", ""))
    );
  };

  const getAgentLatency = (agentKey: string) => {
    const log = activeLatencyLogs.find(
      (l) => l.action === "execute_agent" && l.resource.includes(agentKey.replace("_agent", ""))
    );
    return log ? log.latency_ms : null;
  };

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto font-mono text-xs">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-[#F2F2F2] uppercase tracking-wider">AGENT COLLABORATION PIPELINE</h2>
        <p className="text-[#808080] font-sans">
          Step-by-step telemetry of the orchestrations driven by the Planner. Select a scenario in the Copilot to run.
        </p>
      </div>

      {activeWorkflow ? (
        <div className="space-y-4">
          {/* Planner Card */}
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm">
            <div className="flex items-center gap-3">
              <div className="p-1.5 border border-[#2A2A2A] bg-[#111111]">
                <Bot className="w-4 h-4 text-[#F2F2F2]" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#F2F2F2]">PLANNER & ORCHESTRATION ENGINE</h3>
                <span className="text-[9px] text-[#808080] uppercase tracking-wider font-semibold">Active Mode</span>
              </div>
              <span className="ml-auto text-[10px] px-2 py-0.5 border border-[#2A2A2A] bg-[#111111] text-[#F2F2F2] font-semibold">
                RESOLVED_INTENT: {activeWorkflow}
              </span>
            </div>
            {activeReasoningChain.length > 0 && activeReasoningChain[0].steps && (
              <div className="mt-3 flex gap-2 flex-wrap items-center pt-2 border-t border-[#2A2A2A]">
                <span className="text-[10px] text-[#808080]">EXECUTION PIPELINE QUEUE:</span>
                {(activeReasoningChain[0].steps as unknown as string[]).map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-1.5 py-0.5 border border-[#2A2A2A] bg-[#111111] text-[9px] font-semibold text-[#F2F2F2]">
                      {step.replace("_agent", "").toUpperCase()}
                    </span>
                    {idx < (activeReasoningChain[0].steps as unknown as string[]).length - 1 && (
                      <ChevronDown className="w-3 h-3 text-[#808080] transform -rotate-90" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Sequential Agent Nodes */}
          <div className="space-y-3">
            {agentDetails.map((agent) => {
              const logs = getAgentLogs(agent.id);
              const latency = getAgentLatency(agent.id);
              const isExecuted = logs.length > 0;
              const Icon = agent.icon;

              return (
                <div
                  key={agent.id}
                  className={`border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm transition-all duration-150 ${
                    isExecuted 
                      ? "opacity-100 border-white" 
                      : "opacity-40"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 border ${
                        isExecuted 
                          ? "bg-[#111111] border-[#2A2A2A] text-[#F2F2F2]" 
                          : "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#F2F2F2] uppercase">{agent.name}</h4>
                        <span className="text-[10px] text-[#808080] font-sans block">{agent.desc}</span>
                      </div>
                    </div>

                    {isExecuted && (
                      <div className="flex items-center gap-3 text-[10px] ml-11 md:ml-0 font-mono">
                        {latency && (
                          <div className="flex items-center gap-1 text-[#F2F2F2] bg-[#111111] px-2 py-0.5 border border-[#2A2A2A]">
                            <Clock className="w-3 h-3 text-[#808080]" />
                            <span>{latency}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-[#F2F2F2] bg-[#111111] px-2 py-0.5 border border-[#2A2A2A]">
                          <ThumbsUp className="w-3 h-3 text-[#808080]" />
                          <span>COMPLETED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logs & Outputs */}
                  {isExecuted && (
                    <div className="mt-3 pl-11 space-y-2 border-l border-[#2A2A2A]">
                      {logs.map((log, lIdx) => (
                        <div key={lIdx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#F2F2F2]"></span>
                            <span className="text-xs font-semibold text-[#F2F2F2]">{log.action}</span>
                          </div>
                          {log.details && (
                            <p className="text-[10px] text-[#808080] leading-relaxed font-sans">{log.details}</p>
                          )}
                          {log.summary && (
                            <p className="text-xs text-[#B8B8B8] leading-relaxed bg-[#111111] p-2 border border-[#2A2A2A] font-sans">
                              {log.summary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border border-[#2A2A2A] bg-[#171717] p-8 text-center py-20 rounded-sm space-y-2">
          <Bot className="w-8 h-8 text-[#808080] mx-auto" />
          <h3 className="font-bold text-[#F2F2F2] uppercase tracking-wider">NO ACTIVE PIPELINE TELEMETRY</h3>
          <p className="text-[#808080] text-xs max-w-sm mx-auto font-sans">
            Choose a demo scenario or chat with the copilot to view real-time multi-agent execution pathways.
          </p>
        </div>
      )}
    </div>
  );
};
