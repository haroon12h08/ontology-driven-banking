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
    <div className="flex min-h-screen bg-[#0D0D0D] text-[#F2F2F2] font-mono selection:bg-[#F2F2F2] selection:text-black">
      {/* Navigation Sidebar */}
      <Sidebar healthStatus={health} />

      {/* Main Viewport Container */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar with Customer context switcher */}
        <header className="h-12 px-6 border-b border-[#2A2A2A] bg-[#111111] flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#808080] uppercase tracking-wider font-semibold">SESSION_TAB:</span>
            <span className="text-[10px] text-[#F2F2F2] font-semibold font-mono bg-[#1E1E1E] px-2 py-0.5 rounded-sm border border-[#2A2A2A]">
              {activeTab.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-[#171717] border border-[#2A2A2A]">
              <User className="w-3.5 h-3.5 text-[#808080]" />
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="bg-transparent text-xs text-[#F2F2F2] font-semibold outline-none cursor-pointer border-none p-0 pr-6"
              >
                <option value="CUST-006" className="bg-[#171717] text-[#F2F2F2]">CUST-006 (Approval Case)</option>
                <option value="CUST-001" className="bg-[#171717] text-[#F2F2F2]">CUST-001 (Rejection Case)</option>
              </select>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Viewport */}
        <main className="flex-1 p-6 overflow-y-auto bg-[#0D0D0D]">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
