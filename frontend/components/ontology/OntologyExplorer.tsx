import React, { useState, useEffect } from "react";
import { bankingApi } from "@/lib/api";
import { BookOpen, Search, HelpCircle, Network } from "lucide-react";

interface OntologyClassNode {
  id: string;
  properties: { description: string };
}

interface OntologyPropertyNode {
  id: string;
  properties: { domain: string; range: string; description?: string };
}

interface SelectedOntologyItem {
  id: string;
  type: "Class" | "Property";
  properties?: { domain?: string; range?: string; description?: string };
}

export const OntologyExplorer: React.FC = () => {
  const [classes, setClasses] = useState<OntologyClassNode[]>([]);
  const [properties, setProperties] = useState<OntologyPropertyNode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<SelectedOntologyItem | null>(null);

  useEffect(() => {
    const loadOntology = async () => {
      const clsRes = await bankingApi.getOntologyClasses();
      const propRes = await bankingApi.getOntologyProperties();
      setClasses(clsRes.entities || []);
      setProperties(propRes.entities || []);
      
      if (clsRes.entities?.length > 0) {
        setSelectedItem({ ...clsRes.entities[0], type: "Class" } as SelectedOntologyItem);
      }
    };
    loadOntology();
  }, []);

  const filteredClasses = classes.filter(
    (c) => c.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProperties = properties.filter(
    (p) => p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 py-4 h-[calc(100vh-120px)] flex flex-col font-mono text-xs">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-[#F2F2F2] uppercase tracking-wider">OWL ONTOLOGY SCHEMA NAVIGATOR</h2>
        <p className="text-[#808080] font-sans">
          Browse OWL classes, Object Properties, and Data Properties imported directly from the formal ontology (`banking.ttl`).
        </p>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left List Pane */}
        <div className="w-72 border border-[#2A2A2A] bg-[#171717] flex flex-col justify-between overflow-hidden rounded-sm">
          {/* Search bar */}
          <div className="p-2 border-b border-[#2A2A2A] bg-[#111111] flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-[#808080]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter concepts..."
              className="bg-transparent text-xs text-[#F2F2F2] outline-none w-full placeholder-[#808080] border-none p-0"
            />
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3">
            {/* OWL Classes */}
            <div className="space-y-0.5">
              <span className="text-[9px] px-2 py-1 font-bold text-[#808080] uppercase tracking-wider block">OWL Classes</span>
              {filteredClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedItem({ ...cls, type: "Class" })}
                  className={`w-full text-left px-2 py-1 rounded-sm text-xs transition border ${
                    selectedItem?.id === cls.id && selectedItem?.type === "Class"
                      ? "bg-[#1E1E1E] text-[#F2F2F2] border-[#2A2A2A] font-semibold"
                      : "text-[#808080] hover:text-[#F2F2F2] border-transparent hover:bg-[#1E1E1E]/50"
                  }`}
                >
                  {cls.id}
                </button>
              ))}
            </div>

            {/* OWL Properties */}
            <div className="space-y-0.5">
              <span className="text-[9px] px-2 py-1 font-bold text-[#808080] uppercase tracking-wider block">OWL Properties</span>
              {filteredProperties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedItem({ ...prop, type: "Property" })}
                  className={`w-full text-left px-2 py-1 rounded-sm text-xs transition border ${
                    selectedItem?.id === prop.id && selectedItem?.type === "Property"
                      ? "bg-[#1E1E1E] text-[#F2F2F2] border-[#2A2A2A] font-semibold"
                      : "text-[#808080] hover:text-[#F2F2F2] border-transparent hover:bg-[#1E1E1E]/50"
                  }`}
                >
                  {prop.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Details Pane */}
        <div className="flex-1 border border-[#2A2A2A] bg-[#171717] p-6 rounded-sm overflow-y-auto space-y-4">
          {selectedItem ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-[#2A2A2A] pb-3">
                <div className="p-2 border border-[#2A2A2A] bg-[#111111]">
                  <BookOpen className="w-4 h-4 text-[#F2F2F2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F2F2F2] uppercase">{selectedItem.id}</h3>
                  <span className="text-[9px] text-[#808080] font-semibold tracking-wider uppercase block mt-0.5">
                    OWL 2 DL {selectedItem.type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-[#808080] font-bold block uppercase">DEFINITION</span>
                <p className="text-xs text-[#B8B8B8] leading-relaxed bg-[#111111] p-3 border border-[#2A2A2A] font-sans">
                  {selectedItem.properties?.description || `Represents an ontological schema node of category ${selectedItem.type.toLowerCase()} mapped inside SBI's shared memory namespace.`}
                </p>
              </div>

              {/* Property specific tags */}
              {selectedItem.type === "Property" && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2 bg-[#111111] border border-[#2A2A2A]">
                    <span className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider block">rdfs:domain</span>
                    <span className="text-[11px] font-mono text-[#F2F2F2] block mt-1">{selectedItem.properties?.domain || "owl:Thing"}</span>
                  </div>
                  <div className="p-2 bg-[#111111] border border-[#2A2A2A]">
                    <span className="text-[9px] text-[#808080] font-semibold uppercase tracking-wider block">rdfs:range</span>
                    <span className="text-[11px] font-mono text-[#F2F2F2] block mt-1">{selectedItem.properties?.range || "owl:Thing"}</span>
                  </div>
                </div>
              )}

              {/* Neosemantics schema mappings */}
              <div className="p-3 bg-[#111111] border border-[#2A2A2A] space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-[#808080]" />
                  <span className="text-[9px] font-bold text-[#F2F2F2] uppercase tracking-wider">Neo4j Neosemantics Mapping</span>
                </div>
                <p className="text-[11px] text-[#808080] leading-relaxed font-sans">
                  Mapped under prefix <span className="font-mono text-[#F2F2F2] border border-[#2A2A2A] bg-[#171717] px-1">sbi:</span>. Class mappings translate to node labels during Neosemantics loading, while Object Properties correspond to Graph Relationships.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-2 text-center text-[#808080]">
              <HelpCircle className="w-6 h-6 text-[#808080]" />
              <p className="text-[10px] uppercase font-bold tracking-wider">Awaiting selection...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
