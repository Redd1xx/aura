"use client";

import React, { useState, useEffect } from "react";
import { AuraTradingChart } from "../components/AuraTradingChart";
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Globe,
  Wallet,
  Settings,
  Maximize2,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  Percent,
  Sliders,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Coins,
  Cpu,
} from "lucide-react";
import { playTick, playOrderSubmit, playDepositChime } from "../lib/audio";
import { createPublicClient, http, formatEther } from "viem";
import { monadTestnet } from "../config/monad";

export default function Home() {
  const [selectedPair, setSelectedPair] = useState("MON-PERP");
  const [activeTab, setActiveTab] = useState<"positions" | "credit_accounts" | "isolated_markets" | "trades">("credit_accounts");
  const [orderSide, setOrderSide] = useState<"buy" | "sell">("buy");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [orderAmount, setOrderAmount] = useState<string>("5.0");
  const [orderPrice, setOrderPrice] = useState<string>("24.85");
  const [leverage, setLeverage] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  // Live pairs
  const pairs = [
    { name: "MON-PERP", price: "24.85", change: "+12.4%", vol: "$148.2M", high: "26.40", low: "21.90", funding: "0.0100%" },
    { name: "USDT-PERP", price: "24.84", change: "+12.1%", vol: "$84.6M", high: "25.80", low: "21.85", funding: "0.0085%" },
    { name: "CHOG-PERP", price: "0.0420", change: "+38.4%", vol: "$22.1M", high: "0.0480", low: "0.0310", funding: "0.0240%" },
    { name: "DAK-PERP", price: "1.18", change: "-2.1%", vol: "$9.4M", high: "1.24", low: "1.12", funding: "0.0050%" },
  ];

  const currentPair = pairs.find((p) => p.name === selectedPair) || pairs[0];

  // Gearbox-style Credit Accounts
  const creditAccounts = [
    {
      id: "CA-0x491a",
      name: "Kuru High-Frequency Scalper",
      borrowed: "14.50 MON",
      collateral: "22.00 MON",
      totalExposure: "36.50 MON",
      leverage: "2.6x",
      healthFactor: 1.82,
      healthStatus: "HEALTHY",
      router: "Kuru CLOB Router (0xcf7e...)",
      pnl: "+14.8%",
    },
    {
      id: "CA-0x892b",
      name: "T3tris Automated Rebalancer",
      borrowed: "28.00 MON",
      collateral: "35.00 MON",
      totalExposure: "63.00 MON",
      leverage: "4.0x",
      healthFactor: 1.65,
      healthStatus: "HEALTHY",
      router: "T3tris LP Vault (0x5fbd...)",
      pnl: "+22.4%",
    },
    {
      id: "CA-0x12c4",
      name: "Cross-DEX Arbitrage Worker",
      borrowed: "6.20 MON",
      collateral: "8.00 MON",
      totalExposure: "14.20 MON",
      leverage: "1.8x",
      healthFactor: 1.48,
      healthStatus: "MODERATE",
      router: "Multi-Pool Router (0x33e1...)",
      pnl: "+8.1%",
    },
  ];

  // Morpho-style Isolated Markets
  const isolatedMarkets = [
    { pair: "MON / USDC", lltv: "86.0%", curator: "Advance Risk Engine v2", supplied: "142.50 MON", borrowed: "38.45 MON", supplyApy: "14.2%", borrowApr: "4.8%", util: 27 },
    { pair: "MON / USDT", lltv: "84.0%", curator: "T3tris Algorithmic", supplied: "98.20 MON", borrowed: "34.10 MON", supplyApy: "13.9%", borrowApr: "5.1%", util: 35 },
    { pair: "CHOG / MON", lltv: "77.0%", curator: "Chog Community Risk", supplied: "45.00 MON", borrowed: "28.00 MON", supplyApy: "28.4%", borrowApr: "8.6%", util: 62 },
    { pair: "DAK / MON", lltv: "80.0%", curator: "Dakota Institutional", supplied: "32.10 MON", borrowed: "15.40 MON", supplyApy: "19.5%", borrowApr: "6.2%", util: 48 },
  ];

  // Kuru DEX Orderbook Asks & Bids
  const orderbookAsks = [
    { price: "24.94", size: "18,450.0", total: "459,205", depth: "95%" },
    { price: "24.92", size: "14,200.5", total: "353,876", depth: "80%" },
    { price: "24.90", size: "9,850.0", total: "245,265", depth: "62%" },
    { price: "24.88", size: "6,410.2", total: "159,485", depth: "45%" },
    { price: "24.86", size: "3,110.0", total: "77,314", depth: "25%" },
  ];

  const orderbookBids = [
    { price: "24.84", size: "4,210.5", total: "104,588", depth: "28%" },
    { price: "24.82", size: "8,940.0", total: "221,890", depth: "52%" },
    { price: "24.80", size: "15,200.2", total: "376,964", depth: "75%" },
    { price: "24.78", size: "22,150.0", total: "548,877", depth: "88%" },
    { price: "24.75", size: "31,400.0", total: "777,150", depth: "100%" },
  ];

  const handleExecuteTrade = async () => {
    playTick();
    setIsSubmitting(true);
    setTxSuccess(null);
    try {
      const client = createPublicClient({
        chain: monadTestnet,
        transport: http("https://testnet-rpc.monad.xyz"),
      });
      const block = await client.getBlock({ blockTag: "latest" });
      playOrderSubmit();
      setTxSuccess(`Order executed on Monad Cancun! Block #${block.number} confirmed with 340ms finality.`);
    } catch (e: any) {
      alert("Order error: " + e?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#07090e] text-[#e1e4ea] font-sans flex flex-col overflow-hidden select-none">
      {/* 1. TOP DOCKED HEADER BAR (Hyperliquid / dYdX style) */}
      <header className="h-11 bg-[#0a0d14] border-b border-[#1b202e] px-3 flex items-center justify-between shrink-0 text-xs font-mono">
        {/* Left: Brand & Market Selector Dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-[#00f0ff] to-[#0088ff] flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.4)]">
              <Zap className="w-3.5 h-3.5 text-black font-bold" />
            </div>
            <span className="font-extrabold text-white tracking-wider text-sm font-sans">AURA</span>
          </div>

          {/* Pair Dropdown Pill */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#121622] hover:bg-[#1a2030] border border-[#22293d] text-white font-bold transition-all">
              <span>{currentPair.name}</span>
              <span className="text-emerald-400 text-[11px]">{currentPair.price}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#0e121c] border border-[#22293d] rounded-lg shadow-2xl py-1 hidden group-hover:block z-50">
              {pairs.map((p) => (
                <div
                  key={p.name}
                  onClick={() => {
                    playTick();
                    setSelectedPair(p.name);
                  }}
                  className="px-3 py-1.5 hover:bg-[#161d2d] cursor-pointer flex justify-between items-center text-xs"
                >
                  <span className="font-bold text-white">{p.name}</span>
                  <span className={p.change.startsWith("+") ? "text-emerald-400" : "text-red-400"}>
                    {p.price} ({p.change})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Stats Strip */}
          <div className="hidden lg:flex items-center gap-5 text-[11px] text-neutral-400 border-l border-[#1b202e] pl-4">
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">24h Change</span>
              <span className="text-emerald-400 font-bold">{currentPair.change}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">24h High</span>
              <span className="text-neutral-200">{currentPair.high}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">24h Low</span>
              <span className="text-neutral-200">{currentPair.low}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">24h Monad Volume</span>
              <span className="text-amber-400">{currentPair.vol}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[9px] uppercase">1h Funding</span>
              <span className="text-[#00f0ff]">{currentPair.funding}</span>
            </div>
          </div>
        </div>

        {/* Right: Network Status, Account & Wallet */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Monad Cancun Testnet · 10,000 TPS</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#121622] border border-[#22293d] text-neutral-300">
            <span className="text-neutral-500 text-[10px]">Equity:</span>
            <span className="text-white font-bold">$10,480.20</span>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-[#00f0ff] to-[#0099ff] hover:brightness-110 text-black font-bold text-xs transition-all shadow-md">
            <Wallet className="w-3.5 h-3.5" />
            <span>0x71c...99a2</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN DOCKED WORKSTATION (Left: Chart & Tables | Center: Orderbook | Right: Order Form) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Chart + Docked Bottom Panel */}
        <div className="flex-1 flex flex-col border-r border-[#1b202e] min-w-0">
          {/* Top: Candlestick Chart Stage (TradingView style) */}
          <div className="h-[58%] border-b border-[#1b202e] flex flex-col min-h-0 bg-[#07090e]">
            <AuraTradingChart pair={selectedPair} />
          </div>

          {/* Bottom Docked Panel: Positions, Gearbox Credit Accounts, Morpho Markets */}
          <div className="flex-1 flex flex-col bg-[#080b12] min-h-0">
            {/* Dock Tabs Header */}
            <div className="h-9 bg-[#0b0e17] border-b border-[#1b202e] px-3 flex items-center justify-between shrink-0 font-mono text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playTick();
                    setActiveTab("credit_accounts");
                  }}
                  className={`px-3 py-1 rounded-t text-xs font-bold transition-all ${
                    activeTab === "credit_accounts"
                      ? "text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#101522]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Credit Accounts ({creditAccounts.length})
                </button>
                <button
                  onClick={() => {
                    playTick();
                    setActiveTab("isolated_markets");
                  }}
                  className={`px-3 py-1 rounded-t text-xs font-bold transition-all ${
                    activeTab === "isolated_markets"
                      ? "text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#101522]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Isolated Markets (Morpho)
                </button>
                <button
                  onClick={() => {
                    playTick();
                    setActiveTab("positions");
                  }}
                  className={`px-3 py-1 rounded-t text-xs font-bold transition-all ${
                    activeTab === "positions"
                      ? "text-[#00f0ff] border-b-2 border-[#00f0ff] bg-[#101522]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Open Positions (3)
                </button>
              </div>

              <div className="text-[10px] text-neutral-500 font-mono">
                Continuous Clearing Active
              </div>
            </div>

            {/* Tab Content Body (Scrollable Table) */}
            <div className="flex-1 overflow-auto p-3 font-mono text-xs">
              {activeTab === "credit_accounts" && (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-neutral-500 text-[10px] uppercase border-b border-[#1b202e] pb-1.5">
                      <th className="pb-2">Account ID</th>
                      <th className="pb-2">Agent Operator</th>
                      <th className="pb-2">Collateral</th>
                      <th className="pb-2">Advance Debt</th>
                      <th className="pb-2">Exposure</th>
                      <th className="pb-2">Leverage</th>
                      <th className="pb-2">Health Factor</th>
                      <th className="pb-2">PnL</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#151a26]">
                    {creditAccounts.map((ca) => (
                      <tr key={ca.id} className="hover:bg-[#0e121c] transition-colors">
                        <td className="py-2.5 font-bold text-[#00f0ff]">{ca.id}</td>
                        <td className="py-2.5 text-white">{ca.name}</td>
                        <td className="py-2.5 text-neutral-300">{ca.collateral}</td>
                        <td className="py-2.5 text-amber-300">{ca.borrowed}</td>
                        <td className="py-2.5 text-white font-bold">{ca.totalExposure}</td>
                        <td className="py-2.5 text-neutral-200">{ca.leverage}</td>
                        <td className="py-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                            {ca.healthFactor} (Safe)
                          </span>
                        </td>
                        <td className="py-2.5 text-emerald-400 font-bold">{ca.pnl}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => playTick()}
                            className="px-2 py-1 rounded bg-[#161c2a] hover:bg-[#20283c] border border-white/10 text-[10px] text-neutral-300 font-bold"
                          >
                            Manage Multicall
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === "isolated_markets" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {isolatedMarkets.map((m) => (
                    <div key={m.pair} className="p-3 rounded-lg bg-[#0c1018] border border-[#1b202e] space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-bold">{m.pair}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-300 font-bold">LLTV {m.lltv}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 truncate">Curator: {m.curator}</div>
                      <div className="flex justify-between text-[11px] pt-1 border-t border-white/[0.04]">
                        <div>
                          <span className="text-neutral-500 block text-[9px]">Supply APY</span>
                          <span className="text-emerald-400 font-bold">{m.supplyApy}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-neutral-500 block text-[9px]">Borrow APR</span>
                          <span className="text-amber-300 font-bold">{m.borrowApr}</span>
                        </div>
                      </div>
                      <div className="w-full h-1 rounded-full bg-black/60 overflow-hidden">
                        <div style={{ width: `${m.util}%` }} className="h-full bg-emerald-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "positions" && (
                <div className="text-center py-6 text-neutral-500">
                  3 Active Leveraged Credit Lines Operating via Continuous Advance Clearing
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: High-Density Orderbook (Kuru DEX CLOB) */}
        <div className="w-64 border-r border-[#1b202e] flex flex-col bg-[#07090e] shrink-0 font-mono text-xs">
          {/* Orderbook Header */}
          <div className="h-9 bg-[#0a0d14] border-b border-[#1b202e] px-2.5 flex items-center justify-between shrink-0">
            <span className="font-bold text-neutral-300 text-[11px] uppercase">Orderbook</span>
            <span className="text-[10px] text-neutral-500">0.01 Tick</span>
          </div>

          <div className="flex-1 flex flex-col justify-between p-2 text-[11px]">
            {/* Asks (Red) */}
            <div className="space-y-0.5">
              <div className="text-[9px] text-neutral-500 flex justify-between px-1 mb-1">
                <span>PRICE</span>
                <span>SIZE</span>
                <span>TOTAL</span>
              </div>
              {orderbookAsks.map((ask, i) => (
                <div
                  key={i}
                  className="relative flex justify-between px-1 py-0.5 rounded text-[11px] overflow-hidden hover:bg-red-500/10 cursor-pointer"
                >
                  <div
                    className="absolute top-0 right-0 bottom-0 bg-red-500/15 pointer-events-none"
                    style={{ width: ask.depth }}
                  />
                  <span className="font-bold text-red-400 relative z-10">{ask.price}</span>
                  <span className="text-neutral-300 relative z-10">{ask.size}</span>
                  <span className="text-neutral-500 relative z-10">{ask.total}</span>
                </div>
              ))}
            </div>

            {/* Mid Price Spread Bar */}
            <div className="my-2 py-1.5 px-2 rounded bg-[#0f1422] border border-[#1b202e] flex items-center justify-between">
              <span className="text-sm font-bold text-[#00f0ff]">{currentPair.price}</span>
              <span className="text-[10px] text-emerald-400">0.02 Spread</span>
            </div>

            {/* Bids (Green) */}
            <div className="space-y-0.5">
              {orderbookBids.map((bid, i) => (
                <div
                  key={i}
                  className="relative flex justify-between px-1 py-0.5 rounded text-[11px] overflow-hidden hover:bg-emerald-500/10 cursor-pointer"
                >
                  <div
                    className="absolute top-0 right-0 bottom-0 bg-emerald-500/15 pointer-events-none"
                    style={{ width: bid.depth }}
                  />
                  <span className="font-bold text-emerald-400 relative z-10">{bid.price}</span>
                  <span className="text-neutral-300 relative z-10">{bid.size}</span>
                  <span className="text-neutral-500 relative z-10">{bid.total}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Entry & Credit Station */}
        <div className="w-80 flex flex-col bg-[#090c13] shrink-0 font-mono text-xs overflow-auto">
          {/* Order Header Tabs */}
          <div className="h-9 bg-[#0b0e17] border-b border-[#1b202e] flex items-center shrink-0">
            <button
              onClick={() => {
                playTick();
                setOrderSide("buy");
              }}
              className={`flex-1 h-full font-bold text-xs transition-all ${
                orderSide === "buy" ? "bg-emerald-500/15 text-emerald-400 border-b-2 border-emerald-400" : "text-neutral-400"
              }`}
            >
              Deposit / Long
            </button>
            <button
              onClick={() => {
                playTick();
                setOrderSide("sell");
              }}
              className={`flex-1 h-full font-bold text-xs transition-all ${
                orderSide === "sell" ? "bg-red-500/15 text-red-400 border-b-2 border-red-400" : "text-neutral-400"
              }`}
            >
              Borrow / Short
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Order Type Toggle */}
              <div className="flex bg-[#05070c] p-1 rounded-lg border border-[#1b202e] text-[11px]">
                <button
                  onClick={() => setOrderType("market")}
                  className={`flex-1 py-1 rounded font-bold transition-all ${
                    orderType === "market" ? "bg-[#161d2d] text-white" : "text-neutral-500"
                  }`}
                >
                  Market
                </button>
                <button
                  onClick={() => setOrderType("limit")}
                  className={`flex-1 py-1 rounded font-bold transition-all ${
                    orderType === "limit" ? "bg-[#161d2d] text-white" : "text-neutral-500"
                  }`}
                >
                  Limit
                </button>
              </div>

              {/* Order Amount Input */}
              <div>
                <label className="text-neutral-400 text-[10px] block mb-1 uppercase">Collateral Deposit</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={orderAmount}
                    onChange={(e) => setOrderAmount(e.target.value)}
                    className="w-full bg-[#05070c] border border-[#1b202e] rounded-lg px-3 py-2 text-white font-bold focus:border-[#00f0ff] outline-none"
                  />
                  <span className="absolute right-3 top-2 text-neutral-500 text-xs">MON</span>
                </div>
              </div>

              {/* Leverage Slider (Gearbox Style) */}
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-neutral-400">Leverage Exposure</span>
                  <span className="text-amber-400 font-bold">{leverage}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full accent-[#00f0ff] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-neutral-500">
                  <span>1x (100% Equity)</span>
                  <span>5x</span>
                  <span>10x (Max Limit)</span>
                </div>
              </div>

              {/* Position Calculations Card */}
              <div className="p-3 rounded-lg bg-[#05070c] border border-[#1b202e] space-y-2 text-[11px]">
                <div className="flex justify-between text-neutral-400">
                  <span>Borrowed Advance:</span>
                  <span className="text-amber-300 font-bold">
                    {(parseFloat(orderAmount || "0") * (leverage - 1)).toFixed(2)} MON
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Total Buying Power:</span>
                  <span className="text-white font-bold">
                    {(parseFloat(orderAmount || "0") * leverage).toFixed(2)} MON
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Estimated Health Factor:</span>
                  <span className="text-emerald-400 font-bold">
                    {leverage > 1 ? (1 + 1 / (leverage * 0.8)).toFixed(2) : "9.99"} (Safe)
                  </span>
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>Cassie Pre-Flight Risk:</span>
                  <span className="text-[#00f0ff] font-bold">14 / 100 Safe</span>
                </div>
              </div>
            </div>

            {/* Action Button & Confirmation */}
            <div className="space-y-2 pt-2">
              {txSuccess && (
                <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-[10px]">
                  {txSuccess}
                </div>
              )}
              <button
                onClick={handleExecuteTrade}
                disabled={isSubmitting}
                className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 ${
                  orderSide === "buy"
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-black"
                    : "bg-gradient-to-r from-red-500 to-rose-600 hover:brightness-110 text-white"
                }`}
              >
                {isSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>
                  {isSubmitting
                    ? "Routing on Monad Cancun..."
                    : orderSide === "buy"
                    ? `Open ${leverage}x Long Position`
                    : `Borrow & Open ${leverage}x Short`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
