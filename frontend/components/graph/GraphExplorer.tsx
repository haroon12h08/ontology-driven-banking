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
      case "Customer": return "fill-[#F2F2F2] stroke-[#808080]";
      case "Account": return "fill-[#B8B8B8] stroke-[#2A2A2A]";
      case "Transaction": return "fill-[#1E1E1E] stroke-[#808080]";
      case "Merchant": return "fill-[#171717] stroke-[#2A2A2A]";
      case "Policy": return "fill-[#F2F2F2] stroke-[#FFFFFF]";
      case "Recommendation": return "fill-[#808080] stroke-[#2A2A2A]";
    }
  };

  const getNodeTextClass = (type: GraphNode["type"]) => {
    switch (type) {
      case "Customer": return "fill-black font-semibold";
      case "Policy": return "fill-black font-bold";
      default: return "fill-[#F2F2F2]";
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
    <div className="flex gap-4 h-[calc(100vh-120px)] font-mono text-xs">
      {/* Graph Pane */}
      <div className="flex-1 border border-[#2A2A2A] bg-[#111111] flex flex-col justify-between overflow-hidden relative rounded-sm">
        {/* Graph Filters */}
        <div className="p-3 border-b border-[#2A2A2A] bg-[#171717] flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#808080]" />
            <span className="font-bold text-[#F2F2F2] uppercase tracking-wider">SEMANTIC GRAPH MEMORY EXPLORER</span>
          </div>
          <div className="flex gap-1">
            {["ALL", "Customer", "Account", "Transaction", "Policy", "Recommendation"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-0.5 rounded-sm text-[9px] font-semibold border transition-all ${
                  filterType === t 
                    ? "bg-[#F2F2F2] border-transparent text-black" 
                    : "border-[#2A2A2A] bg-[#111111] text-[#808080] hover:text-[#F2F2F2] hover:bg-[#1E1E1E]"
                }`}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Viewport */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-[#0D0D0D]">
          <svg className="w-full h-full min-h-[450px]" viewBox="50 30 700 450">
            {/* Markers for arrows */}
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#2a2a2a" />
              </marker>
              <marker id="arrow-highlight" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#ffffff" />
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
                    className={`stroke-1 ${
                      isHighlighted ? "stroke-white" : "stroke-[#2A2A2A]"
                    }`}
                    markerEnd={`url(#${isHighlighted ? "arrow-highlight" : "arrow"})`}
                  />
                  <text
                    x={(sourceNode.x + targetNode.x) / 2}
                    y={(sourceNode.y + targetNode.y) / 2 - 5}
                    className={`text-[8px] font-mono select-none ${
                      isHighlighted ? "fill-[#F2F2F2] font-semibold" : "fill-[#808080]"
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
                  {/* Outer Ring for Selection */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 18 : 15}
                    className={`fill-none stroke-1 transition-all duration-150 ${
                      isSelected 
                        ? "stroke-white" 
                        : isRootCustomer 
                        ? "stroke-[#808080] stroke-dasharray-[2,2]" 
                        : "stroke-transparent group-hover:stroke-[#2A2A2A]"
                    }`}
                  />
                  {/* Central Node Circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 13 : 11}
                    className={`transition-all duration-150 ${getNodeColor(node.type)}`}
                  />
                  {/* Label inside or underneath */}
                  <text
                    x={node.x}
                    y={node.y + 24}
                    className="text-[8px] fill-[#808080] font-mono select-none group-hover:fill-[#F2F2F2] transition-colors"
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
      <div className="w-72 space-y-4">
        {selectedNode ? (
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 space-y-4 rounded-sm">
            <div className="flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#808080]" />
              <h3 className="text-[10px] font-bold text-[#F2F2F2] uppercase tracking-wider">SEMANTIC ENTITY</h3>
            </div>

            {/* Ontology Class */}
            <div className="p-2 rounded-sm bg-[#111111] border border-[#2A2A2A] space-y-0.5">
              <span className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider">OWL CONCEPT MAPPING</span>
              <span className="text-[10px] font-mono text-[#F2F2F2] block">{getOntologyClass(selectedNode.type)}</span>
            </div>

            {/* Node ID */}
            <div className="flex justify-between items-center text-[10px] border-b border-[#2A2A2A] pb-2">
              <span className="text-[#808080]">RESOURCE IDENTIFIER</span>
              <span className="font-semibold text-[#F2F2F2]">{selectedNode.id}</span>
            </div>

            {/* Node Properties */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] text-[#808080] font-bold block uppercase">ATTRIBUTES</span>
              <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                {Object.entries(selectedNode.properties).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-start text-[10px] p-1.5 bg-[#111111] border border-[#2A2A2A]">
                    <span className="text-[#808080] font-mono">{key}</span>
                    <span className="text-[#F2F2F2] font-semibold text-right truncate max-w-[130px]">
                      {typeof val === "number" ? val.toLocaleString("en-IN") : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Reasoning Insight */}
            <div className="p-2.5 bg-[#111111] border border-[#2A2A2A] space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#808080]" />
                <span className="text-[9px] text-[#F2F2F2] font-bold uppercase">COGNITIVE INSIGHT</span>
              </div>
              <p className="text-[10px] text-[#808080] leading-relaxed font-sans">
                {selectedNode.type === "Customer" 
                  ? "High asset value mapping. Profile parameters match retail HNWI segment rules."
                  : selectedNode.type === "Policy"
                  ? "Active banking constraints. Evaluated dynamically on credit limits and limits extension."
                  : selectedNode.type === "Transaction"
                  ? "Anomalous velocity check triggered. Flagged at merchant Delhi Terminal."
                  : "Product recommendation computed based on matching customer suitability vectors."}
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-[#2A2A2A] bg-[#171717] p-5 text-center py-20 space-y-2 rounded-sm">
            <Landmark className="w-6 h-6 text-[#808080] mx-auto" />
            <p className="text-[#808080] text-[10px] uppercase font-bold tracking-wider">Awaiting node selection...</p>
          </div>
        )}
      </div>
    </div>
  );
};
