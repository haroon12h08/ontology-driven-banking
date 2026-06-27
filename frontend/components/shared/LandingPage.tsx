import React from "react";
import { useBankingStore } from "@/store/bankingStore";
import { ArrowRight, Bot, Compass, ShieldAlert, Zap, Network, BookOpen } from "lucide-react";

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useBankingStore();

  const capabilities = [
    {
      title: "Shared Semantic Memory",
      desc: "All agents reason over a single global OWL ontology rather than maintaining duplicate local data layers.",
      icon: Network,
      color: "text-blue-400"
    },
    {
      title: "Coordinated Agent Pipelines",
      desc: "LangGraph-driven pipelines coordinate Customer, Advisor, Risk, Operations, Knowledge, and Engagement agents.",
      icon: Bot,
      color: "text-indigo-400"
    },
    {
      title: "Explainable Decisions",
      desc: "Recommendations are fully auditable down to individual data parameters and Neo4j traversal paths.",
      icon: Compass,
      color: "text-purple-400"
    },
    {
      title: "Policy Enforcement Engine",
      desc: "Real-time compliance checks validate Loan Eligibility and Fraud limits against formal bank policies.",
      icon: ShieldAlert,
      color: "text-rose-400"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-16">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-3xl mx-auto pt-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-semibold text-blue-400 animate-pulse">
          <Zap className="w-3 h-3" /> Live Graph & Reasoning Engine Active
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          SBI Enterprise AI Banking Copilot
        </h1>
        <p className="text-lg text-zinc-400 font-light leading-relaxed">
          A production-quality demonstration platform showcasing multi-agent collaboration, semantic ontology reasoning, and live graph memory built for retail banking.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <button
            onClick={() => setActiveTab("copilot")}
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            Launch Copilot <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className="px-6 py-3 rounded-lg border border-white/10 hover:bg-white/5 text-zinc-300 font-medium transition-all duration-300"
          >
            Explore Scenarios
          </button>
        </div>
      </div>

      {/* Grid of Capabilities */}
      <div className="grid md:grid-cols-2 gap-6">
        {capabilities.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div key={i} className="glass-panel p-6 rounded-xl space-y-4 hover:border-white/15 transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                  <Icon className={`w-6 h-6 ${cap.color}`} />
                </div>
                <h3 className="font-semibold text-lg text-white">{cap.title}</h3>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">{cap.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Architecture Flow */}
      <div className="glass-panel p-8 rounded-xl space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Platform Topology</h2>
          <p className="text-zinc-400 text-sm">How events, agents, and OWL ontological concepts interact in real-time.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
          {[
            { step: "1. Intent / Event", icon: Zap, bg: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
            { step: "2. Planner", icon: Bot, bg: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
            { step: "3. Agent Pipeline", icon: BookOpen, bg: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
            { step: "4. Policy & Rules", icon: ShieldAlert, bg: "bg-rose-500/10 border-rose-500/20 text-rose-400" },
            { step: "5. Neo4j Memory", icon: Network, bg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className={`p-4 rounded-lg border flex flex-col items-center text-center gap-3 ${item.bg}`}>
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold">{item.step}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
