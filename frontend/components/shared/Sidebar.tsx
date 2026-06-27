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
    <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(37,99,235,0.6)]">
            S
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-tight text-white">SBI Enterprise</h1>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Semantic memory</span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  isActive 
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium" 
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? "text-blue-400" : "text-zinc-500"}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Backend connection status */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-md border border-white/5 bg-white/[0.02]">
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              healthStatus.status === "success" ? "bg-emerald-400" : "bg-amber-400"
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              healthStatus.status === "success" ? "bg-emerald-500" : "bg-amber-500"
            }`}></span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[11px] font-medium text-zinc-300 truncate">
              {healthStatus.status === "success" ? "Live Graph Core" : "Local Mock Mode"}
            </span>
            <span className="text-[9px] text-zinc-500 truncate">
              {healthStatus.database || "Bolt disconnected"}
            </span>
          </div>
          <Server className="w-3.5 h-3.5 text-zinc-500 ml-auto flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
};
