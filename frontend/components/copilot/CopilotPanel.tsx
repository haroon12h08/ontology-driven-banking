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

      setWorkflowResults({
        workflowName: res.workflow_name || "Custom Intent Query",
        finalOutput: res.final_output || "Query processed successfully.",
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
    <div className="flex gap-4 h-[calc(100vh-120px)] font-mono text-xs">
      {/* Chat Pane */}
      <div className="flex-1 border border-[#2A2A2A] bg-[#171717] flex flex-col justify-between overflow-hidden rounded-sm">
        {/* Chat Header */}
        <div className="p-3 border-b border-[#2A2A2A] bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#808080]" />
            <span className="font-bold text-[#F2F2F2] uppercase tracking-wider">AGENT SESSION CONSOLE</span>
          </div>
          <span className="text-[10px] text-[#808080] font-mono">TARGET_ID: {customerId}</span>
        </div>

        {/* Message Viewport */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {chatHistory.map((msg) => {
            const isCopilot = msg.sender === "copilot";
            const isSystem = msg.sender === "system";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-xl ${
                  isCopilot ? "mr-auto" : isSystem ? "mx-auto w-full text-center" : "ml-auto"
                }`}
              >
                <div
                  className={`p-3 rounded-sm leading-relaxed border ${
                    isSystem
                      ? "bg-[#111111] border-[#2A2A2A] text-[#808080]"
                      : isCopilot
                      ? "bg-[#111111] border-[#2A2A2A] text-[#B8B8B8]"
                      : "bg-[#1E1E1E] border-[#2A2A2A] text-[#F2F2F2] font-semibold"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                <div className="flex items-center gap-2 mt-1 px-1 text-[9px] text-[#808080] font-mono">
                  <span>{msg.sender === "copilot" ? "SBI_AGENT_CORE" : msg.sender === "system" ? "SYS_ERR" : "OPERATOR"}</span>
                  <span>//</span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {isProcessing && (
            <div className="flex flex-col mr-auto max-w-lg">
              <div className="p-3 rounded-sm bg-[#111111] border border-[#2A2A2A] text-[#808080] flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white inline-block animate-pulse"></span>
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  ORCHESTRATING PIPELINE EVENTS...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts & Input Area */}
        <div className="p-3 border-t border-[#2A2A2A] bg-[#111111] space-y-2.5">
          {chatHistory.length === 1 && !isProcessing && (
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 border border-[#2A2A2A] bg-[#171717] hover:bg-[#1E1E1E] text-[10px] text-[#808080] hover:text-[#F2F2F2] transition-all duration-150 rounded-sm"
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
              placeholder="Query reasoning core..."
              className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] px-3 py-2 text-[#F2F2F2] rounded-sm"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !inputMessage.trim()}
              className="px-3.5 py-2 bg-[#F2F2F2] hover:bg-[#B8B8B8] disabled:bg-[#1E1E1E] disabled:text-[#808080] text-black font-semibold flex items-center justify-center rounded-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Meta Sidebar (Explainability & Observability) */}
      <div className="w-72 space-y-4 overflow-y-auto">
        {/* Active Workflow Metadata */}
        {activeWorkflow ? (
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 space-y-4 rounded-sm">
            <h3 className="text-[10px] font-bold text-[#F2F2F2] uppercase tracking-wider">WORKFLOW TELEMETRY</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                <span className="text-[#808080]">INTENT</span>
                <span className="font-semibold text-[#F2F2F2]">{activeWorkflow}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#2A2A2A] pb-2">
                <span className="text-[#808080]">CONFIDENCE</span>
                <span className="font-mono text-[#F2F2F2] border border-[#2A2A2A] bg-[#111111] px-1.5 py-0.5">{activeConfidence}</span>
              </div>
            </div>
            
            {/* Policies Consulted */}
            {activePolicies.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] text-[#808080] font-bold block uppercase tracking-wider">POLICIES CONSULTED</span>
                <div className="space-y-1">
                  {activePolicies.map((p, i) => (
                    <div key={i} className="flex gap-2 items-center p-1.5 bg-[#111111] border border-[#2A2A2A]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#F2F2F2] flex-shrink-0" />
                      <span className="text-[9px] text-[#B8B8B8] truncate">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Wellness / Risk Markers */}
            {activeEvidence && (
              <div className="space-y-2 pt-2 border-t border-[#2A2A2A]">
                <span className="text-[10px] text-[#808080] font-bold block uppercase tracking-wider">EVIDENCE CONTEXT</span>
                {activeEvidence.financial_health && (
                  <div className="flex items-center justify-between text-[10px] bg-[#111111] border border-[#2A2A2A] p-1.5">
                    <div className="flex items-center gap-1.5">
                      <HeartPulse className="w-3.5 h-3.5 text-[#F2F2F2]" />
                      <span className="text-[#B8B8B8]">Wellness Status</span>
                    </div>
                    <span className="font-semibold text-[#F2F2F2]">
                      {activeEvidence.financial_health.decision}
                    </span>
                  </div>
                )}
                {activeEvidence.risk_assessment && (
                  <div className="flex items-center justify-between text-[10px] bg-[#111111] border border-[#2A2A2A] p-1.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#F2F2F2]" />
                      <span className="text-[#B8B8B8]">Risk Rating</span>
                    </div>
                    <span className="font-semibold text-[#F2F2F2]">
                      {activeEvidence.risk_assessment.risk_rating}
                    </span>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setActiveTab("agents")}
              className="w-full py-2 bg-[#111111] border border-[#2A2A2A] hover:bg-[#1E1E1E] text-xs text-[#F2F2F2] font-medium flex items-center justify-center gap-1 transition-all duration-150 rounded-sm"
            >
              ANALYZE AGENT TIMELINE <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="border border-[#2A2A2A] bg-[#171717] p-5 text-center py-10 space-y-2 rounded-sm">
            <Clock className="w-6 h-6 text-[#808080] mx-auto" />
            <p className="text-[#808080] text-[10px] uppercase font-bold tracking-wider">Awaiting query...</p>
          </div>
        )}

        {/* Performance Latency Trackers */}
        {activeLatencyLogs.length > 0 && (
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 space-y-3 rounded-sm">
            <h3 className="text-[10px] font-bold text-[#F2F2F2] uppercase tracking-wider">PERFORMANCE LOGS</h3>
            <div className="space-y-1.5">
              {activeLatencyLogs.map((log, i) => (
                <div key={i} className="flex justify-between items-center text-[10px] border-b border-[#2A2A2A] pb-1.5">
                  <div className="flex flex-col">
                    <span className="text-[#B8B8B8] font-medium">{log.action}</span>
                    <span className="text-[#808080] text-[9px]">{log.resource}</span>
                  </div>
                  <span className="text-[#F2F2F2] font-mono font-bold border border-[#2A2A2A] bg-[#111111] px-1">{log.latency_ms}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
