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
    { name: "Customer", count: Math.round(metrics.totalAgentCalls * 0.25) },
    { name: "Advisor", count: Math.round(metrics.totalAgentCalls * 0.2) },
    { name: "Risk", count: Math.round(metrics.totalAgentCalls * 0.18) },
    { name: "Operations", count: Math.round(metrics.totalAgentCalls * 0.15) },
    { name: "Knowledge", count: Math.round(metrics.totalAgentCalls * 0.12) },
    { name: "Engagement", count: Math.round(metrics.totalAgentCalls * 0.1) },
  ];

  const statCards = [
    { title: "Ontology Classes", val: metrics.totalOntologyClasses, desc: "OWL classes mapped", icon: Network },
    { title: "Graph Node memory", val: metrics.totalGraphNodes, desc: "Total database nodes", icon: ShieldCheck },
    { title: "Average Latency", val: `${metrics.averageLatencyMs}ms`, desc: "Multi-agent planning time", icon: Clock },
    { title: "Total Agent Calls", val: metrics.totalAgentCalls, desc: "Agent invocations tracked", icon: Cpu },
  ];

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto font-mono text-xs">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-[#F2F2F2] uppercase tracking-wider">SYSTEM MONITORING & TELEMETRY</h2>
        <p className="text-[#808080] font-sans font-light">Real-time stats tracking graph memory size, ontology classes, and multi-agent latency performance.</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#808080] font-bold uppercase tracking-wider">{card.title}</span>
                <Icon className="w-4 h-4 text-[#808080]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xl font-bold font-mono text-[#F2F2F2]">{card.val}</span>
                <span className="text-[9px] text-[#808080] font-sans block">{card.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid md:grid-cols-2 gap-4 pt-2">
        {/* Class Distribution Chart */}
        <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#F2F2F2] uppercase">DATABASE CLASS DISTRIBUTION</h4>
            <p className="text-[9px] text-[#808080] font-sans">Number of live node instances loaded into Neo4j</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistribution}>
                <CartesianGrid strokeDasharray="2 2" stroke="#2A2A2A" />
                <XAxis dataKey="name" stroke="#808080" fontSize={10} tickLine={false} />
                <YAxis stroke="#808080" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #2a2a2a", fontSize: 10, fontFamily: "monospace" }} />
                <Bar dataKey="count" fill="#FFFFFF" shape={(props: any) => {
                  const { x, y, width, height } = props;
                  return <rect x={x} y={y} width={width} height={height} fill="#F2F2F2" stroke="#2a2a2a" strokeWidth={1} />;
                }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Agent Invocation Chart */}
        <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-4">
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-[#F2F2F2] uppercase">AGENT INVOCATION VOLUME</h4>
            <p className="text-[9px] text-[#808080] font-sans">Distribution of requests routed to specialized agents</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentInvocations}>
                <CartesianGrid strokeDasharray="2 2" stroke="#2A2A2A" />
                <XAxis dataKey="name" stroke="#808080" fontSize={10} tickLine={false} />
                <YAxis stroke="#808080" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ background: "#111", border: "1px solid #2a2a2a", fontSize: 10, fontFamily: "monospace" }} />
                <Bar dataKey="count" fill="#808080" shape={(props: any) => {
                  const { x, y, width, height } = props;
                  return <rect x={x} y={y} width={width} height={height} fill="#B8B8B8" stroke="#2a2a2a" strokeWidth={1} />;
                }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
