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
    <div className="space-y-6 py-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">OWL Ontology Schema Navigator</h2>
        <p className="text-zinc-400 text-sm">
          Browse OWL classes, Object Properties, and Data Properties imported directly from the formal ontology (`banking.ttl`).
        </p>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Left List Pane */}
        <div className="w-80 glass-panel rounded-xl flex flex-col justify-between overflow-hidden">
          {/* Search bar */}
          <div className="p-3 border-b border-white/5 bg-black/20 flex items-center gap-2">
            <Search className="w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search concepts..."
              className="bg-transparent text-xs text-white outline-none w-full placeholder-zinc-500"
            />
          </div>

          {/* List area */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4">
            {/* OWL Classes */}
            <div className="space-y-1">
              <span className="text-[10px] px-2 font-bold text-zinc-500 uppercase tracking-widest block">OWL Classes</span>
              {filteredClasses.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedItem({ ...cls, type: "Class" })}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                    selectedItem?.id === cls.id && selectedItem?.type === "Class"
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {cls.id}
                </button>
              ))}
            </div>

            {/* OWL Properties */}
            <div className="space-y-1">
              <span className="text-[10px] px-2 font-bold text-zinc-500 uppercase tracking-widest block">OWL Properties</span>
              {filteredProperties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedItem({ ...prop, type: "Property" })}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition ${
                    selectedItem?.id === prop.id && selectedItem?.type === "Property"
                      ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-medium"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.02]"
                  }`}
                >
                  {prop.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Details Pane */}
        <div className="flex-1 glass-panel p-6 rounded-xl overflow-y-auto space-y-6">
          {selectedItem ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedItem.id}</h3>
                  <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
                    OWL 2 DL {selectedItem.type}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-xs text-zinc-400 font-semibold block">Definition</span>
                <p className="text-sm text-zinc-300 leading-relaxed font-light bg-white/[0.01] p-4 rounded-lg border border-white/5">
                  {selectedItem.properties?.description || `Represents an ontological schema node of category ${selectedItem.type.toLowerCase()} mapped inside SBI's shared memory namespace.`}
                </p>
              </div>

              {/* Property specific tags */}
              {selectedItem.type === "Property" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">rdfs:domain</span>
                    <span className="text-xs font-mono text-zinc-300 block mt-1">{selectedItem.properties?.domain || "owl:Thing"}</span>
                  </div>
                  <div className="p-3 rounded bg-white/[0.01] border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">rdfs:range</span>
                    <span className="text-xs font-mono text-zinc-300 block mt-1">{selectedItem.properties?.range || "owl:Thing"}</span>
                  </div>
                </div>
              )}

              {/* Neosemantics schema mappings */}
              <div className="p-4 rounded-lg bg-blue-600/5 border border-blue-500/10 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Network className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Neo4j Neosemantics mapping</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Configured under namespace prefix <span className="font-mono text-blue-400">sbi:</span>. Class mappings translate to node labels during Neosemantics loading, while Object Properties correspond directly to Graph Relationships.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full space-y-2 text-center text-zinc-500">
              <HelpCircle className="w-8 h-8 text-zinc-700" />
              <p className="text-xs">Select any ontological Class or Property to view metadata and properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
