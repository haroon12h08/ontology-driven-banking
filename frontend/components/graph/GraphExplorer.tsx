import React, { useState } from "react";
import { useBankingStore } from "@/store/bankingStore";
import { Network, Info, Landmark } from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  type: "Customer" | "Account" | "Transaction" | "Merchant" | "Policy" | "Recommendation";
  x: number;
  y: number;
  properties: Record<string, unknown>;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  highlight?: boolean;
}

export const GraphExplorer: React.FC = () => {
  const { customerId } = useBankingStore();
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");

  // Coordinates optimized for structured SVG layout
  const nodes: GraphNode[] = [
    { 
      id: "CUST-006", 
      label: "Customer: CUST-006", 
      type: "Customer", 
      x: 400, 
      y: 80,
      properties: {
        id: "CUST-006",
        firstName: "CustomerFirstName6",
        lastName: "CustomerLastName6",
        segment: "MassAffluent",
        creditScore: 748,
        spendingPattern: "Disciplined Saver",
        churnRisk: "Low Churn Risk",
        digitalAdoption: "Medium"
      }
    },
    { 
      id: "ACC-694", 
      label: "Mutual Fund ACC-694", 
      type: "Account", 
      x: 180, 
      y: 200,
      properties: { balance: 338678.02, accountNumber: "SBI-5880922736", status: "Active", type: "MutualFund" }
    },
    { 
      id: "ACC-484", 
      label: "Savings ACC-484", 
      type: "Account", 
      x: 340, 
      y: 200,
      properties: { balance: 471849.60, accountNumber: "SBI-5659086958", status: "Active", type: "Savings" }
    },
    { 
      id: "ACC-769", 
      label: "Savings ACC-769", 
      type: "Account", 
      x: 480, 
      y: 200,
      properties: { balance: 94278.03, accountNumber: "SBI-4990891827", status: "Active", type: "Savings" }
    },
    { 
      id: "ACC-273", 
      label: "Home Loan ACC-273", 
      type: "Account", 
      x: 640, 
      y: 200,
      properties: { balance: 415928.91, accountNumber: "SBI-5346341182", status: "Active", type: "HomeLoan" }
    },
    { 
      id: "TX-401", 
      label: "Transaction: INR 60,000", 
      type: "Transaction", 
      x: 340, 
      y: 320,
      properties: { transactionId: "TX-401", amount: 60000.00, location: "Delhi", deviceId: "DEV_99", merchantId: "M-999" }
    },
    { 
      id: "M-999", 
      label: "Merchant: M-999", 
      type: "Merchant", 
      x: 340, 
      y: 430,
      properties: { merchantId: "M-999", merchantName: "Delhi Retail Vendor", riskRating: "High Risk" }
    },
    { 
      id: "POL-HOME", 
      label: "Policy: POL-LOAN-HOME-001", 
      type: "Policy", 
      x: 640, 
      y: 320,
      properties: { id: "POL-LOAN-HOME-001", name: "SBI Griha Pravesh Home Loan Policy", maxDtiRatio: "50%", minCreditScore: 650 }
    },
    { 
      id: "REC-1", 
      label: "Rec: Mutual Fund SIP", 
      type: "Recommendation", 
      x: 180, 
      y: 320,
      properties: { productId: "mutual_fund_conservative", productName: "Conservative Mutual Fund", score: 0.85, category: "Investment" }
    }
  ];

  const edges: GraphEdge[] = [
    { source: "CUST-006", target: "ACC-694", label: "OWNS", highlight: true },
    { source: "CUST-006", target: "ACC-484", label: "OWNS", highlight: true },
    { source: "CUST-006", target: "ACC-769", label: "OWNS" },
    { source: "CUST-006", target: "ACC-273", label: "OWNS", highlight: true },
    { source: "ACC-484", target: "TX-401", label: "HAS_TRANSACTION" },
    { source: "TX-401", target: "M-999", label: "AT" },
    { source: "ACC-273", target: "POL-HOME", label: "EVALUATES_LIMIT", highlight: true },
    { source: "ACC-694", target: "REC-1", label: "SUGGESTS_UPGRADE" }
  ];

  const filteredNodes = filterType === "ALL" 
    ? nodes 
    : nodes.filter(n => n.type === filterType);

  const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
  const filteredEdges = edges.filter(
    e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  const getNodeColor = (type: GraphNode["type"]) => {
    switch (type) {
      case "Customer": return "fill-blue-500 stroke-blue-400";
      case "Account": return "fill-indigo-500 stroke-indigo-400";
      case "Transaction": return "fill-amber-500 stroke-amber-400";
      case "Merchant": return "fill-rose-500 stroke-rose-400";
      case "Policy": return "fill-purple-500 stroke-purple-400";
      case "Recommendation": return "fill-emerald-500 stroke-emerald-400";
    }
  };

  const getOntologyClass = (type: GraphNode["type"]) => {
    switch (type) {
      case "Customer": return "owl:Class sbi:Customer";
      case "Account": return "owl:Class sbi:Account";
      case "Transaction": return "owl:Class sbi:Transaction";
      case "Merchant": return "owl:Class sbi:Merchant";
      case "Policy": return "owl:Class sbi:Policy";
      case "Recommendation": return "owl:Class sbi:Recommendation";
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Graph Pane */}
      <div className="flex-1 glass-panel rounded-xl flex flex-col justify-between overflow-hidden relative bg-black/40">
        {/* Graph Filters */}
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold text-white">Live Semantic Memory Explorer</h2>
          </div>
          <div className="flex gap-1.5">
            {["ALL", "Customer", "Account", "Transaction", "Policy", "Recommendation"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-all ${
                  filterType === t 
                    ? "bg-blue-600/10 border-blue-500/30 text-blue-400" 
                    : "border-white/5 bg-white/[0.01] text-zinc-400 hover:text-white"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic SVG Viewport */}
        <div className="flex-1 overflow-auto flex items-center justify-center">
          <svg className="w-full h-full min-h-[450px]" viewBox="50 30 700 450">
            {/* Markers for arrows */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3f3f46" />
              </marker>
              <marker id="arrow-highlight" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
              </marker>
            </defs>

            {/* Draw Edges */}
            {filteredEdges.map((edge, idx) => {
              const sourceNode = nodes.find(n => n.id === edge.source);
              const targetNode = nodes.find(n => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const isHighlighted = edge.highlight;

              return (
                <g key={idx}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    className={`stroke-2 ${
                      isHighlighted ? "stroke-blue-500" : "stroke-zinc-700"
                    }`}
                    markerEnd={`url(#${isHighlighted ? "arrow-highlight" : "arrow"})`}
                  />
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2 - 5}
                    className={`text-[8px] font-mono text-center select-none ${
                      isHighlighted ? "fill-blue-400 font-semibold" : "fill-zinc-500"
                    }`}
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                </g>
              );
            })}

            {/* Draw Nodes */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              const isRootCustomer = node.id === customerId;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer Glow Ring for Selection */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 20 : 16}
                    className={`fill-none transition-all duration-300 ${
                      isSelected 
                        ? "stroke-blue-500/80 stroke-2" 
                        : isRootCustomer 
                        ? "stroke-blue-400/40 stroke-2 animate-pulse" 
                        : "stroke-transparent group-hover:stroke-white/10"
                    }`}
                  />
                  {/* Central Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 14 : 12}
                    className={`transition-all duration-300 ${getNodeColor(node.type)}`}
                  />
                  {/* Label underneath */}
                  <text
                    x={node.x}
                    y={node.y + 26}
                    className="text-[9px] fill-zinc-300 font-medium select-none group-hover:fill-white transition-colors"
                    textAnchor="middle"
                  >
                    {node.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Node Properties Panel */}
      <div className="w-80 space-y-6">
        {selectedNode ? (
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Semantic Entity</h3>
            </div>

            {/* Ontology Class */}
            <div className="p-2 rounded bg-white/[0.02] border border-white/5 space-y-0.5">
              <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider">OWL Concept Mapping</span>
              <span className="text-xs font-mono text-blue-400 block">{getOntologyClass(selectedNode.type)}</span>
            </div>

            {/* Node ID */}
            <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
              <span className="text-zinc-500">Resource Identifier</span>
              <span className="font-semibold text-zinc-200">{selectedNode.id}</span>
            </div>

            {/* Node Properties */}
            <div className="space-y-2 pt-2">
              <span className="text-xs text-zinc-400 font-semibold block">Attributes</span>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {Object.entries(selectedNode.properties).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-start text-[11px] p-1.5 rounded bg-white/[0.01]">
                    <span className="text-zinc-500 font-mono">{key}</span>
                    <span className="text-zinc-200 font-medium text-right truncate max-w-[150px]">
                      {typeof val === "number" ? val.toLocaleString("en-IN") : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Reasoning Insight */}
            <div className="p-3 rounded-lg bg-blue-600/5 border border-blue-500/10 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-[10px] text-zinc-300 font-semibold uppercase tracking-wider">Cognitive Insight</span>
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
                {selectedNode.type === "Customer" 
                  ? "High value customer mapping. Asset profile aligns with SBI HNWI segment parameters."
                  : selectedNode.type === "Policy"
                  ? "Active regulatory rule set loaded from policy engine rules folder. Evaluated on loan cap requests."
                  : selectedNode.type === "Transaction"
                  ? "Anomalous transaction velocity threshold detected. Block triggered based on suspicious merchant flags."
                  : "Retrieved recommendation computed based on matching customer product affinity weights."}
              </p>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-5 rounded-xl text-center py-20 space-y-2">
            <Landmark className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="text-xs text-zinc-500">Click any node in the canvas to inspect its semantic attributes and OWL mappings.</p>
          </div>
        )}
      </div>
    </div>
  );
};
