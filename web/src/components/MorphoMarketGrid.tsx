"use client";

import React, { useState } from "react";
import { Layers, ShieldCheck, TrendingUp, Percent, ArrowUpRight, Coins } from "lucide-react";
import { playTick, playDepositChime } from "../lib/audio";

interface MorphoMarket {
  id: string;
  collateral: string;
  loanAsset: string;
  lltv: string;
  curator: string;
  totalSupply: string;
  totalBorrow: string;
  supplyApy: string;
  borrowApy: string;
  utilization: number;
}

export const MorphoMarketGrid: React.FC<{ onSelectPair?: (pair: string) => void }> = ({
  onSelectPair,
}) => {
  const [selectedMarketId, setSelectedMarketId] = useState<string>("mon-usdc");

  const markets: MorphoMarket[] = [
    {
      id: "mon-usdc",
      collateral: "MON",
      loanAsset: "USDC",
      lltv: "86.0%",
      curator: "Advance Risk Engine v2",
      totalSupply: "142.50 MON",
      totalBorrow: "38.45 MON",
      supplyApy: "14.2%",
      borrowApy: "4.8%",
      utilization: 27,
    },
    {
      id: "mon-usdt",
      collateral: "MON",
      loanAsset: "USDT",
      lltv: "84.0%",
      curator: "T3tris Automated Vault",
      totalSupply: "98.20 MON",
      totalBorrow: "34.10 MON",
      supplyApy: "13.9%",
      borrowApy: "5.1%",
      utilization: 35,
    },
    {
      id: "chog-mon",
      collateral: "CHOG",
      loanAsset: "MON",
      lltv: "77.0%",
      curator: "Chog Community Risk",
      totalSupply: "45.00 MON",
      totalBorrow: "28.00 MON",
      supplyApy: "28.4%",
      borrowApy: "8.6%",
      utilization: 62,
    },
    {
      id: "dak-mon",
      collateral: "DAK",
      loanAsset: "MON",
      lltv: "80.0%",
      curator: "Dakota Institutional Vault",
      totalSupply: "32.10 MON",
      totalBorrow: "15.40 MON",
      supplyApy: "19.5%",
      borrowApy: "6.2%",
      utilization: 48,
    },
  ];

  const handleSelect = (m: MorphoMarket) => {
    playTick();
    setSelectedMarketId(m.id);
    if (onSelectPair) {
      onSelectPair(`${m.collateral}/${m.loanAsset}`);
    }
  };

  return (
    <div className="aura-card rounded-2xl p-5 flex flex-col gap-4 font-mono text-xs shadow-2xl">
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-3 gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#00f0ff]" />
          <h3 className="text-xs font-bold uppercase text-white tracking-wide">
            MORPHO BLUE-STYLE ISOLATED MARKETS
          </h3>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 font-bold">
          Permissionless Credit Pools
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {markets.map((m) => {
          const isSelected = selectedMarketId === m.id;
          return (
            <div
              key={m.id}
              onClick={() => handleSelect(m)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                isSelected
                  ? "bg-[#091122] border-[#00f0ff] ring-1 ring-[#00f0ff]/40 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                  : "bg-[#060a12] border-white/[0.06] hover:border-white/[0.15]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">
                      {m.collateral} / {m.loanAsset}
                    </span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-300 font-bold">
                    LLTV {m.lltv}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400 truncate">Curator: {m.curator}</div>
              </div>

              {/* APY Rates */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04] text-[11px]">
                <div>
                  <span className="text-neutral-500 block text-[10px]">Supply APY</span>
                  <span className="text-emerald-400 font-bold text-sm">{m.supplyApy}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Borrow APR</span>
                  <span className="text-amber-300 font-bold text-sm">{m.borrowApy}</span>
                </div>
              </div>

              {/* Utilization Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Utilization</span>
                  <span className="text-white font-semibold">{m.utilization}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/60 overflow-hidden">
                  <div
                    style={{ width: `${m.utilization}%` }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-[#00f0ff]"
                  />
                </div>
                <div className="flex justify-between text-[9px] text-neutral-500 pt-0.5">
                  <span>Supply: {m.totalSupply}</span>
                  <span>Debt: {m.totalBorrow}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
