import React, { useState } from "react";
import { useBankingStore, SimulatedEvent } from "@/store/bankingStore";
import { bankingApi } from "@/lib/api";
import { Zap, Coins, AlertTriangle, ShieldCheck, ClipboardList } from "lucide-react";

export const EventSimulator: React.FC = () => {
  const { customerId, simulatedEvents, addSimulatedEvent } = useBankingStore();
  const [isSimulating, setIsSimulating] = useState(false);

  const eventTypes = [
    {
      name: "Salary Credited",
      desc: "Triggers investment recommendations and short-term liquidity risk reduction updates.",
      data: { amount: 150000.00 },
      icon: Coins,
      color: "text-emerald-400"
    },
    {
      name: "EMI Missed",
      desc: "Increases credit risk score and triggers refinance recommendations and collection alerts.",
      data: { amount: 24500.00, accountId: "ACC-273" },
      icon: AlertTriangle,
      color: "text-rose-400"
    },
    {
      name: "KYC Expired",
      desc: "Triggers compliance grace warnings and sets digital app renewal notifications.",
      data: {},
      icon: AlertTriangle,
      color: "text-amber-400"
    },
    {
      name: "FD Matured",
      desc: "Triggers reinvestment options and Relationship Manager advisory call actions.",
      data: { amount: 500000.00, accountId: "ACC-694" },
      icon: ShieldCheck,
      color: "text-purple-400"
    },
    {
      name: "Large Transaction",
      desc: "Routes transaction details through the Fraud Engine to evaluate location & device risks.",
      data: { amount: 65000.00, location: "Mumbai", deviceId: "DEV_X", recent_tx_count_1h: 3 },
      icon: Zap,
      color: "text-blue-400"
    }
  ];

  const handleTriggerEvent = async (eventName: string, eventData: Record<string, unknown>) => {
    setIsSimulating(true);
    try {
      const res = await bankingApi.simulateEvent(customerId, eventName, eventData);
      const eventResponse = res.explainability?.evidence?.event_response || {};

      const simulated: SimulatedEvent = {
        id: Math.random().toString(),
        eventName,
        customerId,
        timestamp: new Date().toLocaleTimeString(),
        recommendations: eventResponse.recommendations || [],
        riskUpdates: eventResponse.risk_updates || [],
        engagementActions: eventResponse.engagement_actions || [],
        reasoningSteps: eventResponse.reasoning_steps || []
      };

      addSimulatedEvent(simulated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Event Grid Pane */}
      <div className="flex-1 glass-panel p-6 rounded-xl flex flex-col justify-between overflow-hidden">
        <div className="space-y-6 overflow-y-auto flex-1 pr-2">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Live Event Stream Simulator</h2>
            <p className="text-zinc-400 text-sm">
              Trigger simulated events to evaluate how the intelligence engines process risk and recompose next-best-action templates.
            </p>
          </div>

          <div className="space-y-4">
            {eventTypes.map((evt, idx) => {
              const Icon = evt.icon;
              return (
                <div key={idx} className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5">
                      <Icon className={`w-5 h-5 ${evt.color}`} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">{evt.name}</h4>
                      <p className="text-xs text-zinc-400 font-light">{evt.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTriggerEvent(evt.name, evt.data)}
                    disabled={isSimulating}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white transition duration-200 flex-shrink-0"
                  >
                    Simulate Event
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulated Event History Log */}
      <div className="w-96 glass-panel flex flex-col justify-between overflow-hidden rounded-xl">
        <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-400" />
          <h3 className="font-bold text-sm text-white">Simulation Output Stream</h3>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {simulatedEvents.length > 0 ? (
            simulatedEvents.map((evt) => (
              <div key={evt.id} className="p-4 rounded-lg bg-white/[0.01] border border-white/5 space-y-3">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-xs font-bold text-blue-400">{evt.eventName}</span>
                  <span className="text-[10px] text-zinc-500">{evt.timestamp}</span>
                </div>

                {/* Recommendations */}
                {evt.recommendations.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Recommendations Created</span>
                    {evt.recommendations.map((r, rIdx) => (
                      <div key={rIdx} className="text-[10px] text-emerald-400 font-mono bg-emerald-500/5 p-1 rounded border border-emerald-500/10">
                        {r.productName}
                      </div>
                    ))}
                  </div>
                )}

                {/* Risk Updates */}
                {evt.riskUpdates.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Risk Adjustments</span>
                    {evt.riskUpdates.map((ru, ruIdx) => (
                      <div key={ruIdx} className="text-[10px] text-amber-400 font-mono bg-amber-500/5 p-1 rounded border border-amber-500/10">
                        {ru.type}: {ru.impact}
                      </div>
                    ))}
                  </div>
                )}

                {/* Engagement Alerts */}
                {evt.engagementActions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Outreach Templates</span>
                    {evt.engagementActions.map((ea, eaIdx) => (
                      <div key={eaIdx} className="text-[10px] text-zinc-300 leading-relaxed bg-black/40 p-2 rounded border border-white/5">
                        <span className="text-[9px] font-semibold text-blue-400 uppercase tracking-widest block mb-0.5">{ea.channel}</span>
                        {ea.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-zinc-500 space-y-2">
              <Zap className="w-8 h-8 text-zinc-700 mx-auto" />
              <p className="text-xs">Trigger events on the left to see reasoning outputs stream live.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
