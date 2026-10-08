"use client";

import React, { useState } from "react";
import { AuraTerminal } from "../components/AuraTerminal";
import { Zap, Activity, TrendingUp, Layers, ArrowUpRight, BarChart3 } from "lucide-react";

export default function Home() {
  const [selectedPair, setSelectedPair] = useState("MON/USDC");

  const orderbookBids = [
    { price: "24.84", size: "4,210.5", total: "104,588" },
    { price: "24.82", size: "8,940.0", total: "221,890" },
    { price: "24.80", size: "15,200.2", total: "376,964" },
    { price: "24.78", size: "22,150.0", total: "548,877" },
  ];

  const orderbookAsks = [
    { price: "24.86", size: "3,110.0", total: "77,314" },
    { price: "24.88", size: "7,450.5", total: "185,368" },
    { price: "24.90", size: "12,800.0", total: "318,720" },
    { price: "24.92", size: "19,400.2", total: "483,452" },
  ];

  return (
    <main className="min-h-screen bg-[#05080f] text-[#e6edf8] font-sans aura-terminal-grid flex flex-col">
      {/* Top High-Frequency Header */}
      <header className="border-b border-[#00F0FF]/15 bg-[#090e18]/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#00F0FF]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide text-white uppercase font-mono">AURA VAULT</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/30 font-semibold">
                MONAD TRACK 01
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">Autonomous Liquidity & High-Velocity Credit Clearing</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#00FF87] bg-[#00FF87]/10 px-2.5 py-1 rounded border border-[#00FF87]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
            <span>10,000 TPS Parallel EVM</span>
          </div>
          <span className="text-neutral-400">Chain: <span className="text-white">10143 (Monad Testnet)</span></span>
        </div>
      </header>

      {/* Main Terminal Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Vault Metrics & Cassie Simulation */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <AuraTerminal />
        </div>

        {/* Right Column: Live Kuru DEX Orderbook HUD */}
        <div className="aura-card rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#00F0FF]" />
              <h3 className="text-xs font-bold font-mono uppercase text-white">KURU DEX ORDERBOOK</h3>
            </div>
            <span className="text-xs font-mono text-[#00F0FF] font-semibold">{selectedPair}</span>
          </div>

          {/* Asks (Red) */}
          <div className="space-y-1 font-mono text-xs">
            <div className="text-[10px] text-neutral-500 flex justify-between px-1">
              <span>PRICE (USDC)</span>
              <span>SIZE (MON)</span>
              <span>TOTAL</span>
            </div>
            {orderbookAsks.map((ask, i) => (
              <div key={i} className="flex justify-between px-1 py-1 rounded hover:bg-red-500/10 text-red-400 text-[11px]">
                <span className="font-semibold">{ask.price}</span>
                <span className="text-neutral-300">{ask.size}</span>
                <span className="text-neutral-400">{ask.total}</span>
              </div>
            ))}
          </div>

          {/* Mid Price Ticker */}
          <div className="py-2 px-3 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 flex items-center justify-between font-mono">
            <span className="text-xs text-neutral-300 font-semibold">MID SPREAD</span>
            <span className="text-sm font-bold text-[#00F0FF]">24.85 USDC</span>
          </div>

          {/* Bids (Green) */}
          <div className="space-y-1 font-mono text-xs">
            {orderbookBids.map((bid, i) => (
              <div key={i} className="flex justify-between px-1 py-1 rounded hover:bg-emerald-500/10 text-[#00FF87] text-[11px]">
                <span className="font-semibold">{bid.price}</span>
                <span className="text-neutral-300">{bid.size}</span>
                <span className="text-neutral-400">{bid.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
