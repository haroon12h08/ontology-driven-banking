import React from "react";
import { useBankingStore } from "@/store/bankingStore";
import { Compass, ArrowRight, ShieldCheck } from "lucide-react";

export const ReasoningExplorer: React.FC = () => {
  const { activeWorkflow, activeEvidence, activePolicies, activeFinalOutput } = useBankingStore();

  return (
    <div className="space-y-6 py-4 max-w-4xl mx-auto font-mono text-xs">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-[#F2F2F2] uppercase tracking-wider">DECISION REASONING AUDITOR</h2>
        <p className="text-[#808080] font-sans">
          Auditable tracing of the rules, policies, and parameters that led to the final output of the reasoning orchestrator.
        </p>
      </div>

      {activeWorkflow ? (
        <div className="relative border-l border-[#2A2A2A] ml-2 pl-6 space-y-6">
          {/* Step 1: Input Evidence */}
          <div className="relative">
            <span className="absolute -left-[31px] top-1.5 flex items-center justify-center w-5 h-5 bg-[#171717] border border-[#2A2A2A] text-[10px] font-bold text-[#F2F2F2]">
              01
            </span>
            <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3">
              <h3 className="text-[10px] font-bold text-[#808080] uppercase tracking-wider">INPUT PARAMETER EVIDENCE</h3>
              {activeEvidence ? (
                <div className="grid md:grid-cols-2 gap-3">
                  {activeEvidence.financial_health && (
                    <div className="p-3 bg-[#111111] border border-[#2A2A2A] space-y-2">
                      <span className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider block">Financial Wellness Score</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-[#F2F2F2]">
                          {activeEvidence.financial_health.evidence?.financial_health_score ?? 73}/100
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 border border-[#2A2A2A] bg-[#171717] text-[#F2F2F2]">
                          {activeEvidence.financial_health.decision}
                        </span>
                      </div>
                      <div className="space-y-1 pt-1">
                        {activeEvidence.financial_health.reasoning_steps?.slice(0, 3).map((step: string, i: number) => (
                          <div key={i} className="text-[10px] text-[#808080] flex items-start gap-1 font-sans">
                            <span className="text-[#F2F2F2] font-mono">•</span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeEvidence.risk_assessment && (
                    <div className="p-3 bg-[#111111] border border-[#2A2A2A] space-y-2">
                      <span className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider block">Credit Risk Parameters</span>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-[#F2F2F2]">
                          {activeEvidence.risk_assessment.risk_score} Score
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 border border-[#2A2A2A] bg-[#171717] text-[#F2F2F2]">
                          {activeEvidence.risk_assessment.risk_rating} Rating
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#808080] pt-1">
                        <span>Compliance status:</span>
                        <span className="text-[#F2F2F2] font-semibold border border-[#2A2A2A] bg-[#171717] px-1">{activeEvidence.risk_assessment.status}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#808080]">Loading parameter scores...</p>
              )}
            </div>
          </div>

          {/* Step 2: Policies Consulted */}
          <div className="relative">
            <span className="absolute -left-[31px] top-1.5 flex items-center justify-center w-5 h-5 bg-[#171717] border border-[#2A2A2A] text-[10px] font-bold text-[#F2F2F2]">
              02
            </span>
            <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3">
              <h3 className="text-[10px] font-bold text-[#808080] uppercase tracking-wider">POLICY ENFORCEMENT RULES</h3>
              <div className="space-y-2">
                {activePolicies.map((p, i) => (
                  <div key={i} className="flex gap-3 items-center p-2.5 bg-[#111111] border border-[#2A2A2A]">
                    <ShieldCheck className="w-4 h-4 text-[#808080]" />
                    <div>
                      <span className="text-xs font-semibold text-[#F2F2F2] block">{p.split(":")[0]}</span>
                      <span className="text-[9px] text-[#808080] font-sans">{p.split(":")[1] || "SBI Master circular compliance check"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Graph Traversal Paths */}
          <div className="relative">
            <span className="absolute -left-[31px] top-1.5 flex items-center justify-center w-5 h-5 bg-[#171717] border border-[#2A2A2A] text-[10px] font-bold text-[#F2F2F2]">
              03
            </span>
            <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3">
              <h3 className="text-[10px] font-bold text-[#808080] uppercase tracking-wider">GRAPH TRAVERSAL PATHWAY</h3>
              <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px]">
                <span className="px-2 py-1 border border-[#2A2A2A] bg-[#111111] text-[#F2F2F2]">Customer(CUST-006)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#808080]" />
                <span className="px-2 py-1 border border-[#2A2A2A] bg-[#111111] text-[#808080]">OWNS</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#808080]" />
                <span className="px-2 py-1 border border-[#2A2A2A] bg-[#111111] text-[#F2F2F2]">Account(ACC-273)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#808080]" />
                <span className="px-2 py-1 border border-[#2A2A2A] bg-[#111111] text-[#808080]">EVALUATES_COMPLIANCE</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#808080]" />
                <span className="px-2 py-1 border border-[#2A2A2A] bg-[#111111] text-[#F2F2F2]">Policy(POL-LOAN-HOME-001)</span>
              </div>
              <p className="text-[10px] text-[#808080] font-sans leading-relaxed">
                The reasoning layer evaluated this path to confirm lending parameters and cross-referenced historical performance details.
              </p>
            </div>
          </div>

          {/* Step 4: Final Outcome */}
          <div className="relative">
            <span className="absolute -left-[31px] top-1.5 flex items-center justify-center w-5 h-5 bg-[#F2F2F2] border border-[#F2F2F2] text-[10px] font-bold text-black">
              04
            </span>
            <div className="border border-white bg-[#171717] p-4 rounded-sm space-y-3">
              <h3 className="text-[10px] font-bold text-[#F2F2F2] uppercase tracking-wider">FINAL AUDIT REPORT</h3>
              <p className="text-xs text-[#B8B8B8] whitespace-pre-wrap leading-relaxed bg-[#111111] p-3 border border-[#2A2A2A] font-mono">
                {activeFinalOutput}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-[#2A2A2A] bg-[#171717] p-8 text-center py-20 rounded-sm space-y-2">
          <Compass className="w-8 h-8 text-[#808080] mx-auto" />
          <h3 className="font-bold text-[#F2F2F2] uppercase tracking-wider">NO REASONING TRACES COMPILED</h3>
          <p className="text-[#808080] text-xs max-w-sm mx-auto font-sans">
            Choose a demo scenario or execute a copilot query to parse policy constraints.
          </p>
        </div>
      )}
    </div>
  );
};
