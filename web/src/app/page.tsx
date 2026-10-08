"use client";

import React, { useState } from "react";
import { AuraTerminal } from "../components/AuraTerminal";
import { AuraTradingChart } from "../components/AuraTradingChart";
import {
  Zap,
  Activity,
  TrendingUp,
  Layers,
  ArrowUpRight,
  BarChart3,
  Globe,
  Wallet,
  ShieldCheck,
  Clock,
  ArrowDownRight,
} from "lucide-react";
import { playTick } from "../lib/audio";

export default function Home() {
  const [selectedPair, setSelectedPair] = useState("MON/USDC");

  const pairs = [
    { name: "MON/USDC", price: "24.85", change: "+12.4%", vol: "$148.2M", isUp: true },
    { name: "MON/USDT", price: "24.84", change: "+12.1%", vol: "$84.6M", isUp: true },
    { name: "CHOG/MON", price: "0.0420", change: "+38.4%", vol: "$22.1M", isUp: true },
    { name: "DAK/MON", price: "1.18", change: "-2.1%", vol: "$9.4M", isUp: false },
  ];

  const orderbookBids = [
    { price: "24.84", size: "4,210.5", total: "104,588", width: "45%" },
    { price: "24.82", size: "8,940.0", total: "221,890", width: "68%" },
    { price: "24.80", size: "15,200.2", total: "376,964", width: "85%" },
    { price: "24.78", size: "22,150.0", total: "548,877", width: "95%" },
    { price: "24.75", size: "31,400.0", total: "777,150", width: "100%" },
  ];

  const orderbookAsks = [
    { price: "24.95", size: "28,300.0", total: "706,085", width: "100%" },
    { price: "24.92", size: "19,400.2", total: "483,452", width: "88%" },
    { price: "24.90", size: "12,800.0", total: "318,720", width: "70%" },
    { price: "24.88", size: "7,450.5", total: "185,368", width: "52%" },
    { price: "24.86", size: "3,110.0", total: "77,314", width: "35%" },
  ];

  const liveTrades = [
    { side: "BUY", price: "24.85", size: "250.0 MON", time: "12:04:18", latency: "340ms" },
    { side: "BUY", price: "24.85", size: "1,200.0 MON", time: "12:04:17", latency: "380ms" },
    { side: "SELL", price: "24.84", size: "450.0 MON", time: "12:04:15", latency: "320ms" },
    { side: "BUY", price: "24.85", size: "3,000.0 MON", time: "12:04:12", latency: "390ms" },
    { side: "SELL", price: "24.84", size: "820.0 MON", time: "12:04:09", latency: "350ms" },
  ];

  const currentPairData = pairs.find((p) => p.name === selectedPair) || pairs[0];

  return (
    <main className="min-h-screen bg-[#05080f] text-[#e6edf8] font-sans aura-terminal-grid flex flex-col">
      {/* Top High-Frequency Institutional Header */}
      <header className="border-b border-[#00f0ff]/15 bg-[#090e18]/95 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00f0ff]/15 border border-[#00f0ff]/40 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.25)]">
              <Zap className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-wider text-white uppercase font-mono">
                  AURA VAULT
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 font-bold">
                  TRACK 01: ONCHAIN FINANCE
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono">
                Autonomous Liquidity, Continuous Credit Clearing & Kuru DEX Terminal
              </p>
            </div>
          </div>
        </div>

        {/* Global Telemetry & Network Status */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e1422] border border-white/[0.08] text-neutral-300">
            <Globe className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>Monad Cancun Testnet (10143)</span>
          </div>

          <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">10,000 TPS Parallel EVM</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00f0ff]/20 to-[#00f0ff]/10 border border-[#00f0ff]/40 text-white font-semibold">
            <Wallet className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span>0x71c...99a2</span>
          </div>
        </div>
      </header>

      {/* High-Velocity Financial Market Bar */}
      <section className="bg-[#070b14] border-b border-white/[0.06] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        {/* Pair Switcher Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {pairs.map((p) => (
            <button
              key={p.name}
              onClick={() => {
                playTick();
                setSelectedPair(p.name);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 ${
                selectedPair === p.name
                  ? "bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/50 shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                  : "bg-[#0c1220] text-neutral-400 border border-white/[0.04] hover:text-white"
              }`}
            >
              <span>{p.name}</span>
              <span className={p.isUp ? "text-emerald-400 text-[11px]" : "text-red-400 text-[11px]"}>
                {p.change}
              </span>
            </button>
          ))}
        </div>

        {/* Live Pair Metrics */}
        <div className="flex items-center gap-6 text-[11px] text-neutral-400">
          <div>
            <span className="block text-[10px] text-neutral-500">LAST PRICE</span>
            <span className="text-white font-bold text-sm">{currentPairData.price} USDC</span>
          </div>
          <div>
            <span className="block text-[10px] text-neutral-500">24H HIGH</span>
            <span className="text-emerald-400 font-semibold">26.40 USDC</span>
          </div>
          <div>
            <span className="block text-[10px] text-neutral-500">24H LOW</span>
            <span className="text-red-400 font-semibold">21.90 USDC</span>
          </div>
          <div>
            <span className="block text-[10px] text-neutral-500">24H MONAD VOL</span>
            <span className="text-amber-400 font-semibold">{currentPairData.vol}</span>
          </div>
          <div>
            <span className="block text-[10px] text-neutral-500">ADVANCE LINE APR</span>
            <span className="text-[#00f0ff] font-semibold">4.8% Continuous</span>
          </div>
        </div>
      </section>

      {/* Full-Bleed Main Terminal Arena */}
      <div className="flex-1 px-4 sm:px-6 py-6 w-full max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Column (8 Cols): Candlestick Stage & Aura Vault Operations */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          {/* Interactive 60fps Candlestick Chart */}
          <AuraTradingChart pair={selectedPair} />

          {/* Full Interactive Aura Terminal (Borrow/Deposit/Cassie/Positions) */}
          <AuraTerminal />
        </div>

        {/* Right Column (4 Cols): High-Density Kuru DEX Orderbook & Live Monad Trades */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          {/* Kuru Orderbook */}
          <div className="aura-card rounded-2xl p-5 flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#00f0ff]" />
                <h3 className="text-xs font-bold uppercase text-white tracking-wide">
                  KURU DEX ORDERBOOK
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] font-bold border border-[#00f0ff]/30">
                  {selectedPair}
                </span>
                <span className="text-[10px] text-emerald-400">0.01 Tick</span>
              </div>
            </div>

            {/* Asks (Sells / Red) */}
            <div className="space-y-1">
              <div className="text-[10px] text-neutral-500 flex justify-between px-1 mb-1">
                <span>PRICE (USDC)</span>
                <span>SIZE (MON)</span>
                <span>TOTAL</span>
              </div>
              {orderbookAsks.map((ask, i) => (
                <div
                  key={i}
                  className="relative flex justify-between px-1.5 py-1 rounded text-[11px] overflow-hidden hover:bg-red-500/10 cursor-pointer"
                >
                  <div
                    className="absolute top-0 right-0 bottom-0 bg-red-500/15 pointer-events-none transition-all duration-300"
                    style={{ width: ask.width }}
                  />
                  <span className="font-bold text-red-400 relative z-10">{ask.price}</span>
                  <span className="text-neutral-300 relative z-10">{ask.size}</span>
                  <span className="text-neutral-500 relative z-10">{ask.total}</span>
                </div>
              ))}
            </div>

            {/* Mid Price Spread Bar */}
            <div className="py-2.5 px-3.5 rounded-xl bg-[#0e1626] border border-[#00f0ff]/30 flex items-center justify-between shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 font-semibold">MID SPREAD</span>
                <span className="text-sm font-bold text-[#00f0ff]">
                  {currentPairData.price} USDC
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold">0.02 Spread (0.08%)</span>
            </div>

            {/* Bids (Buys / Green) */}
            <div className="space-y-1">
              {orderbookBids.map((bid, i) => (
                <div
                  key={i}
                  className="relative flex justify-between px-1.5 py-1 rounded text-[11px] overflow-hidden hover:bg-emerald-500/10 cursor-pointer"
                >
                  <div
                    className="absolute top-0 right-0 bottom-0 bg-emerald-500/15 pointer-events-none transition-all duration-300"
                    style={{ width: bid.width }}
                  />
                  <span className="font-bold text-emerald-400 relative z-10">{bid.price}</span>
                  <span className="text-neutral-300 relative z-10">{bid.size}</span>
                  <span className="text-neutral-500 relative z-10">{bid.total}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Monad Cancun Trades Ticker */}
          <div className="aura-card rounded-2xl p-5 flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase text-white tracking-wide">
                  REAL-TIME MONAD TRADES
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>340ms Latency</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-neutral-500 flex justify-between px-1">
                <span>SIDE / PRICE</span>
                <span>SIZE</span>
                <span>TIME / LATENCY</span>
              </div>
              {liveTrades.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#05080f] border border-white/[0.04] text-[11px]"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                        t.side === "BUY" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {t.side}
                    </span>
                    <span className="text-white font-semibold">{t.price}</span>
                  </div>
                  <span className="text-neutral-300 font-medium">{t.size}</span>
                  <div className="text-right">
                    <span className="text-neutral-500 block text-[10px]">{t.time}</span>
                    <span className="text-[#00f0ff] font-semibold text-[10px]">{t.latency}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto p-3 rounded-xl bg-[#090d18] border border-white/[0.06] text-[11px] text-neutral-400 space-y-1">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cancun Parallel EVM Execution</span>
              </div>
              <p>Transactions clear concurrently across independent account states with zero order queue lock.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
