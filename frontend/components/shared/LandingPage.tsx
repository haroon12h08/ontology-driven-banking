import React from "react";
import { useBankingStore } from "@/store/bankingStore";
import { ArrowRight, Bot, Compass, ShieldAlert, Zap, Network, BookOpen, Terminal, Shield } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useBankingStore();

  const capabilities = [
    {
      title: "SHARED SEMANTIC MEMORY CORE",
      desc: "Reasoning over a single global OWL ontology rather than maintaining duplicate local database models. Resolves Neo4j endpoints dynamically.",
      icon: Network
    },
    {
      title: "COORDINATED AGENT PIPELINES",
      desc: "LangGraph-driven pipelines coordinate Customer Intelligence, Financial Advisor, Risk Assessment, and Operations agents in real-time.",
      icon: Bot
    },
    {
      title: "EXPLAINABLE DECISION TREE",
      desc: "All reasoning steps are fully auditable. Reconstructs execution logic down to individual policy rules and Neo4j traversal paths.",
      icon: Compass
    },
    {
      title: "REAL-TIME COMPLIANCE GATEWAY",
      desc: "Enforces strict loan eligibility and fraud boundaries by hot-swapping YAML configuration policies without code redeployments.",
      icon: ShieldAlert
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-mono">
      {/* System Status Banner */}
      <div className="border border-[#2A2A2A] bg-[#111111] p-3 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-white inline-block"></span>
          <span className="text-[#808080]">SYSTEM PROTOCOL:</span>
          <span className="text-[#F2F2F2] font-semibold">SBI ENTERPRISE SEMANTIC PLATFORM v1.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#808080]">GRAPH STATE:</span>
          <span className="text-[#F2F2F2] border border-[#2A2A2A] bg-[#171717] px-2 py-0.5 font-bold">SYNCHRONIZED</span>
        </div>
      </div>

      {/* Main Console Section */}
      <div className="border border-[#2A2A2A] bg-[#171717] p-8 space-y-6">
        <div className="space-y-3">
          <div className="text-[10px] text-[#808080] tracking-widest font-semibold">CONSOLE // COGNITIVE CORE</div>
          <h1 className="text-3xl font-bold text-[#F2F2F2] tracking-tight">
            SBI BANKING INTELLIGENCE ENGINE
          </h1>
          <p className="text-xs text-[#B8B8B8] max-w-3xl leading-relaxed font-sans">
            This workspace orchestrates multi-agent operations, semantic reasoning, and live graph memory built for retail banking. It provides real-time visibility into agent logs, Cypher query execution, and policy constraints.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => setActiveTab("copilot")}
            className="px-4 py-2 bg-[#F2F2F2] hover:bg-[#B8B8B8] text-black font-semibold flex items-center gap-2 transition-all duration-150 rounded-sm text-xs"
          >
            LAUNCH COILOT <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className="px-4 py-2 border border-[#2A2A2A] bg-[#111111] hover:bg-[#1E1E1E] text-[#F2F2F2] transition-all duration-150 rounded-sm text-xs"
          >
            EXECUTE SCENARIOS
          </button>
        </div>
      </div>

      {/* Grid of Capabilities */}
      <div className="grid md:grid-cols-2 gap-4">
        {capabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div key={i} className="border border-[#2A2A2A] bg-[#111111] p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-[#2A2A2A] bg-[#171717]">
                  <Icon className="w-5 h-5 text-[#F2F2F2]" />
                </div>
                <h3 className="font-semibold text-xs text-[#F2F2F2] tracking-wider">{cap.title}</h3>
              </div>
              <p className="text-[#808080] text-xs leading-relaxed font-sans">{cap.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Topology Block */}
      <div className="border border-[#2A2A2A] bg-[#111111] p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-[#F2F2F2] uppercase tracking-wider">PLATFORM TOPOLOGY & MESSAGE ROUTING</h2>
          <p className="text-[#808080] text-xs font-sans">Sequence flow detailing cognitive event interception to graph database persistence.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
          {[
            { step: "01 / EVENT", info: "Intent Interception", icon: Zap },
            { step: "02 / PLANNER", info: "Route Selection", icon: Bot },
            { step: "03 / PIPELINE", info: "Agent Coordination", icon: BookOpen },
            { step: "04 / POLICY", info: "Compliance Validation", icon: Shield },
            { step: "05 / DATABASE", info: "Neo4j Persistence", icon: Network }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="p-3 border border-[#2A2A2A] bg-[#171717] flex flex-col items-center justify-center text-center gap-2">
                <Icon className="w-4 h-4 text-[#F2F2F2]" />
                <div className="text-[11px] font-bold text-[#F2F2F2]">{item.step}</div>
                <div className="text-[9px] text-[#808080] font-sans truncate w-full">{item.info}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
