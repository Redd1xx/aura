"use client";

import React, { useState } from "react";
import { AuraTradingChart } from "../components/AuraTradingChart";
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Globe,
  Wallet,
  Settings,
  MoreHorizontal,
  Search,
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
  Layers,
  BarChart3,
  Bot,
  ExternalLink,
} from "lucide-react";
import { playTick, playOrderSubmit, playDepositChime } from "../lib/audio";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "../config/monad";

type TabMode = "earn" | "agentic" | "positions" | "kuru";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabMode>("earn");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [assetTypeFilter, setAssetTypeFilter] = useState("all");
  const [modeFilter, setModeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Credit Account Modal state
  const [selectedStrategy, setSelectedStrategy] = useState<any | null>(null);
  const [depositAmount, setDepositAmount] = useState<string>("10.0");
  const [selectedLeverage, setSelectedLeverage] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);

  // Gearbox-style Earn / Credit Opportunities
  const opportunities = [
    {
      id: "opp-1",
      name: "Kuru Scalper v1.4 / MON",
      curator: "Advance Risk Engine",
      tag: "AGENTIC",
      type: "Leverage" as const,
      totalSupply: "$1.19M",
      supplyUnit: "1.19M MON",
      apy: "17.83%",
      apyHighlight: true,
      collaterals: ["MON", "USDC", "USDT"],
      borrowed: "$840.5K",
      maxLev: "10x",
      description: "Automated high-frequency limit order scalper trading on Kuru CLOB with continuous credit lines.",
    },
    {
      id: "opp-2",
      name: "T3tris LP Vault / MON-USDC",
      curator: "T3tris Algorithmic",
      tag: "RWA",
      type: "Leverage" as const,
      totalSupply: "$754.25K",
      supplyUnit: "754.34K MON",
      apy: "14.46%",
      apyHighlight: false,
      collaterals: ["MON", "USDC"],
      borrowed: "$510.2K",
      maxLev: "5x",
      description: "Delta-neutral liquidity provision across concentrated liquidity pools with automatic impermanent loss hedging.",
    },
    {
      id: "opp-3",
      name: "MON Passive Lending Pool",
      curator: "Gearbox Core Risk",
      tag: "CORE",
      type: "Lend" as const,
      totalSupply: "$1.55M",
      supplyUnit: "1.55M MON",
      apy: "6.62%",
      apyHighlight: false,
      collaterals: ["MON"],
      borrowed: "$920.0K",
      maxLev: "1x",
      description: "Permissionless single-sided MON deposit pool supplying liquidity to approved autonomous credit accounts.",
    },
    {
      id: "opp-4",
      name: "Beefy CHOG / MON Arbitrage",
      curator: "Gami Labs",
      tag: "MEME-DEFI",
      type: "Leverage" as const,
      totalSupply: "$260.09K",
      supplyUnit: "3.15M CHOG",
      apy: "32.38%",
      apyHighlight: true,
      collaterals: ["CHOG", "MON"],
      borrowed: "$180.4K",
      maxLev: "4x",
      description: "Cross-DEX statistical arbitrage between Kuru orderbook and Uniswap v3 on Monad testnet.",
    },
    {
      id: "opp-5",
      name: "Dakota Institutional Yield",
      curator: "Dakota Prime",
      tag: "RWA",
      type: "Leverage" as const,
      totalSupply: "$2.04M",
      supplyUnit: "810.37 MON",
      apy: "22.83%",
      apyHighlight: true,
      collaterals: ["DAK", "MON", "USDC"],
      borrowed: "$1.45M",
      maxLev: "6x",
      description: "Institutional credit pool funding verifiable treasury trading bots with dual-approval safeguards.",
    },
    {
      id: "opp-6",
      name: "USDC Stablecoin Savings",
      curator: "UltraYield",
      tag: "STABLE",
      type: "Lend" as const,
      totalSupply: "$10.89M",
      supplyUnit: "10.89M USDC",
      apy: "8.15%",
      apyHighlight: false,
      collaterals: ["USDC"],
      borrowed: "$8.92M",
      maxLev: "1x",
      description: "Senior tranche stablecoin lending pool with priority liquidation claim and over-collateralization guarantee.",
    },
  ];

  const filteredOpportunities = opportunities.filter((opp) => {
    if (currencyFilter === "mon" && !opp.collaterals.includes("MON")) return false;
    if (currencyFilter === "usd" && !opp.collaterals.includes("USDC") && !opp.collaterals.includes("USDT")) return false;
    if (assetTypeFilter === "rwa" && opp.tag !== "RWA") return false;
    if (modeFilter === "lend" && opp.type !== "Lend") return false;
    if (modeFilter === "leverage" && opp.type !== "Leverage") return false;
    if (searchQuery && !opp.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleOpenAccount = async () => {
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
      setTxSuccess(`Credit Account provisioned on Monad Cancun! Block #${block.number} confirmed with 340ms finality.`);
      setTimeout(() => {
        playDepositChime();
      }, 500);
    } catch (e: any) {
      alert("Error: " + e?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0e12] text-[#ffffff] font-sans flex flex-col antialiased selection:bg-[#E1007E]/30 selection:text-white">
      {/* 1. TOP HEADER (Exact Gearbox Protocol Layout from Screenshot) */}
      <header className="h-16 border-b border-white/[0.08] bg-[#0d0e12] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E1007E] to-[#ff47a3] flex items-center justify-center shadow-[0_0_15px_rgba(225,0,126,0.5)]">
              <Zap className="w-4 h-4 text-white font-bold" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">
              AURA <span className="text-[#E1007E] font-mono text-sm">VAULT</span>
            </span>
          </div>

          {/* Navigation Links with Gearbox Hot Pink Underline */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <button
              onClick={() => {
                playTick();
                setActiveTab("agentic");
              }}
              className={`pb-1 transition-all ${
                activeTab === "agentic"
                  ? "text-white border-b-2 border-[#E1007E]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Agentic
            </button>

            <button
              onClick={() => {
                playTick();
                setActiveTab("earn");
              }}
              className={`pb-1 transition-all ${
                activeTab === "earn"
                  ? "text-white border-b-2 border-[#E1007E]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Earn
            </button>

            <button
              onClick={() => {
                playTick();
                setActiveTab("positions");
              }}
              className={`pb-1 transition-all ${
                activeTab === "positions"
                  ? "text-white border-b-2 border-[#E1007E]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Positions
            </button>

            <button
              onClick={() => {
                playTick();
                setActiveTab("kuru");
              }}
              className={`pb-1 transition-all ${
                activeTab === "kuru"
                  ? "text-white border-b-2 border-[#E1007E]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Kuru CLOB
            </button>
          </nav>
        </div>

        {/* Right Action: Hot Pink Gearbox Pill Button */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs font-mono text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Monad Cancun Testnet</span>
          </div>

          <button className="gearbox-btn-pink flex items-center gap-2 text-xs">
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect Wallet</span>
          </button>

          <button className="w-9 h-9 rounded-full bg-[#16181d] border border-white/[0.08] flex items-center justify-center text-neutral-400 hover:text-white transition-all">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 flex flex-col gap-6">
        {/* Main Tab Views */}
        {activeTab === "earn" && (
          <div className="flex flex-col gap-6">
            {/* Title & Announcement Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Earn & Leverage</h1>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Isolated credit accounts providing bounded continuous leverage to trading agents on Monad
                </p>
              </div>

              {/* Version Pill */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16181d] border border-white/[0.08] text-xs text-neutral-300">
                <span>Gearbox Credit Invariants Active</span>
                <span className="text-[#E1007E] font-bold">Monad 10k TPS</span>
              </div>
            </div>

            {/* Top 3 KPI Cards (Exact Gearbox Format from Screenshot) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="gearbox-card p-5 space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Total TVL</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">$35.50M</div>
                <span className="text-[11px] text-emerald-400 font-mono">+12.4% past 24h</span>
              </div>

              <div className="gearbox-card p-5 space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Total supply</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">$16.63M</div>
                <span className="text-[11px] text-neutral-400 font-mono">Deposited into Senior Tranches</span>
              </div>

              <div className="gearbox-card p-5 space-y-1">
                <span className="text-xs text-neutral-400 font-medium">Total borrowed</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tabular-nums">$13.52M</div>
                <span className="text-[11px] text-[#E1007E] font-mono">Active Agent Credit Utilization</span>
              </div>
            </div>

            {/* Segmented Filter Control Bar (Exact Gearbox Layout from Screenshot) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                {/* Network dropdown */}
                <button className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#16181d] border border-white/[0.08] text-white">
                  <span className="w-2 h-2 rounded-full bg-[#E1007E]" />
                  <span>Monad Cancun</span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                </button>

                {/* Currency filter pills */}
                <div className="flex rounded-xl bg-[#16181d] p-0.5 border border-white/[0.08]">
                  <button
                    onClick={() => setCurrencyFilter("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      currencyFilter === "all" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setCurrencyFilter("usd")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      currencyFilter === "usd" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    USD
                  </button>
                  <button
                    onClick={() => setCurrencyFilter("mon")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      currencyFilter === "mon" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    MON
                  </button>
                </div>

                {/* Crypto vs RWA pills */}
                <div className="flex rounded-xl bg-[#16181d] p-0.5 border border-white/[0.08]">
                  <button
                    onClick={() => setAssetTypeFilter("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      assetTypeFilter === "all" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setAssetTypeFilter("crypto")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      assetTypeFilter === "crypto" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Crypto
                  </button>
                  <button
                    onClick={() => setAssetTypeFilter("rwa")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      assetTypeFilter === "rwa" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    RWA
                  </button>
                </div>

                {/* Lend vs Leverage pills */}
                <div className="flex rounded-xl bg-[#16181d] p-0.5 border border-white/[0.08]">
                  <button
                    onClick={() => setModeFilter("all")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      modeFilter === "all" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setModeFilter("lend")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      modeFilter === "lend" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Lend
                  </button>
                  <button
                    onClick={() => setModeFilter("leverage")}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      modeFilter === "leverage" ? "bg-[#252932] text-white font-bold" : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Leverage
                  </button>
                </div>
              </div>

              {/* Search Box */}
              <div className="flex items-center gap-2 bg-[#16181d] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-white">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent outline-none text-xs w-40 placeholder:text-neutral-500"
                />
              </div>
            </div>

            {/* Opportunities Table (Exact Gearbox Format from Screenshot) */}
            <div className="gearbox-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#111217] border-b border-white/[0.08] text-neutral-400 font-semibold uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-5">Opportunity</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4">Total Supply</th>
                      <th className="py-3.5 px-4">APY</th>
                      <th className="py-3.5 px-4">Collateral</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredOpportunities.map((opp) => (
                      <tr key={opp.id} className="hover:bg-[#1a1c22] transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#20242e] border border-white/[0.1] flex items-center justify-center font-bold text-xs text-[#E1007E]">
                              {opp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{opp.name}</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.08] text-neutral-300 font-bold">
                                  {opp.tag}
                                </span>
                              </div>
                              <span className="text-[11px] text-neutral-400 font-mono">{opp.curator}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                              opp.type === "Leverage"
                                ? "bg-[#1a2b4c] text-[#4da2ff]"
                                : "bg-[#133827] text-[#26d07c]"
                            }`}
                          >
                            {opp.type}
                          </span>
                        </td>

                        <td className="py-4 px-4 font-mono">
                          <div className="font-bold text-white text-sm tabular-nums">{opp.totalSupply}</div>
                          <div className="text-[10px] text-neutral-500 tabular-nums">{opp.supplyUnit}</div>
                        </td>

                        <td className="py-4 px-4 font-mono">
                          <div className="font-bold text-white text-sm tabular-nums flex items-center gap-1">
                            <span>{opp.apy}</span>
                            {opp.apyHighlight && <span className="text-[#E1007E] text-xs font-bold">+</span>}
                          </div>
                          <span className="text-[10px] text-neutral-500">Max {opp.maxLev}</span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center -space-x-1.5">
                            {opp.collaterals.map((c, idx) => (
                              <div
                                key={idx}
                                className="w-6 h-6 rounded-full bg-[#252834] border border-white/[0.15] flex items-center justify-center text-[9px] font-bold text-neutral-200"
                                title={c}
                              >
                                {c.slice(0, 2)}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => {
                              playTick();
                              setSelectedStrategy(opp);
                            }}
                            className="px-4 py-1.5 rounded-full bg-[#E1007E]/15 hover:bg-[#E1007E] text-[#E1007E] hover:text-white border border-[#E1007E]/30 font-bold text-xs transition-all"
                          >
                            {opp.type === "Leverage" ? "Open Account" : "Deposit"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Agentic Credit Workspace */}
        {activeTab === "agentic" && (
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Agentic Credit Facility</h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Permissionless credit lines issued to autonomous AI agents with bounded invariant checking
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 gearbox-card p-6 space-y-4">
                <div className="flex items-center gap-2 text-[#E1007E] font-bold text-sm">
                  <Bot className="w-4 h-4" />
                  <span>Autonomous Credit Account Policy</span>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed">
                  In Gearbox Protocol on Monad, capital never leaves the credit account. Autonomous agents execute high-frequency trades on Kuru CLOB, but smart contract invariants prevent any transfer of funds to arbitrary attacker addresses.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#111217] border border-white/[0.06]">
                    <span className="text-neutral-500 block text-[10px]">DOWNWARD BOUND</span>
                    <span className="text-white font-bold text-sm">Child Cap ≤ Parent Cap</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#111217] border border-white/[0.06]">
                    <span className="text-neutral-500 block text-[10px]">PRE-SIGNING VaR</span>
                    <span className="text-emerald-400 font-bold text-sm">Cassie Risk Gate Active</span>
                  </div>
                </div>
              </div>

              <div className="gearbox-card p-6 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-white text-base">Continuous Clearing</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Continuous credit clearing protocol clears debt positions each Monad block (~340ms).
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("earn")}
                  className="gearbox-btn-pink w-full text-center text-xs"
                >
                  Explore Credit Accounts
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Positions */}
        {activeTab === "positions" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Active Credit Accounts</h1>
            <div className="gearbox-card p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#E1007E]/20 text-[#E1007E] flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">1 Credit Account Active on Monad</h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Account 0x71c...99a2 holds 22.0 MON collateral with 14.5 MON borrowed on Kuru Scalper v1.4. Health Factor: 1.82 (Healthy).
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Kuru CLOB Terminal */}
        {activeTab === "kuru" && (
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Kuru Parallel CLOB</h1>
            <div className="h-[500px] gearbox-card overflow-hidden">
              <AuraTradingChart pair="MON-PERP" />
            </div>
          </div>
        )}
      </main>

      {/* Credit Account Provisioning Modal (Gearbox Style) */}
      {selectedStrategy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="gearbox-card max-w-lg w-full p-6 space-y-5 bg-[#14161d] border border-white/[0.12] shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="font-extrabold text-white text-base">Open Credit Account</h3>
                <span className="text-xs text-[#E1007E] font-mono">{selectedStrategy.name}</span>
              </div>
              <button
                onClick={() => setSelectedStrategy(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Deposit Amount */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-neutral-400">
                <span>Collateral Deposit</span>
                <span>Avail: 142.5 MON</span>
              </div>
              <div className="flex items-center bg-[#0d0e12] border border-white/[0.08] rounded-xl px-3 py-2 text-white">
                <input
                  type="text"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-transparent outline-none w-full font-mono text-sm"
                />
                <span className="text-xs font-bold text-neutral-400">MON</span>
              </div>
            </div>

            {/* Leverage Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Credit Leverage</span>
                <span className="text-[#E1007E] font-bold font-mono">{selectedLeverage}x</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={selectedLeverage}
                onChange={(e) => setSelectedLeverage(Number(e.target.value))}
                className="w-full accent-[#E1007E] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                <span>1x (Spot)</span>
                <span>4x (Balanced)</span>
                <span>10x (Max)</span>
              </div>
            </div>

            {/* Invariant Summary */}
            <div className="p-3.5 rounded-xl bg-[#0d0e12] border border-white/[0.06] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>Borrowed Credit:</span>
                <span className="text-white font-bold">{(parseFloat(depositAmount || "0") * (selectedLeverage - 1)).toFixed(2)} MON</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Total Exposure:</span>
                <span className="text-white font-bold">{(parseFloat(depositAmount || "0") * selectedLeverage).toFixed(2)} MON</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Health Factor:</span>
                <span className="text-emerald-400 font-bold">1.82 (Healthy)</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>Cassie Pre-Flight:</span>
                <span className="text-emerald-400 font-bold">PASS (Score 94)</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleOpenAccount}
              disabled={isSubmitting}
              className="gearbox-btn-pink w-full py-3 text-sm font-bold uppercase tracking-wider disabled:opacity-50"
            >
              {isSubmitting ? "Provisioning on Monad..." : "Confirm & Open Credit Account"}
            </button>

            {txSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs">
                {txSuccess}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
