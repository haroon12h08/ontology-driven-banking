import React, { useEffect, useState } from "react";
import { useBankingStore, RecommendationData } from "@/store/bankingStore";
import { bankingApi } from "@/lib/api";
import { UserCheck } from "lucide-react";

export const Customer360: React.FC = () => {
  const { customerId, customerProfile, setCustomerProfile, accounts, setAccounts } = useBankingStore();
  const [recommendations, setRecommendations] = useState<RecommendationData[]>([]);

  useEffect(() => {
    const loadCustomerData = async () => {
      const profile = await bankingApi.getCustomerProfile(customerId);
      const accList = await bankingApi.getCustomerAccounts(customerId);
      const recList = await bankingApi.getRecommendations(customerId);

      setCustomerProfile(profile);
      setAccounts(accList);
      setRecommendations(recList);
    };
    loadCustomerData();
  }, [customerId, setCustomerProfile, setAccounts]);

  return (
    <div className="space-y-6 py-6 max-w-5xl mx-auto">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Customer 360 Profile</h2>
        <p className="text-zinc-400 text-sm">Comprehensive view of demographics, risk thresholds, financial accounts, and computed recommendations.</p>
      </div>

      {customerProfile ? (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="glass-panel p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
                {customerProfile.firstName?.[0] || "C"}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {customerProfile.firstName} {customerProfile.lastName}
                </h3>
                <span className="text-xs text-zinc-400 font-light block">Segment: {customerProfile.segment}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right border-r border-white/5 pr-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Credit Score</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{customerProfile.creditScore}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Risk Class</span>
                <span className="text-lg font-mono font-bold text-rose-400">{customerProfile.riskRating}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Demographic Parameters */}
            <div className="glass-panel p-5 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Demographics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Customer ID</span>
                  <span className="text-zinc-300 font-mono">{customerProfile.customerId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Age</span>
                  <span className="text-zinc-300 font-medium">{customerProfile.age}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Occupation</span>
                  <span className="text-zinc-300 font-medium">{customerProfile.occupation || "Consultant"}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Spending Pattern</span>
                  <span className="text-zinc-300 font-medium">{customerProfile.spendingPattern}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-500">Churn Risk</span>
                  <span className="text-zinc-300 font-medium">{customerProfile.churnRisk}</span>
                </div>
              </div>
            </div>

            {/* Accounts Profile */}
            <div className="glass-panel p-5 rounded-xl space-y-4 md:col-span-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Active Accounts ({accounts.length})</h4>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {accounts.map((acc, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded bg-white/[0.01] border border-white/5">
                    <div>
                      <span className="text-zinc-300 font-bold block">{acc.label}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">{acc.accountNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-zinc-200 font-bold block">INR {acc.balance.toLocaleString("en-IN")}</span>
                      <span className="text-[10px] text-zinc-500 block">Available: INR {acc.availableBalance.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations list */}
          <div className="glass-panel p-5 rounded-xl space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest border-b border-white/5 pb-2">Next Best Product Recommendations</h4>
            <div className="grid md:grid-cols-3 gap-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 rounded-lg bg-white/[0.01] border border-white/5 flex flex-col justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-white">{rec.productName}</span>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold">
                        {(rec.score * 100).toFixed(0)}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-normal font-light">{rec.description}</p>
                  </div>
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold block">{rec.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-zinc-500 space-y-2">
          <UserCheck className="w-8 h-8 text-zinc-700 mx-auto" />
          <p className="text-xs">Loading Customer Profile...</p>
        </div>
      )}
    </div>
  );
};
