"use client";

import React, { useEffect, useState } from "react";
import { useBankingStore } from "@/store/bankingStore";
import { Sidebar } from "@/components/shared/Sidebar";
import { LandingPage } from "@/components/shared/LandingPage";
import { CopilotPanel } from "@/components/copilot/CopilotPanel";
import { CollaborationView } from "@/components/agents/CollaborationView";
import { GraphExplorer } from "@/components/graph/GraphExplorer";
import { ReasoningExplorer } from "@/components/reasoning/ReasoningExplorer";
import { OntologyExplorer } from "@/components/ontology/OntologyExplorer";
import { ScenarioManager } from "@/components/scenarios/ScenarioManager";
import { EventSimulator } from "@/components/events/EventSimulator";
import { Customer360 } from "@/components/dashboard/Customer360";
import { ExecutiveDashboard } from "@/components/dashboard/ExecutiveDashboard";
import { JudgeDashboard } from "@/components/dashboard/JudgeDashboard";
import { bankingApi } from "@/lib/api";
import { User } from "lucide-react";

export default function Home() {
  const { activeTab, customerId, setCustomerId } = useBankingStore();
  const [health, setHealth] = useState<{ status: string; database?: string }>({
    status: "checking",
  });

  useEffect(() => {
    const checkStatus = async () => {
      const res = await bankingApi.getHealth();
      if (res.status === "success") {
        const properties = res.entities?.[0]?.properties || {};
        setHealth({
          status: "success",
          database: properties.database || "Neo4j Kernel",
        });
      } else {
        setHealth({ status: "error" });
      }
    };
    checkStatus();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "landing":
        return <LandingPage />;
      case "copilot":
        return <CopilotPanel />;
      case "agents":
        return <CollaborationView />;
      case "graph":
        return <GraphExplorer />;
      case "reasoning":
        return <ReasoningExplorer />;
      case "ontology":
        return <OntologyExplorer />;
      case "scenarios":
        return <ScenarioManager />;
      case "events":
        return <EventSimulator />;
      case "customer":
        return <Customer360 />;
      case "dashboard":
        return <ExecutiveDashboard />;
      case "judge":
        return <JudgeDashboard />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Navigation Sidebar */}
      <Sidebar healthStatus={health} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar with Customer context switcher */}
        <header className="h-16 px-8 border-b border-white/5 bg-black/20 flex items-center justify-between sticky top-0 z-20 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 uppercase tracking-widest font-semibold">Active Session:</span>
            <span className="text-xs text-blue-400 font-semibold font-mono bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
              {activeTab.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="bg-transparent text-xs text-zinc-300 font-semibold outline-none cursor-pointer border-none p-0 pr-6"
              >
                <option value="CUST-006" className="bg-zinc-950 text-white">CUST-006 (Approval Case)</option>
                <option value="CUST-001" className="bg-zinc-950 text-white">CUST-001 (Rejection Case)</option>
              </select>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Viewport */}
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
