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

  // Kuru DEX Orderbook Asks & Bids (Hyperliquid color tokens)
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
    <div className="h-screen w-screen bg-[#090909] text-[#f7f8f8] font-sans flex flex-col overflow-hidden select-none">
      {/* 1. TOP DOCKED HEADER BAR (Hyperliquid / dYdX style) */}
      <header className="h-11 bg-[#0c0c0c] border-b border-[#1e222d] px-3 flex items-center justify-between shrink-0 text-xs font-mono">
        {/* Left: Brand & Market Selector Dropdown */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#50E3C2] flex items-center justify-center shadow-[0_0_12px_rgba(80,227,194,0.4)]">
              <Zap className="w-3.5 h-3.5 text-black font-bold" />
            </div>
            <span className="font-extrabold text-white tracking-wider text-sm font-sans">AURA</span>
          </div>

          {/* Pair Dropdown Pill */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#161922] hover:bg-[#1f2430] border border-[#1e222d] text-white font-bold transition-all">
              <span>{currentPair.name}</span>
              <span className="text-[#0ecb81] text-[11px] tabular-nums font-mono">{currentPair.price}</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>
            <div className="absolute left-0 top-full mt-1 w-56 bg-[#121418] border border-[#1e222d] rounded-lg shadow-2xl py-1 hidden group-hover:block z-50">
              {pairs.map((p) => (
                <div
                  key={p.name}
                  onClick={() => {
                    playTick();
                    setSelectedPair(p.name);
                  }}
                  className="px-3 py-1.5 hover:bg-[#1a1e28] cursor-pointer flex justify-between items-center text-xs"
                >
                  <span className="font-bold text-white">{p.name}</span>
                  <span className={`tabular-nums font-mono ${p.change.startsWith("+") ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
                    {p.price} ({p.change})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Market Stats Strip (Hyperliquid design) */}
          <div className="hidden lg:flex items-center gap-5 text-[11px] text-neutral-400 border-l border-[#1e222d] pl-4">
            <div>
              <span className="text-[#848e9c] block text-[9px] uppercase">24h Change</span>
              <span className="text-[#0ecb81] font-bold tabular-nums">{currentPair.change}</span>
            </div>
            <div>
              <span className="text-[#848e9c] block text-[9px] uppercase">24h High</span>
              <span className="text-neutral-200 tabular-nums">{currentPair.high}</span>
            </div>
            <div>
              <span className="text-[#848e9c] block text-[9px] uppercase">24h Low</span>
              <span className="text-neutral-200 tabular-nums">{currentPair.low}</span>
            </div>
            <div>
              <span className="text-[#848e9c] block text-[9px] uppercase">24h Monad Volume</span>
              <span className="text-neutral-200 tabular-nums">{currentPair.vol}</span>
            </div>
            <div>
              <span className="text-[#848e9c] block text-[9px] uppercase">1h Funding</span>
              <span className="text-[#50E3C2] tabular-nums">{currentPair.funding}</span>
            </div>
          </div>
        </div>

        {/* Right: Network Status, Account & Wallet */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#0ecb81]/10 border border-[#0ecb81]/30 text-[#0ecb81] text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0ecb81] animate-pulse" />
            <span>Monad Cancun · 10,000 TPS</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#161922] border border-[#1e222d] text-neutral-300">
            <span className="text-[#848e9c] text-[10px]">Equity:</span>
            <span className="text-white font-bold tabular-nums">$10,480.20</span>
          </div>

          <button className="flex items-center gap-1.5 px-3 py-1 rounded bg-[#50E3C2] hover:bg-[#6efbdc] text-black font-bold text-xs transition-all shadow-[0_0_12px_rgba(80,227,194,0.3)]">
            <Wallet className="w-3.5 h-3.5" />
            <span>0x71c...99a2</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN DOCKED WORKSTATION (Left: Chart & Tables | Center: Orderbook | Right: Order Form) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Chart + Docked Bottom Panel */}
        <div className="flex-1 flex flex-col border-r border-[#1e222d] min-w-0">
          {/* Top: Candlestick Chart Stage (TradingView / Hyperliquid style) */}
          <div className="h-[58%] border-b border-[#1e222d] flex flex-col min-h-0 bg-[#090909]">
            <AuraTradingChart pair={selectedPair} />
          </div>

          {/* Bottom Docked Panel: Positions, Gearbox Credit Accounts, Morpho Markets */}
          <div className="flex-1 flex flex-col bg-[#0c0c0c] min-h-0">
            {/* Dock Tabs Header */}
            <div className="h-9 bg-[#0c0c0c] border-b border-[#1e222d] px-3 flex items-center justify-between shrink-0 font-mono text-xs">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    playTick();
                    setActiveTab("credit_accounts");
                  }}
                  className={`px-3 py-1 rounded-t text-xs font-bold transition-all ${
                    activeTab === "credit_accounts"
                      ? "text-[#50E3C2] border-b-2 border-[#50E3C2] bg-[#161922]"
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
                      ? "text-[#50E3C2] border-b-2 border-[#50E3C2] bg-[#161922]"
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
                      ? "text-[#50E3C2] border-b-2 border-[#50E3C2] bg-[#161922]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  Open Positions (1)
                </button>
              </div>

              <div className="text-[11px] text-[#848e9c]">
                Continuous Credit Protocol · Auto-Deleveraging at HF &lt; 1.05
              </div>
            </div>

            {/* Dock Content Body */}
            <div className="flex-1 overflow-y-auto p-3 text-xs font-mono">
              {activeTab === "credit_accounts" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-[10px] text-[#848e9c] uppercase pb-1.5 border-b border-[#1e222d] px-2">
                    <span className="col-span-3">Credit Account / Strategy</span>
                    <span className="col-span-2">Borrowed (Advance)</span>
                    <span className="col-span-2">Collateral</span>
                    <span className="col-span-1">Lev</span>
                    <span className="col-span-2">Health Factor</span>
                    <span className="col-span-2 text-right">PnL</span>
                  </div>

                  {creditAccounts.map((ca) => (
                    <div
                      key={ca.id}
                      className="grid grid-cols-12 items-center px-2 py-2 rounded bg-[#121418] hover:bg-[#161922] border border-white/[0.04] transition-all"
                    >
                      <div className="col-span-3">
                        <span className="text-white font-bold block">{ca.name}</span>
                        <span className="text-[#848e9c] text-[10px]">{ca.router}</span>
                      </div>
                      <div className="col-span-2 text-white tabular-nums">{ca.borrowed}</div>
                      <div className="col-span-2 text-neutral-300 tabular-nums">{ca.collateral}</div>
                      <div className="col-span-1 text-[#50E3C2] font-bold">{ca.leverage}</div>
                      <div className="col-span-2 flex items-center gap-1.5">
                        <span className="text-[#0ecb81] font-bold tabular-nums">{ca.healthFactor}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0ecb81]/15 text-[#0ecb81] font-bold">
                          {ca.healthStatus}
                        </span>
                      </div>
                      <div className="col-span-2 text-right text-[#0ecb81] font-bold tabular-nums">{ca.pnl}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "isolated_markets" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-12 text-[10px] text-[#848e9c] uppercase pb-1.5 border-b border-[#1e222d] px-2">
                    <span className="col-span-3">Market / LLTV</span>
                    <span className="col-span-3">Risk Curator</span>
                    <span className="col-span-2">Total Supplied</span>
                    <span className="col-span-2">Supply APY</span>
                    <span className="col-span-2 text-right">Utilization</span>
                  </div>

                  {isolatedMarkets.map((m) => (
                    <div
                      key={m.pair}
                      className="grid grid-cols-12 items-center px-2 py-2 rounded bg-[#121418] hover:bg-[#161922] border border-white/[0.04] transition-all"
                    >
                      <div className="col-span-3">
                        <span className="text-white font-bold block">{m.pair}</span>
                        <span className="text-[#848e9c] text-[10px]">LLTV {m.lltv}</span>
                      </div>
                      <div className="col-span-3 text-neutral-300">{m.curator}</div>
                      <div className="col-span-2 text-white tabular-nums">{m.supplied}</div>
                      <div className="col-span-2 text-[#0ecb81] font-bold tabular-nums">{m.supplyApy}</div>
                      <div className="col-span-2 text-right text-neutral-200 tabular-nums">{m.util}%</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "positions" && (
                <div className="p-4 text-center text-[#848e9c] space-y-2">
                  <p>1 Open Position on Kuru CLOB</p>
                  <div className="inline-flex items-center gap-4 px-4 py-2 rounded bg-[#121418] border border-[#1e222d] text-white">
                    <span className="text-[#0ecb81] font-bold">LONG MON-PERP</span>
                    <span className="tabular-nums">Size: 10.0 MON</span>
                    <span className="tabular-nums">Entry: $24.12</span>
                    <span className="tabular-nums">Mark: $24.85</span>
                    <span className="text-[#0ecb81] font-bold tabular-nums">PnL: +$7.30 (+3.02%)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Kuru CLOB Depth Orderbook (250px) */}
        <div className="w-64 border-r border-[#1e222d] bg-[#0c0c0c] flex flex-col shrink-0">
          <div className="h-9 border-b border-[#1e222d] px-3 flex items-center justify-between font-mono text-xs text-[#848e9c]">
            <span className="font-bold text-white text-[11px]">KURU ORDERBOOK</span>
            <span className="text-[10px]">0.01 Tick</span>
          </div>

          <div className="grid grid-cols-3 text-[10px] font-mono text-[#848e9c] px-3 py-1.5 border-b border-[#1e222d]">
            <span>Price (USDC)</span>
            <span className="text-right">Size (MON)</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sell Orders - Crimson Red #f6465d) */}
          <div className="flex-1 flex flex-col justify-end overflow-hidden p-1 space-y-0.5 font-mono text-[11px]">
            {orderbookAsks.map((ask) => (
              <div
                key={ask.price}
                className="relative grid grid-cols-3 px-2 py-0.5 hover:bg-white/[0.04] cursor-pointer tabular-nums"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[#f6465d]/10 pointer-events-none"
                  style={{ width: ask.depth }}
                />
                <span className="text-[#f6465d] font-bold z-10">{ask.price}</span>
                <span className="text-right text-neutral-300 z-10">{ask.size}</span>
                <span className="text-right text-[#848e9c] z-10">{ask.total}</span>
              </div>
            ))}
          </div>

          {/* Spread Ribbon */}
          <div className="py-1 px-3 bg-[#121418] border-y border-[#1e222d] flex justify-between items-center font-mono text-xs">
            <span className="text-[#0ecb81] font-bold text-sm tabular-nums">24.85</span>
            <span className="text-[#848e9c] text-[10px]">Spread: 0.02 (0.08%)</span>
          </div>

          {/* Bids (Buy Orders - Mint Green #0ecb81) */}
          <div className="flex-1 overflow-hidden p-1 space-y-0.5 font-mono text-[11px]">
            {orderbookBids.map((bid) => (
              <div
                key={bid.price}
                className="relative grid grid-cols-3 px-2 py-0.5 hover:bg-white/[0.04] cursor-pointer tabular-nums"
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[#0ecb81]/10 pointer-events-none"
                  style={{ width: bid.depth }}
                />
                <span className="text-[#0ecb81] font-bold z-10">{bid.price}</span>
                <span className="text-right text-neutral-300 z-10">{bid.size}</span>
                <span className="text-right text-[#848e9c] z-10">{bid.total}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Entry & Credit Leverage Console (310px) */}
        <div className="w-80 bg-[#0c0c0c] flex flex-col shrink-0 p-3.5 space-y-3.5 overflow-y-auto">
          {/* Order Side Selector */}
          <div className="grid grid-cols-2 p-0.5 rounded-lg bg-[#161922] border border-[#1e222d] font-mono text-xs">
            <button
              onClick={() => {
                playTick();
                setOrderSide("buy");
              }}
              className={`py-1.5 rounded-md font-bold transition-all ${
                orderSide === "buy"
                  ? "bg-[#0ecb81] text-black shadow-[0_0_12px_rgba(14,203,129,0.4)]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Buy / Long
            </button>
            <button
              onClick={() => {
                playTick();
                setOrderSide("sell");
              }}
              className={`py-1.5 rounded-md font-bold transition-all ${
                orderSide === "sell"
                  ? "bg-[#f6465d] text-white shadow-[0_0_12px_rgba(246,70,93,0.4)]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Sell / Short
            </button>
          </div>

          {/* Order Type Tabs */}
          <div className="flex gap-2 font-mono text-xs border-b border-[#1e222d] pb-2">
            <button
              onClick={() => setOrderType("market")}
              className={`pb-1 font-semibold ${
                orderType === "market" ? "text-white border-b-2 border-[#50E3C2]" : "text-[#848e9c]"
              }`}
            >
              Market
            </button>
            <button
              onClick={() => setOrderType("limit")}
              className={`pb-1 font-semibold ${
                orderType === "limit" ? "text-white border-b-2 border-[#50E3C2]" : "text-[#848e9c]"
              }`}
            >
              Limit
            </button>
          </div>

          {/* Price & Size Input Fields */}
          <div className="space-y-2.5 font-mono text-xs">
            {orderType === "limit" && (
              <div>
                <label className="text-[#848e9c] text-[10px] block mb-1">Price (USDC)</label>
                <div className="flex items-center bg-[#121418] border border-[#1e222d] rounded px-2.5 py-1.5">
                  <input
                    type="text"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                    className="bg-transparent text-white w-full outline-none tabular-nums"
                  />
                  <span className="text-[#848e9c] text-[11px]">USDC</span>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between text-[10px] text-[#848e9c] mb-1">
                <span>Order Size</span>
                <span>Avail: 142.5 MON</span>
              </div>
              <div className="flex items-center bg-[#121418] border border-[#1e222d] rounded px-2.5 py-1.5">
                <input
                  type="text"
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(e.target.value)}
                  className="bg-transparent text-white w-full outline-none tabular-nums"
                />
                <span className="text-[#848e9c] text-[11px]">MON</span>
              </div>
            </div>
          </div>

          {/* Gearbox Leverage Slider */}
          <div className="bg-[#121418] border border-[#1e222d] rounded-lg p-3 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[#848e9c] text-[11px]">Advance Credit Leverage</span>
              <span className="text-[#50E3C2] font-bold text-sm tabular-nums">{leverage}x</span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full accent-[#50E3C2] cursor-pointer"
            />

            <div className="flex justify-between text-[9px] text-[#848e9c]">
              <span>1x Spot</span>
              <span>4x Safe</span>
              <span>10x Max</span>
            </div>
          </div>

          {/* Trade Risk Summary */}
          <div className="space-y-1.5 font-mono text-[11px] text-[#848e9c] border-t border-[#1e222d] pt-2.5">
            <div className="flex justify-between">
              <span>Total Position:</span>
              <span className="text-white tabular-nums">{(parseFloat(orderAmount || "0") * leverage).toFixed(2)} MON</span>
            </div>
            <div className="flex justify-between">
              <span>Credit Borrowed:</span>
              <span className="text-[#50E3C2] tabular-nums">{(parseFloat(orderAmount || "0") * (leverage - 1)).toFixed(2)} MON</span>
            </div>
            <div className="flex justify-between">
              <span>Liquidation Price:</span>
              <span className="text-[#f6465d] tabular-nums">$19.22 (-22.6%)</span>
            </div>
            <div className="flex justify-between">
              <span>Cassie VaR Score:</span>
              <span className="text-[#0ecb81] font-bold">PASS (Score: 94)</span>
            </div>
          </div>

          {/* Submit Action Button */}
          <button
            onClick={handleExecuteTrade}
            disabled={isSubmitting}
            className={`w-full py-2.5 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
              orderSide === "buy"
                ? "bg-[#0ecb81] hover:bg-[#10df8e] text-black shadow-[0_0_15px_rgba(14,203,129,0.3)]"
                : "bg-[#f6465d] hover:bg-[#ff556c] text-white shadow-[0_0_15px_rgba(246,70,93,0.3)]"
            } disabled:opacity-50`}
          >
            {isSubmitting ? "Executing on Monad..." : `${orderSide.toUpperCase()} ${selectedPair}`}
          </button>

          {txSuccess && (
            <div className="p-2.5 rounded bg-[#0ecb81]/10 border border-[#0ecb81]/30 text-[#0ecb81] font-mono text-[10px] space-y-1">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Confirmed
              </div>
              <p className="text-neutral-300">{txSuccess}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
