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

  // Helper to map log details for this agent
  const getAgentLogs = (agentKey: string) => {
    return activeReasoningChain.filter(
      (log) => log.agent.toLowerCase().includes(agentKey.replace("_agent", ""))
    );
  };

  // Helper to find the latency of the agent node
  const getAgentLatency = (agentKey: string) => {
    const log = activeLatencyLogs.find(
      (l) => l.action === "execute_agent" && l.resource.includes(agentKey.replace("_agent", ""))
    );
    return log ? log.latency_ms : null;
  };

  return (
    <div className="space-y-8 py-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Agent Collaboration Pipeline</h2>
        <p className="text-zinc-400 text-sm">
          Visualize the step-by-step orchestrations driven by the Planner. Select a scenario or prompt in the Copilot to run the pipeline.
        </p>
      </div>

      {activeWorkflow ? (
        <div className="space-y-6">
          {/* Planner Card */}
          <div className="glass-panel p-5 rounded-xl border-blue-500/20 bg-blue-500/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Workflow Planner & Orchestrator</h3>
                <span className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">Active Scoping</span>
              </div>
              <span className="ml-auto text-xs px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold">
                Resolved: {activeWorkflow}
              </span>
            </div>
            {activeReasoningChain.length > 0 && activeReasoningChain[0].steps && (
              <div className="mt-3 flex gap-2 flex-wrap items-center">
                <span className="text-[11px] text-zinc-400">Queued agent pipeline:</span>
                {(activeReasoningChain[0].steps as unknown as string[]).map((step, idx) => (
                  <React.Fragment key={idx}>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/5 text-[10px] font-semibold text-zinc-300">
                      {step.replace("_agent", "").toUpperCase()}
                    </span>
                    {idx < (activeReasoningChain[0].steps as unknown as string[]).length - 1 && (
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-600 transform -rotate-90" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* Sequential Agent Nodes */}
          <div className="space-y-4">
            {agentDetails.map((agent) => {
              const logs = getAgentLogs(agent.id);
              const latency = getAgentLatency(agent.id);
              const isExecuted = logs.length > 0;
              const Icon = agent.icon;

              return (
                <div
                  key={agent.id}
                  className={`glass-panel p-5 rounded-xl transition-all duration-300 ${
                    isExecuted 
                      ? "border-blue-500/30 bg-blue-950/[0.01] agent-active shadow-[0_0_20px_rgba(37,99,235,0.05)]" 
                      : "opacity-40"
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg border ${
                        isExecuted 
                          ? "bg-blue-600/15 border-blue-500/40 text-blue-400" 
                          : "bg-white/[0.02] border-white/5 text-zinc-500"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{agent.name}</h4>
                        <span className="text-[10px] text-zinc-400 font-light">{agent.desc}</span>
                      </div>
                    </div>

                    {isExecuted && (
                      <div className="flex items-center gap-4 text-xs font-mono ml-11 md:ml-0">
                        {latency && (
                          <div className="flex items-center gap-1 text-blue-400 bg-blue-500/5 px-2 py-1 rounded border border-blue-500/10">
                            <Clock className="w-3 h-3" />
                            <span>{latency}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                          <ThumbsUp className="w-3 h-3" />
                          <span>Active</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Logs & Outputs */}
                  {isExecuted && (
                    <div className="mt-4 pl-12 space-y-2 border-l border-white/5">
                      {logs.map((log, lIdx) => (
                        <div key={lIdx} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            <span className="text-xs font-semibold text-zinc-200">{log.action}</span>
                          </div>
                          {log.details && (
                            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">{log.details}</p>
                          )}
                          {log.summary && (
                            <p className="text-xs text-zinc-300 font-medium leading-relaxed bg-white/[0.02] p-2.5 rounded border border-white/5">
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
        <div className="glass-panel p-8 text-center py-20 rounded-xl space-y-4">
          <Bot className="w-12 h-12 text-zinc-600 mx-auto animate-bounce" />
          <h3 className="font-bold text-white">No active pipeline</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Choose a demo scenario or chat with the copilot to see agents cooperate in real-time.
          </p>
        </div>
      )}
    </div>
  );
};
