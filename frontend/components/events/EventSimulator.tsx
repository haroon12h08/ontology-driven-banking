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
      icon: Coins
    },
    {
      name: "EMI Missed",
      desc: "Increases credit risk score and triggers refinance recommendations and collection alerts.",
      data: { amount: 24500.00, accountId: "ACC-273" },
      icon: AlertTriangle
    },
    {
      name: "KYC Expired",
      desc: "Triggers compliance grace warnings and sets digital app renewal notifications.",
      data: {},
      icon: AlertTriangle
    },
    {
      name: "FD Matured",
      desc: "Triggers reinvestment options and Relationship Manager advisory call actions.",
      data: { amount: 500000.00, accountId: "ACC-694" },
      icon: ShieldCheck
    },
    {
      name: "Large Transaction",
      desc: "Routes transaction details through the Fraud Engine to evaluate location & device risks.",
      data: { amount: 65000.00, location: "Mumbai", deviceId: "DEV_X", recent_tx_count_1h: 3 },
      icon: Zap
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
    <div className="flex gap-4 h-[calc(100vh-120px)] font-mono text-xs">
      {/* Event Grid Pane */}
      <div className="flex-1 border border-[#2A2A2A] bg-[#171717] p-4 flex flex-col justify-between overflow-hidden rounded-sm">
        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-[#F2F2F2] uppercase tracking-wider">EVENT STREAM SIMULATOR</h2>
            <p className="text-[#808080] font-sans">
              Inject simulated events into the pipeline to evaluate real-time risk adjustments and recomposed recommendation plans.
            </p>
          </div>

          <div className="space-y-2">
            {eventTypes.map((evt, idx) => {
              const Icon = evt.icon;
              return (
                <div key={idx} className="p-3 border border-[#2A2A2A] bg-[#111111] hover:bg-[#1E1E1E]/50 flex flex-col md:flex-row md:items-center justify-between gap-4 transition duration-150 rounded-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 border border-[#2A2A2A] bg-[#171717]">
                      <Icon className="w-4 h-4 text-[#F2F2F2]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#F2F2F2] uppercase">{evt.name}</h4>
                      <p className="text-[10px] text-[#808080] font-sans">{evt.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleTriggerEvent(evt.name, evt.data)}
                    disabled={isSimulating}
                    className="px-3 py-1.5 bg-[#F2F2F2] hover:bg-[#B8B8B8] disabled:bg-[#1E1E1E] disabled:text-[#808080] text-xs font-semibold text-black transition duration-150 flex-shrink-0 rounded-sm"
                  >
                    INJECT EVENT
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Simulated Event History Log */}
      <div className="w-80 border border-[#2A2A2A] bg-[#171717] flex flex-col justify-between overflow-hidden rounded-sm">
        <div className="p-3 border-b border-[#2A2A2A] bg-[#111111] flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-[#808080]" />
          <h3 className="font-bold text-xs text-[#F2F2F2] uppercase tracking-wider">TELEMETRY PIPELINE OUTPUT</h3>
        </div>

        <div className="flex-1 p-3 overflow-y-auto space-y-3">
          {simulatedEvents.length > 0 ? (
            simulatedEvents.map((evt) => (
              <div key={evt.id} className="p-3 bg-[#111111] border border-[#2A2A2A] space-y-3 rounded-sm">
                <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-2">
                  <span className="font-bold text-[#F2F2F2] uppercase">{evt.eventName}</span>
                  <span className="text-[9px] text-[#808080] font-mono">{evt.timestamp}</span>
                </div>

                {/* Recommendations */}
                {evt.recommendations.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">RECOMMENDATIONS GENERATED</span>
                    {evt.recommendations.map((r, rIdx) => (
                      <div key={rIdx} className="text-[10px] text-[#F2F2F2] bg-[#171717] p-1.5 border border-[#2A2A2A]">
                        {r.productName}
                      </div>
                    ))}
                  </div>
                )}

                {/* Risk Updates */}
                {evt.riskUpdates.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">RISK ADJUSTMENTS</span>
                    {evt.riskUpdates.map((ru, ruIdx) => (
                      <div key={ruIdx} className="text-[10px] text-[#F2F2F2] bg-[#171717] p-1.5 border border-[#2A2A2A]">
                        {ru.type}: {ru.impact}
                      </div>
                    ))}
                  </div>
                )}

                {/* Engagement Alerts */}
                {evt.engagementActions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#808080] font-bold uppercase tracking-wider block">OUTREACH MESSAGE TEMPLATES</span>
                    {evt.engagementActions.map((ea, eaIdx) => (
                      <div key={eaIdx} className="text-[10px] text-[#B8B8B8] leading-relaxed bg-[#0D0D0D] p-2 border border-[#2A2A2A] font-sans">
                        <span className="text-[9px] font-semibold text-[#F2F2F2] font-mono uppercase tracking-wider block mb-0.5">{ea.channel}</span>
                        {ea.message}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-20 text-[#808080] space-y-2">
              <Zap className="w-6 h-6 text-[#808080] mx-auto" />
              <p className="text-[10px] uppercase font-bold tracking-wider">Awaiting event telemetry...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
