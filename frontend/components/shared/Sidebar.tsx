import React from "react";
import { useBankingStore } from "@/store/bankingStore";
import { 
  Home, 
  MessageSquareCode, 
  GitBranch, 
  Network, 
  Compass, 
  BookOpen, 
  PlayCircle, 
  Zap, 
  UserCheck, 
  BarChart3,
  Server,
  Trophy
} from "lucide-react";

interface SidebarProps {
  healthStatus: { status: string; database?: string };
}

export const Sidebar: React.FC<SidebarProps> = ({ healthStatus }) => {
  const { activeTab, setActiveTab } = useBankingStore();

  const menuItems = [
    { id: "landing", label: "Overview", icon: Home },
    { id: "copilot", label: "AI Copilot", icon: MessageSquareCode },
    { id: "agents", label: "Agent Pipeline", icon: GitBranch },
    { id: "graph", label: "Graph Explorer", icon: Network },
    { id: "reasoning", label: "Reasoning Tree", icon: Compass },
    { id: "ontology", label: "Ontology OWL", icon: BookOpen },
    { id: "scenarios", label: "Demo Scenarios", icon: PlayCircle },
    { id: "events", label: "Event Simulator", icon: Zap },
    { id: "customer", label: "Customer 360", icon: UserCheck },
    { id: "dashboard", label: "Executive Metrics", icon: BarChart3 },
    { id: "judge", label: "Judge Dashboard", icon: Trophy },
  ] as const;

  return (
    <aside className="w-60 border-r border-[#2A2A2A] bg-[#111111] flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-4 flex items-center gap-2 border-b border-[#2A2A2A]">
          <div className="w-6 h-6 rounded bg-[#F2F2F2] flex items-center justify-center font-bold text-black text-xs">
            S
          </div>
          <div>
            <h1 className="font-semibold text-xs tracking-tight text-[#F2F2F2]">SBI INTEL</h1>
            <span className="text-[9px] text-[#808080] uppercase tracking-wider font-semibold">SEMANTIC LAYER v1.0</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-2.5 space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-sm text-xs transition-all duration-150 border ${
                  isActive 
                    ? "bg-[#171717] text-[#F2F2F2] border-[#2A2A2A] font-semibold" 
                    : "text-[#808080] hover:text-[#F2F2F2] hover:bg-[#171717]/50 border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#F2F2F2]" : "text-[#808080]"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend connection status */}
      <div className="p-3 border-t border-[#2A2A2A] bg-[#0D0D0D]">
        <div className="flex items-center gap-2 px-2 py-1 rounded-sm border border-[#2A2A2A] bg-[#111111]">
          <div className="relative flex h-1.5 w-1.5">
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
              healthStatus.status === "success" ? "bg-[#F2F2F2]" : "bg-[#808080]"
            }`}></span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-semibold text-[#F2F2F2] truncate">
              {healthStatus.status === "success" ? "CORE ONLINE" : "OFFLINE MOCK"}
            </span>
            <span className="text-[9px] text-[#808080] truncate font-mono">
              {healthStatus.database || "DISCONNECTED"}
            </span>
          </div>
          <Server className="w-3 text-[#808080] ml-auto flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
};
