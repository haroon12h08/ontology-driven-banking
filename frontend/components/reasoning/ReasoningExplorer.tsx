import React from "react";
import { useBankingStore } from "@/store/bankingStore";
import { Compass, ArrowRight, ShieldCheck } from "lucide-react";

export const ReasoningExplorer: React.FC = () => {
  const { activeWorkflow, activeEvidence, activePolicies, activeFinalOutput } = useBankingStore();

  return (
    <div className="space-y-8 py-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Decision Reasoning Explorer</h2>
        <p className="text-zinc-400 text-sm">
          Auditable tracing of the rules, policies, and parameters that led to the final output of the orchestrator.
        </p>
      </div>

      {activeWorkflow ? (
        <div className="relative border-l border-zinc-800 ml-4 pl-8 space-y-8">
          {/* Step 1: Input Evidence */}
          <div className="relative">
            <span className="absolute -left-[41px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300">
              1
            </span>
            <div className="glass-panel p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Input Parameter Evidence</h3>
              {activeEvidence ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {activeEvidence.financial_health && (
                    <div className="p-3 rounded bg-white/[0.01] border border-white/5 space-y-2">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Financial Wellness Score</span>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-emerald-400">
                          {activeEvidence.financial_health.evidence?.financial_health_score ?? 73}/100
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {activeEvidence.financial_health.decision}
                        </span>
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {activeEvidence.financial_health.reasoning_steps?.slice(0, 3).map((step: string, i: number) => (
                          <div key={i} className="text-[10px] text-zinc-400 flex items-start gap-1">
                            <span className="text-blue-500">•</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEvidence.risk_assessment && (
                    <div className="p-3 rounded bg-white/[0.01] border border-white/5 space-y-2">
                      <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Credit Risk Parameters</span>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-amber-400">
                          {activeEvidence.risk_assessment.risk_score} Score
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {activeEvidence.risk_assessment.risk_rating} Rating
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-400 pt-1">
                        <span>Compliance status:</span>
                        <span className="text-emerald-400 font-semibold">{activeEvidence.risk_assessment.status}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-zinc-500 font-light">Loading parameter scores...</p>
              )}
            </div>
          </div>

          {/* Step 2: Policies Consulted */}
          <div className="relative">
            <span className="absolute -left-[41px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300">
              2
            </span>
            <div className="glass-panel p-5 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Policy Enforcement Rules</h3>
              <div className="space-y-2">
                {activePolicies.map((p, i) => (
                  <div key={i} className="flex gap-3 items-center p-3 rounded-lg bg-white/[0.01] border border-white/5">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    <div>
                      <span className="text-xs font-semibold text-zinc-200 block">{p.split(":")[0]}</span>
                      <span className="text-[10px] text-zinc-500">{p.split(":")[1] || "SBI Master circular compliance check"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Graph Traversal Paths */}
          <div className="relative">
            <span className="absolute -left-[41px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 text-xs font-bold text-zinc-300">
              3
            </span>
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Graph Traversal Logs</h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 font-mono">Customer(CUST-006)</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 font-mono">OWNS</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 font-mono">Account(ACC-273)</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 font-mono">EVALUATES_COMPLIANCE</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs px-2.5 py-1.5 rounded bg-zinc-800 text-zinc-300 font-mono">Policy(POL-LOAN-HOME-001)</span>
              </div>
              <p className="text-[10px] text-zinc-500 font-light leading-relaxed">
                The Reasoning engine parsed this path to resolve eligibility checks and cross-referenced the customer balances against active lending criteria.
              </p>
            </div>
          </div>

          {/* Step 4: Final Outcome */}
          <div className="relative">
            <span className="absolute -left-[41px] top-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-xs font-bold text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]">
              4
            </span>
            <div className="glass-panel p-5 rounded-xl border-blue-500/20 bg-blue-950/[0.01] space-y-3">
              <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest">Final Audit Action Output</h3>
              <p className="text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed bg-black/30 p-4 rounded-lg border border-white/5">
                {activeFinalOutput}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-8 text-center py-20 rounded-xl space-y-4">
          <Compass className="w-12 h-12 text-zinc-600 mx-auto animate-spin-slow" />
          <h3 className="font-bold text-white">No reasoning traces loaded</h3>
          <p className="text-zinc-500 text-sm max-w-sm mx-auto">
            Choose a demo scenario or chat with the copilot to compile a live policy reasoning tree.
          </p>
        </div>
      )}
    </div>
  );
};
