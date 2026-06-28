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
    <div className="space-y-6 py-4 max-w-5xl mx-auto font-mono text-xs">
      <div className="space-y-1">
        <h2 className="text-sm font-bold text-[#F2F2F2] uppercase tracking-wider">CUSTOMER 360 PROFILE</h2>
        <p className="text-[#808080] font-sans">demographics, risk thresholds, financial accounts, and computed product recommendations.</p>
      </div>

      {customerProfile ? (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 border border-[#2A2A2A] bg-[#111111] flex items-center justify-center text-[#F2F2F2] font-bold text-sm">
                {customerProfile.firstName?.[0] || "C"}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#F2F2F2] uppercase">
                  {customerProfile.firstName} {customerProfile.lastName}
                </h3>
                <span className="text-[10px] text-[#808080] block mt-0.5">SEGMENT: {customerProfile.segment.toUpperCase()}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-right border-r border-[#2A2A2A] pr-4">
                <span className="text-[9px] text-[#808080] font-bold uppercase block">CREDIT SCORE</span>
                <span className="text-sm font-mono font-bold text-[#F2F2F2]">{customerProfile.creditScore}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-[#808080] font-bold uppercase block">RISK CLASS</span>
                <span className="text-sm font-mono font-bold text-[#F2F2F2] border border-[#2A2A2A] bg-[#111111] px-1">{customerProfile.riskRating}</span>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Demographic Parameters */}
            <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3">
              <h4 className="text-[10px] font-bold text-[#808080] uppercase tracking-wider border-b border-[#2A2A2A] pb-1.5">DEMOGRAPHICS</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#808080]">CUSTOMER ID</span>
                  <span className="text-[#F2F2F2] font-mono">{customerProfile.customerId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#808080]">AGE</span>
                  <span className="text-[#F2F2F2] font-medium">{customerProfile.age}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#808080]">OCCUPATION</span>
                  <span className="text-[#F2F2F2] font-medium">{customerProfile.occupation || "Consultant"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#808080]">SPENDING</span>
                  <span className="text-[#F2F2F2] font-medium">{customerProfile.spendingPattern}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#808080]">CHURN RISK</span>
                  <span className="text-[#F2F2F2] font-medium">{customerProfile.churnRisk}</span>
                </div>
              </div>
            </div>

            {/* Accounts Profile */}
            <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3 md:col-span-2">
              <h4 className="text-[10px] font-bold text-[#808080] uppercase tracking-wider border-b border-[#2A2A2A] pb-1.5">ACTIVE ACCOUNTS ({accounts.length})</h4>
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {accounts.map((acc, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-[#111111] border border-[#2A2A2A] rounded-sm">
                    <div>
                      <span className="text-[#F2F2F2] font-bold block">{acc.label.toUpperCase()}</span>
                      <span className="text-[9px] text-[#808080] font-mono">{acc.accountNumber}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#F2F2F2] font-bold block">INR {acc.balance.toLocaleString("en-IN")}</span>
                      <span className="text-[9px] text-[#808080] block font-sans">AVAILABLE: INR {acc.availableBalance.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations list */}
          <div className="border border-[#2A2A2A] bg-[#171717] p-4 rounded-sm space-y-3">
            <h4 className="text-[10px] font-bold text-[#808080] uppercase tracking-wider border-b border-[#2A2A2A] pb-1.5">RECOMMENDED ACTIONS & SUITABILITIES</h4>
            <div className="grid md:grid-cols-3 gap-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 bg-[#111111] border border-[#2A2A2A] flex flex-col justify-between gap-3 rounded-sm">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-[#F2F2F2] uppercase">{rec.productName}</span>
                      <span className="text-[9px] px-1.5 py-0.5 border border-[#2A2A2A] bg-[#171717] text-[#F2F2F2] font-mono font-semibold">
                        {(rec.score * 100).toFixed(0)}% MATCH
                      </span>
                    </div>
                    <p className="text-[10px] text-[#808080] leading-normal font-sans">{rec.description}</p>
                  </div>
                  <span className="text-[9px] text-[#808080] uppercase tracking-wider font-semibold block">{rec.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-[#808080] space-y-2 border border-[#2A2A2A] bg-[#171717] rounded-sm">
          <UserCheck className="w-6 h-6 text-[#808080] mx-auto" />
          <p className="text-[10px] uppercase font-bold tracking-wider">Awaiting profile loading...</p>
        </div>
      )}
    </div>
  );
};
