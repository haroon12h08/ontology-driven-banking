import React from "react";
import { useBankingStore } from "@/store/bankingStore";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ShieldCheck, Network, Cpu, Clock } from "lucide-react";

export const ExecutiveDashboard: React.FC = () => {
  const { metrics } = useBankingStore();

  const classDistribution = [
    { name: "Customer", count: 10 },
    { name: "Account", count: 40 },
    { name: "Transaction", count: 284 },
    { name: "Merchant", count: 12 },
    { name: "Policy", count: 18 },
    { name: "Recs", count: 8 },
  ];

  const agentInvocations = [
    { name: "Customer", count: metrics.totalAgentCalls * 0.25 },
    { name: "Advisor", count: metrics.totalAgentCalls * 0.2 },
    { name: "Risk", count: metrics.totalAgentCalls * 0.18 },
    { name: "Operations", count: metrics.totalAgentCalls * 0.15 },
    { name: "Knowledge", count: metrics.totalAgentCalls * 0.12 },
    { name: "Engagement", count: metrics.totalAgentCalls * 0.1 },
  ];

  const statCards = [
    { title: "Ontology Classes", val: metrics.totalOntologyClasses, desc: "OWL classes mapped", icon: Network, color: "text-blue-400" },
    { title: "Graph Node memory", val: metrics.totalGraphNodes, desc: "Total database nodes", icon: ShieldCheck, color: "text-indigo-400" },
    { title: "Average Latency", val: `${metrics.averageLatencyMs}ms`, desc: "Multi-agent planning time", icon: Clock, color: "text-amber-400" },
    { title: "Total Agent Calls", val: metrics.totalAgentCalls, desc: "Agent invocations tracked", icon: Cpu, color: "text-purple-400" },
  ];

  return (
    <div className="space-y-6 py-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Executive Metrics & Telemetry</h2>
        <p className="text-zinc-400 text-sm">Real-time stats tracking graph memory size, ontology classes, and multi-agent latency performance.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="glass-panel p-5 rounded-xl space-y-2 hover:border-white/10 transition duration-200">
              <div className="flex justify-between items-center">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{card.title}</span>
                <Icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              <div className="space-y-1">
                <span className="text-2xl font-bold font-mono text-white">{card.val}</span>
                <span className="text-[10px] text-zinc-500 font-light block">{card.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid md:grid-cols-2 gap-6 pt-4">
        {/* Class Distribution Chart */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Database Class Distribution</h4>
            <p className="text-[10px] text-zinc-500">Number of live node instances loaded into Neo4j</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 11 }} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Invocation Chart */}
        <div className="glass-panel p-5 rounded-xl space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Agent Invocation Volume</h4>
            <p className="text-[10px] text-zinc-500">Distribution of requests routed to specialized agents</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentInvocations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="name" stroke="#888" fontSize={10} />
                <YAxis stroke="#888" fontSize={10} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", fontSize: 11 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
