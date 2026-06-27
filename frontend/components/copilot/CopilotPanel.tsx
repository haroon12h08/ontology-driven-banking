import React, { useState, useRef, useEffect } from "react";
import { useBankingStore } from "@/store/bankingStore";
import { bankingApi } from "@/lib/api";
import { Send, Sparkles, Clock, ShieldCheck, HeartPulse, ChevronRight } from "lucide-react";

export const CopilotPanel: React.FC = () => {
  const {
    chatHistory,
    addChatMessage,
    customerId,
    isProcessing,
    setIsProcessing,
    setWorkflowResults,
    updateLatencyMetric,
    activeWorkflow,
    activeConfidence,
    activePolicies,
    activeLatencyLogs,
    activeEvidence,
    setActiveTab
  } = useBankingStore();

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const suggestedPrompts = [
    "I want to buy a house.",
    "Process transaction: Suspicious charge of INR 60,000.00 at M-999 in Delhi.",
    "I want to find the best investment portfolio.",
    "I want to upgrade my credit card."
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    // Add user message
    addChatMessage({
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString()
    });

    setInputMessage("");
    setIsProcessing(true);

    try {
      const startTime = Date.now();
      const res = await bankingApi.chatWithAgent(customerId, text);
      const totalLatency = Date.now() - startTime;
      updateLatencyMetric(totalLatency);

      // Save workflow data to store
      setWorkflowResults({
        workflowName: res.workflow_name || "Custom Intent Query",
        finalOutput: res.final_output || "Query processed successfully.",
        reasoningChain: res.explainability?.reasoning_chain || [],
        latencyLogs: res.observability?.execution_logs || [],
        policiesConsulted: res.explainability?.policies_used || [],
        evidence: res.explainability?.evidence || null,
        confidence: res.explainability?.confidence_score || "100.0%"
      });

      // Add copilot response message
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
        text: "Error executing multi-agent pipeline. Please ensure the semantic-layer backend is running.",
        timestamp: new Date().toLocaleTimeString()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isProcessing]);

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Chat Pane */}
      <div className="flex-1 glass-panel rounded-xl flex flex-col justify-between overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white">Live Copilot Session</h2>
          </div>
          <span className="text-xs text-zinc-500 font-medium">Customer: {customerId}</span>
        </div>

        {/* Message Viewport */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {chatHistory.map((msg) => {
            const isCopilot = msg.sender === "copilot";
            const isSystem = msg.sender === "system";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-2xl ${
                  isCopilot ? "mr-auto" : isSystem ? "mx-auto w-full text-center" : "ml-auto"
                }`}
              >
                <div
                  className={`p-4 rounded-xl text-sm leading-relaxed ${
                    isSystem
                      ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                      : isCopilot
                      ? "bg-white/[0.02] border border-white/5 text-zinc-200"
                      : "bg-blue-600 text-white font-medium shadow-[0_4px_12px_rgba(37,99,235,0.2)]"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-1.5 px-1 text-[10px] text-zinc-500">
                  <span>{msg.sender === "copilot" ? "SBI Agent Core" : msg.sender === "system" ? "Platform Error" : "You"}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex flex-col mr-auto max-w-lg">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-zinc-200 flex items-center gap-3">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-xs text-zinc-400 font-medium animate-pulse">
                  Planner is orchestrating agents (Customer, Advisor, Risk, Operations)...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts & Input Area */}
        <div className="p-4 border-t border-white/5 bg-black/20 space-y-3">
          {chatHistory.length === 1 && !isProcessing && (
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="px-3 py-1.5 rounded-full border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] text-xs text-zinc-400 hover:text-zinc-200 transition-all duration-200"
                >
                  {p}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask the banking copilot..."
              className="flex-1 glass-input px-4 py-3 rounded-lg text-sm"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !inputMessage.trim()}
              className="px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-50 text-white transition-all duration-200 flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Meta Sidebar (Explainability & Observability) */}
      <div className="w-80 space-y-6 overflow-y-auto">
        {/* Active Workflow Metadata */}
        {activeWorkflow ? (
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workflow Resolved</h3>
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs text-zinc-400">Workflow</span>
              <span className="text-xs font-semibold text-blue-400">{activeWorkflow}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-xs text-zinc-400">Confidence Score</span>
              <span className="text-xs font-semibold text-emerald-400">{activeConfidence}</span>
            </div>
            
            {/* Policies Consulted */}
            {activePolicies.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-zinc-400 font-semibold block">Policies Consulted</span>
                <div className="space-y-1.5">
                  {activePolicies.map((p, i) => (
                    <div key={i} className="flex gap-2 items-start p-1.5 rounded bg-white/[0.02] border border-white/5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[10px] text-zinc-300 leading-normal">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Wellness / Risk Markers */}
            {activeEvidence && (
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-xs text-zinc-400 font-semibold block">Evidence Context</span>
                {activeEvidence.financial_health && (
                  <div className="flex items-center justify-between text-[11px] bg-white/[0.01] p-1.5 rounded">
                    <div className="flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-zinc-300">Financial Wellness</span>
                    </div>
                    <span className="font-semibold text-emerald-400">
                      {activeEvidence.financial_health.decision}
                    </span>
                  </div>
                )}
                {activeEvidence.risk_assessment && (
                  <div className="flex items-center justify-between text-[11px] bg-white/[0.01] p-1.5 rounded">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-zinc-300">Credit Risk Level</span>
                    </div>
                    <span className="font-semibold text-amber-400">
                      {activeEvidence.risk_assessment.risk_rating}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setActiveTab("agents")}
              className="w-full py-2.5 rounded-lg bg-blue-600/10 border border-blue-500/20 hover:bg-blue-600/20 text-xs text-blue-400 font-medium flex items-center justify-center gap-1 transition-all duration-200"
            >
              Analyze Agent Timeline <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="glass-panel p-5 rounded-xl text-center py-10 space-y-2">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-500">Submit a query to inspect live decision telemetry.</p>
          </div>
        )}

        {/* Performance Latency Trackers */}
        {activeLatencyLogs.length > 0 && (
          <div className="glass-panel p-5 rounded-xl space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Performance Audit</h3>
            <div className="space-y-2">
              {activeLatencyLogs.map((log, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/5 pb-1.5">
                  <div className="flex flex-col">
                    <span className="text-zinc-300 font-medium">{log.action}</span>
                    <span className="text-zinc-500">{log.resource}</span>
                  </div>
                  <span className="text-blue-400 font-mono">{log.latency_ms}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
