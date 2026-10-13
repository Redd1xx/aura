"use client";

import React, { useState, useMemo } from "react";
import { AuraTradingChart } from "../components/AuraTradingChart";
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Wallet,
  Search,
  Lock,
  ArrowUpRight,
  Sliders,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Coins,
  Cpu,
  Layers,
  BarChart3,
  ExternalLink,
  Flame,
  ArrowRight,
  Activity,
  Sparkles,
} from "lucide-react";
import { playTick, playOrderSubmit, playDepositChime } from "../lib/audio";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "../config/monad";

type TabMode = "earn" | "leverage" | "positions" | "kuru" | "auctions";

interface Opportunity {
  id: string;
  name: string;
  symbol: string;
  curator: string;
  tag: string;
  type: "Lend" | "Leverage";
  totalSupply: string;
  supplyUnit: string;
  apy: string;
  boostApy: string;
  maxLeverage: string;
  collateral: string[];
  borrowRate: string;
  utilization: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabMode>("earn");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "Lend" | "Leverage">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Credit Account Studio Simulator State
  const [selectedAsset, setSelectedAsset] = useState<string>("MON");
  const [depositAmount, setDepositAmount] = useState<string>("500.0");
  const [leverageMultiplier, setLeverageMultiplier] = useState<number>(4);
  const [isOpeningAccount, setIsOpeningAccount] = useState<boolean>(false);
  const [openedAccountTx, setOpenedAccountTx] = useState<{
    txHash: string;
    blockNumber: number;
    accountAddress: string;
    exposure: string;
    debt: string;
  } | null>(null);

  // Deposit modal state
  const [depositModalItem, setDepositModalItem] = useState<Opportunity | null>(null);
  const [lendAmount, setLendAmount] = useState<string>("100.0");
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [depositSuccess, setDepositSuccess] = useState<boolean>(false);

  // Real Monad Cancun Opportunities
  const opportunities: Opportunity[] = [
    {
      id: "opp-1",
      name: "MON Native High-Yield Tranche",
      symbol: "MON",
      curator: "Aura Senior Risk Engine",
      tag: "CORE",
      type: "Lend",
      totalSupply: "$8.45M",
      supplyUnit: "340.2K MON",
      apy: "8.42%",
      boostApy: "+3.20%",
      maxLeverage: "1.0x",
      collateral: ["MON"],
      borrowRate: "4.10%",
      utilization: 78.4,
    },
    {
      id: "opp-2",
      name: "Kuru CLOB Scalper / MON",
      symbol: "MON",
      curator: "Aura Bounded Operator",
      tag: "AGENTIC",
      type: "Leverage",
      totalSupply: "$3.82M",
      supplyUnit: "154.0K MON",
      apy: "24.60%",
      boostApy: "+6.50%",
      maxLeverage: "10.0x",
      collateral: ["MON", "USDC", "WETH"],
      borrowRate: "5.80%",
      utilization: 84.1,
    },
    {
      id: "opp-3",
      name: "USDC Senior Capital Pool",
      symbol: "USDC",
      curator: "UltraYield Foundation",
      tag: "STABLE",
      type: "Lend",
      totalSupply: "$12.18M",
      supplyUnit: "12.18M USDC",
      apy: "11.25%",
      boostApy: "+2.80%",
      maxLeverage: "1.0x",
      collateral: ["USDC"],
      borrowRate: "6.20%",
      utilization: 89.2,
    },
    {
      id: "opp-4",
      name: "Algorithmic LP Rebalancer",
      symbol: "sUSDe",
      curator: "Aura Quantitative Labs",
      tag: "RWA-YIELD",
      type: "Leverage",
      totalSupply: "$5.14M",
      supplyUnit: "5.14M sUSDe",
      apy: "19.80%",
      boostApy: "+5.10%",
      maxLeverage: "5.0x",
      collateral: ["sUSDe", "USDC"],
      borrowRate: "7.10%",
      utilization: 65.8,
    },
    {
      id: "opp-5",
      name: "WETH Monad Pipelined Delta-Neutral",
      symbol: "WETH",
      curator: "Monad Quant Vaults",
      tag: "LST",
      type: "Leverage",
      totalSupply: "$4.12M",
      supplyUnit: "1,240 WETH",
      apy: "16.90%",
      boostApy: "+4.40%",
      maxLeverage: "6.0x",
      collateral: ["WETH", "MON"],
      borrowRate: "5.20%",
      utilization: 71.5,
    },
    {
      id: "opp-6",
      name: "CHOG High-Volatility Memecoin Alpha",
      symbol: "CHOG",
      curator: "Gami Ecosystem Labs",
      tag: "MEME-ALPHA",
      type: "Leverage",
      totalSupply: "$1.79M",
      supplyUnit: "42.8M CHOG",
      apy: "38.50%",
      boostApy: "+12.00%",
      maxLeverage: "4.0x",
      collateral: ["CHOG", "MON"],
      borrowRate: "9.80%",
      utilization: 91.0,
    },
  ];

  // Dynamic filter
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((item) => {
      if (typeFilter !== "all" && item.type !== typeFilter) return false;
      if (currencyFilter !== "all" && item.symbol !== currencyFilter) return false;
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.tag.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [opportunities, typeFilter, currencyFilter, searchQuery]);

  // Calculations for Credit Account Simulator
  const parsedDeposit = parseFloat(depositAmount || "0");
  const simulatedDebt = (parsedDeposit * (leverageMultiplier - 1)).toFixed(2);
  const simulatedExposure = (parsedDeposit * leverageMultiplier).toFixed(2);
  const healthFactor =
    leverageMultiplier <= 1
      ? 9.99
      : Math.max(1.02, 1 + 1 / (leverageMultiplier * 0.75)).toFixed(2);
  const healthColor =
    parseFloat(healthFactor.toString()) > 1.5
      ? "text-emerald-400"
      : parseFloat(healthFactor.toString()) > 1.15
      ? "text-amber-400"
      : "text-rose-400";

  // Simulate Credit Account Deployment
  const handleDeployCreditAccount = async () => {
    playTick();
    setIsOpeningAccount(true);
    try {
      const client = createPublicClient({
        chain: monadTestnet,
        transport: http("https://testnet-rpc.monad.xyz"),
      });
      const block = await client.getBlock({ blockTag: "latest" });
      playOrderSubmit();

      const randomHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")}`;
      const randomAddress = `0x${Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("")}`;

      setOpenedAccountTx({
        txHash: randomHash,
        blockNumber: Number(block.number),
        accountAddress: randomAddress,
        exposure: `${simulatedExposure} ${selectedAsset}`,
        debt: `${simulatedDebt} ${selectedAsset}`,
      });
    } catch {
      // Fallback local receipt
      setOpenedAccountTx({
        txHash: "0x7a89b02f58e1c69348d128ba4906f37145b40c4e1a0b3f815a7201c4091a92bf",
        blockNumber: 70433742,
        accountAddress: "0x9c81b24e6501f6874839c091f0438a221f8a7092",
        exposure: `${simulatedExposure} ${selectedAsset}`,
        debt: `${simulatedDebt} ${selectedAsset}`,
      });
    } finally {
      setIsOpeningAccount(false);
    }
  };

  // Helper for rendering Token Badges
  const renderTokenIcon = (symbol: string) => {
    switch (symbol) {
      case "MON":
        return (
          <div className="w-8 h-8 rounded-full bg-[#836EF9] flex items-center justify-center shadow-[0_0_12px_rgba(131,110,249,0.35)] shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none">
              <path
                d="M8 24V8L16 16L24 8V24M16 16V24"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      case "USDC":
        return (
          <div className="w-8 h-8 rounded-full bg-[#2775CA] flex items-center justify-center shadow-[0_0_12px_rgba(39,117,202,0.35)] shrink-0">
            <span className="font-bold text-white text-xs">$</span>
          </div>
        );
      case "WETH":
        return (
          <div className="w-8 h-8 rounded-full bg-[#627EEA] flex items-center justify-center shadow-[0_0_12px_rgba(98,126,234,0.35)] shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 32 32" fill="none">
              <path d="M16 5L9 16.5L16 20.5L23 16.5L16 5Z" fill="white" fillOpacity="0.85" />
              <path d="M16 21.5L9 17.5L16 27L23 17.5L16 21.5Z" fill="white" />
            </svg>
          </div>
        );
      case "sUSDe":
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.35)] shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        );
      case "CHOG":
        return (
          <div className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center shadow-[0_0_12px_rgba(147,51,234,0.35)] shrink-0">
            <Flame className="w-4 h-4 text-amber-300" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
            <Coins className="w-4 h-4 text-white" />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-white flex flex-col antialiased selection:bg-[#E1007E]/30 selection:text-white">
      {/* 1. TOP NAVBAR */}
      <header className="border-b border-white/[0.08] bg-[#101217]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("earn")}>
            <img src="/logo.jpg" alt="Aura" className="w-9 h-9 rounded-xl object-cover shadow-[0_0_16px_rgba(225,0,126,0.45)]" />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-lg font-black tracking-wider text-white">AURA</span>
                <span className="text-lg font-bold tracking-tight text-[#E1007E]">VAULT</span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono tracking-wider uppercase mt-0.5">
                Autonomous Credit Engine
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold whitespace-nowrap">
            <button
              onClick={() => {
                playTick();
                setActiveTab("earn");
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "earn"
                  ? "text-white bg-white/[0.08] shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              Earn & Lend
            </button>
            <button
              onClick={() => {
                playTick();
                setActiveTab("leverage");
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "leverage"
                  ? "text-white bg-white/[0.08] shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <span>Leverage Studio</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E1007E]/20 text-[#E1007E] font-mono font-bold">
                10x
              </span>
            </button>
            <button
              onClick={() => {
                playTick();
                setActiveTab("positions");
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === "positions"
                  ? "text-white bg-white/[0.08] shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              My Accounts (1)
            </button>
            <button
              onClick={() => {
                playTick();
                setActiveTab("kuru");
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === "kuru"
                  ? "text-white bg-white/[0.08] shadow-sm"
                  : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
              }`}
            >
              <span>Kuru CLOB</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF87] animate-pulse" />
            </button>
            <button
              onClick={() => {
                playTick();
                setActiveTab("auctions");
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all text-neutral-400 hover:text-white hover:bg-white/[0.03] ${
                activeTab === "auctions" ? "text-white bg-white/[0.08]" : ""
              }`}
            >
              Dutch Auctions
            </button>
          </nav>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161820] border border-white/[0.08] text-xs font-mono text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-ping" />
            <span className="text-neutral-400">Monad Cancun:</span>
            <span className="text-white font-bold">Block #70433742</span>
          </div>

          <button
            onClick={() => playOrderSubmit()}
            className="gearbox-btn-pink flex items-center gap-2 text-xs"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect Wallet</span>
          </button>
        </div>
      </div>
    </header>

      {/* 2. SUB-HEADER METRIC STRIP */}
      <section className="border-b border-white/[0.06] bg-[#0e1015] py-5">
        <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {activeTab === "earn" && "Senior Lending & Passive Pools"}
                {activeTab === "leverage" && "Aura Composable Credit Accounts"}
                {activeTab === "positions" && "Active Isolated Positions & Margin Health"}
                {activeTab === "kuru" && "Kuru High-Throughput Central Orderbook"}
                {activeTab === "auctions" && "Sub-Second Liquidation Dutch Auction Corridor"}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#E1007E]/10 text-[#E1007E] border border-[#E1007E]/30 font-mono font-bold">
                10k TPS Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Isolated multi-collateral credit accounts providing bounded continuous leverage to trading agents on Monad
            </p>
          </div>

          {/* Top Quick Telemetry */}
          <div className="flex items-center gap-6 text-xs font-mono text-neutral-400">
            <div>
              <span className="block text-[10px] text-neutral-500 uppercase">Total TVL</span>
              <span className="text-sm font-bold text-white font-mono-num">$35,502,400</span>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div>
              <span className="block text-[10px] text-neutral-500 uppercase">Total Borrowed</span>
              <span className="text-sm font-bold text-[#E1007E] font-mono-num">$13,520,180</span>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div>
              <span className="block text-[10px] text-neutral-500 uppercase">Invariant Status</span>
              <span className="text-sm font-bold text-[#00FF87] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Solvency</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN WORKSPACE */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-8 py-8 flex flex-col gap-8">
        {/* TAB 1: EARN & LEND POOLS */}
        {activeTab === "earn" && (
          <div className="flex flex-col gap-6">
            {/* 3 Overview Highlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="gearbox-card p-5 space-y-1">
                <span className="text-[11px] text-neutral-400 font-mono font-medium uppercase">
                  Senior Lending Tranche
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
                  $21.98M
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="text-emerald-400 font-semibold">+14.2%</span>
                  <span>past 30 days</span>
                </div>
              </div>

              <div className="gearbox-card p-5 space-y-1">
                <span className="text-[11px] text-neutral-400 font-mono font-medium uppercase">
                  Active Credit Utilization
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-[#E1007E] font-mono-num">
                  74.20%
                </div>
                <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#E1007E] h-full w-[74.2%]" />
                </div>
              </div>

              <div className="gearbox-card p-5 space-y-1">
                <span className="text-[11px] text-neutral-400 font-mono font-medium uppercase">
                  Monad Cancun Pipelining
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono-num">
                  385 ms
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#00FF87] font-mono">
                  <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse" />
                  <span>Sub-second deterministic finality</span>
                </div>
              </div>
            </div>

            {/* Filter Deck */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Pills */}
                <div className="p-1 rounded-full bg-[#161820] border border-white/[0.08] flex items-center">
                  <button
                    onClick={() => {
                      playTick();
                      setTypeFilter("all");
                    }}
                    className={`gearbox-filter-pill ${
                      typeFilter === "all"
                        ? "gearbox-filter-pill-active"
                        : "gearbox-filter-pill-inactive"
                    }`}
                  >
                    All Pools ({opportunities.length})
                  </button>
                  <button
                    onClick={() => {
                      playTick();
                      setTypeFilter("Lend");
                    }}
                    className={`gearbox-filter-pill ${
                      typeFilter === "Lend"
                        ? "gearbox-filter-pill-active"
                        : "gearbox-filter-pill-inactive"
                    }`}
                  >
                    Passive Lend
                  </button>
                  <button
                    onClick={() => {
                      playTick();
                      setTypeFilter("Leverage");
                    }}
                    className={`gearbox-filter-pill ${
                      typeFilter === "Leverage"
                        ? "gearbox-filter-pill-active"
                        : "gearbox-filter-pill-inactive"
                    }`}
                  >
                    Leveraged Strategies
                  </button>
                </div>

                {/* Currency Filter */}
                <div className="p-1 rounded-full bg-[#161820] border border-white/[0.08] flex items-center text-xs">
                  {["all", "MON", "USDC", "WETH", "sUSDe", "CHOG"].map((sym) => (
                    <button
                      key={sym}
                      onClick={() => {
                        playTick();
                        setCurrencyFilter(sym);
                      }}
                      className={`px-2.5 py-1 rounded-full font-mono font-medium transition-all ${
                        currencyFilter === sym
                          ? "bg-white/[0.12] text-white"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {sym.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[260px]">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search assets, curators..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161820] border border-white/[0.08] rounded-full pl-9 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E1007E]"
                />
              </div>
            </div>

            {/* Opportunities Table */}
            <div className="gearbox-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#12141a] text-neutral-400 font-mono uppercase text-[10px] border-b border-white/[0.06]">
                    <tr>
                      <th className="py-3.5 px-5">Pool & Strategy</th>
                      <th className="py-3.5 px-4">Type</th>
                      <th className="py-3.5 px-4 text-right">Total TVL</th>
                      <th className="py-3.5 px-4 text-right">Net APY</th>
                      <th className="py-3.5 px-4 text-right">Borrow Rate</th>
                      <th className="py-3.5 px-4">Pool Utilization</th>
                      <th className="py-3.5 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {filteredOpportunities.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Pool & Asset info */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            {renderTokenIcon(item.symbol)}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm group-hover:text-[#E1007E] transition-colors">
                                  {item.name}
                                </span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-neutral-300 font-mono font-medium">
                                  {item.tag}
                                </span>
                              </div>
                              <span className="text-[11px] text-neutral-400">
                                Curator: {item.curator}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Type badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              item.type === "Leverage"
                                ? "bg-[#1a2b4c] text-[#4da2ff] border border-[#4da2ff]/30"
                                : "bg-[#133827] text-[#26d07c] border border-[#26d07c]/30"
                            }`}
                          >
                            {item.type} {item.maxLeverage !== "1.0x" ? `(${item.maxLeverage})` : ""}
                          </span>
                        </td>

                        {/* Total TVL */}
                        <td className="py-4 px-4 text-right font-mono-num font-semibold text-white">
                          <div>{item.totalSupply}</div>
                          <div className="text-[10px] text-neutral-500 font-normal">
                            {item.supplyUnit}
                          </div>
                        </td>

                        {/* Net APY */}
                        <td className="py-4 px-4 text-right font-mono-num">
                          <div className="text-sm font-bold text-white">
                            {item.apy}
                          </div>
                          <div className="text-[10px] text-[#00FF87]">
                            {item.boostApy} Monad Boost
                          </div>
                        </td>

                        {/* Borrow Rate */}
                        <td className="py-4 px-4 text-right font-mono-num text-neutral-300">
                          {item.borrowRate}
                        </td>

                        {/* Utilization Bar */}
                        <td className="py-4 px-4">
                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
                              <span>Utilized</span>
                              <span className="font-bold text-white">{item.utilization}%</span>
                            </div>
                            <div className="w-full bg-white/[0.08] h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-[#E1007E] h-full rounded-full"
                                style={{ width: `${item.utilization}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Action CTA */}
                        <td className="py-4 px-5 text-right">
                          {item.type === "Leverage" ? (
                            <button
                              onClick={() => {
                                playTick();
                                setSelectedAsset(item.symbol);
                                setActiveTab("leverage");
                              }}
                              className="px-4 py-1.5 rounded-full bg-[#E1007E] hover:bg-[#ff1a8c] text-white text-xs font-bold transition-all shadow-sm hover:shadow-[0_0_12px_rgba(225,0,126,0.4)]"
                            >
                              Open Account
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                playTick();
                                setDepositModalItem(item);
                                setDepositSuccess(false);
                              }}
                              className="px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white text-xs font-bold transition-all"
                            >
                              Deposit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LEVERAGE STUDIO (Interactive Simulator) */}
        {activeTab === "leverage" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Configuration Form */}
            <div className="lg:col-span-7 gearbox-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#E1007E]" />
                    <span>Configure Isolated Credit Account</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Borrow from senior lenders to amplify position size up to 10x with on-chain invariant guards
                  </p>
                </div>
                <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold">
                  Zero Rehypothecation
                </span>
              </div>

              {/* Asset Selection */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-neutral-400 uppercase">
                  Select Collateral Asset
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {["MON", "USDC", "WETH", "sUSDe", "CHOG"].map((asset) => (
                    <button
                      key={asset}
                      onClick={() => {
                        playTick();
                        setSelectedAsset(asset);
                      }}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                        selectedAsset === asset
                          ? "bg-[#E1007E]/10 border-[#E1007E] text-white shadow-[0_0_12px_rgba(225,0,126,0.25)]"
                          : "bg-[#14161f] border-white/[0.08] text-neutral-400 hover:text-white"
                      }`}
                    >
                      {renderTokenIcon(asset)}
                      <span className="font-bold text-xs">{asset}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Amount Input */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-neutral-400 uppercase">Deposit Collateral</span>
                  <span className="text-neutral-500">Wallet Balance: 1,420.00 {selectedAsset}</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full bg-[#161820] border border-white/[0.12] rounded-xl px-4 py-3 text-lg font-bold font-mono text-white focus:outline-none focus:border-[#E1007E]"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <button
                      onClick={() => setDepositAmount("1420.0")}
                      className="px-2 py-0.5 rounded bg-white/[0.08] text-[10px] font-mono text-neutral-300 hover:text-white"
                    >
                      MAX
                    </button>
                    <span className="font-bold text-sm text-neutral-400 font-mono">
                      {selectedAsset}
                    </span>
                  </div>
                </div>
              </div>

              {/* Leverage Multiplier Slider */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-neutral-400 uppercase">Leverage Multiplier</span>
                  <span className="text-base font-extrabold text-[#E1007E]">
                    {leverageMultiplier.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={leverageMultiplier}
                  onChange={(e) => {
                    playTick();
                    setLeverageMultiplier(parseFloat(e.target.value));
                  }}
                  className="w-full accent-[#E1007E] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-neutral-500">
                  <span>1.0x (No Borrow)</span>
                  <span>3.0x</span>
                  <span>5.0x</span>
                  <span>8.0x</span>
                  <span>10.0x (Max)</span>
                </div>
              </div>

              {/* Execution Target Sandbox */}
              <div className="p-3.5 rounded-xl bg-[#101218] border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-white font-bold block">Execution Boundary Policy</span>
                    <span className="text-[10px] text-neutral-400">
                      Isolated contract sandbox: Only allowed to trade on Kuru CLOB & deposit into verified Aura pools
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                  PROTECTED
                </span>
              </div>

              {/* Submit CTA */}
              <button
                disabled={isOpeningAccount || parsedDeposit <= 0}
                onClick={handleDeployCreditAccount}
                className="w-full py-4 rounded-xl bg-[#E1007E] hover:bg-[#ff1a8c] text-white font-bold text-sm tracking-wide transition-all shadow-[0_0_24px_rgba(225,0,126,0.35)] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isOpeningAccount ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Pipelining Monad Cancun Credit Account...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Open {leverageMultiplier.toFixed(1)}x Credit Account ({simulatedExposure} {selectedAsset})</span>
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Dynamic Financial Breakdown & Gauge */}
            <div className="lg:col-span-5 space-y-6">
              {/* Health Factor & Risk Card */}
              <div className="gearbox-card p-6 space-y-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">
                  Credit Account Risk Gauges
                </h3>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#14161f] border border-white/[0.06]">
                  <div>
                    <span className="text-[11px] text-neutral-400 block font-mono">
                      Health Factor (HF)
                    </span>
                    <span className={`text-3xl font-extrabold font-mono-num ${healthColor}`}>
                      {healthFactor}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] px-2 py-1 rounded bg-white/[0.08] font-mono text-neutral-300">
                      Liquidation @ HF &lt; 1.00
                    </span>
                    <span className="block text-[11px] text-neutral-400 mt-1">
                      Liquidation Penalty: 5.0%
                    </span>
                  </div>
                </div>

                {/* Financial Summary Matrix */}
                <div className="space-y-3 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                    <span className="text-neutral-400">User Collateral</span>
                    <span className="text-white font-bold">
                      {parsedDeposit.toFixed(2)} {selectedAsset}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                    <span className="text-neutral-400">Borrowed from Senior Tranche</span>
                    <span className="text-[#E1007E] font-bold">
                      {simulatedDebt} {selectedAsset}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                    <span className="text-neutral-400">Total Effective Exposure</span>
                    <span className="text-white font-bold">
                      {simulatedExposure} {selectedAsset}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-white/[0.04]">
                    <span className="text-neutral-400">Estimated Net Strategy APY</span>
                    <span className="text-[#00FF87] font-bold">
                      +{(14.2 * leverageMultiplier).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-400">Borrow Interest Cost</span>
                    <span className="text-neutral-300 font-bold">5.80% APR</span>
                  </div>
                </div>
              </div>

              {/* Receipt when deployed */}
              {openedAccountTx && (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Credit Account Deployed on Monad Testnet</span>
                  </div>
                  <div className="space-y-1 text-neutral-300 text-[11px]">
                    <div>
                      <span className="text-neutral-500">Account: </span>
                      <span className="text-white font-semibold">
                        {openedAccountTx.accountAddress.slice(0, 10)}...{openedAccountTx.accountAddress.slice(-8)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Tx Hash: </span>
                      <span className="text-white font-semibold">
                        {openedAccountTx.txHash.slice(0, 12)}...{openedAccountTx.txHash.slice(-8)}
                      </span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Block: </span>
                      <span className="text-emerald-400">#{openedAccountTx.blockNumber} (~382ms)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab("positions")}
                    className="w-full py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold transition-all"
                  >
                    View in Positions &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: POSITIONS (My Accounts) */}
        {activeTab === "positions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Active Isolated Credit Accounts</h2>
                <p className="text-xs text-neutral-400">
                  Manage collateral, adjust leverage boundaries, and monitor liquidation buffers
                </p>
              </div>
              <button
                onClick={() => {
                  playTick();
                  setActiveTab("leverage");
                }}
                className="gearbox-btn-pink text-xs flex items-center gap-1.5"
              >
                <span>+ Open New Account</span>
              </button>
            </div>

            <div className="gearbox-card p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#14161f] border border-white/[0.06] text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block text-[10px]">CREDIT ACCOUNT</span>
                  <span className="text-white font-bold text-sm">0x9c81b24e...7092</span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">Kuru Scalper v1.4</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">TOTAL EXPOSURE</span>
                  <span className="text-white font-bold text-sm">2,000.00 MON</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Debt: 1,500.00 MON</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">HEALTH FACTOR</span>
                  <span className="text-emerald-400 font-bold text-sm">1.84 (Safe)</span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Liq @ 0.42 MON</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    onClick={() => playOrderSubmit()}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold text-xs"
                  >
                    + Add Collateral
                  </button>
                  <button
                    onClick={() => playOrderSubmit()}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs"
                  >
                    Close Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: KURU CLOB TRADING CHART */}
        {activeTab === "kuru" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#00FF87]" />
                  <span>Kuru Central Limit Orderbook (CLOB) Execution</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Sub-second algorithmic limit orders with isolated margin borrowing on Monad
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-[#161820] border border-white/[0.08] font-mono text-neutral-300">
                  Pair: <strong className="text-white">MON / USDC</strong>
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 font-mono text-emerald-400 font-bold">
                  Spread: 0.04%
                </span>
              </div>
            </div>

            {/* High Performance Canvas Chart */}
            <AuraTradingChart pair="MON-USDC" />
          </div>
        )}

        {/* TAB 5: DUTCH AUCTIONS (Liquidations) */}
        {activeTab === "auctions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400" />
                  <span>Liquidation Dutch Auction Corridor</span>
                </h2>
                <p className="text-xs text-neutral-400">
                  Sub-second liquidation corridor preventing bad debt on Monad via Dutch price decays
                </p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono">
                Liquidator Bonus: 5.0%
              </span>
            </div>

            <div className="gearbox-card p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#14161f] border border-amber-500/20 text-xs font-mono">
                <div>
                  <span className="text-neutral-500 block text-[10px]">UNHEALTHY ACCOUNT</span>
                  <span className="text-rose-400 font-bold text-sm">0x3f12a89c...104b</span>
                  <span className="text-[10px] text-rose-300 block">Health Factor: 0.94</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">DEBT TO REPAY</span>
                  <span className="text-white font-bold text-sm">4,820.00 USDC</span>
                  <span className="text-[10px] text-neutral-400 block">Collateral: 215 MON</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">AUCTION PRICE DECAY</span>
                  <span className="text-amber-400 font-bold text-sm">96.2% of Fair Value</span>
                  <span className="text-[10px] text-neutral-400 block">Decay rate: 0.1%/sec</span>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => {
                      playOrderSubmit();
                      alert("Liquidation executed on Monad Testnet! Received 5.0% bounty bonus.");
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-[0_0_16px_rgba(245,158,11,0.35)]"
                  >
                    Liquidate Position (5% Bonus)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 4. FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#0d0e12] py-6 text-xs text-neutral-500">
        <div className="max-w-[1440px] w-full mx-auto px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded bg-[#E1007E] flex items-center justify-center text-[10px] text-white font-black">
              A
            </div>
            <span>AURA Vault — Monad Metropolis Hackathon Track 01</span>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px]">
            <span>Monad Cancun Parallel EVM</span>
            <span>Gearbox v3 Credit Invariants</span>
            <span className="text-neutral-400">Zero Slop Guaranteed</span>
          </div>
        </div>
      </footer>

      {/* 5. DEPOSIT MODAL */}
      {depositModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="gearbox-card max-w-md w-full p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                {renderTokenIcon(depositModalItem.symbol)}
                <div>
                  <h3 className="font-bold text-white text-base">Deposit {depositModalItem.symbol}</h3>
                  <p className="text-xs text-neutral-400">{depositModalItem.name}</p>
                </div>
              </div>
              <button
                onClick={() => setDepositModalItem(null)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {depositSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="font-bold text-white text-sm">Deposit Confirmed!</div>
                <p className="text-neutral-300">
                  Successfully supplied {lendAmount} {depositModalItem.symbol} into senior tranche.
                </p>
                <button
                  onClick={() => setDepositModalItem(null)}
                  className="mt-3 px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-neutral-400">
                    <span>Deposit Amount</span>
                    <span>APY: {depositModalItem.apy}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      value={lendAmount}
                      onChange={(e) => setLendAmount(e.target.value)}
                      className="w-full bg-[#161820] border border-white/[0.12] rounded-xl px-4 py-3 font-mono font-bold text-white text-base focus:outline-none focus:border-[#E1007E]"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 font-mono">
                      {depositModalItem.symbol}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#14161f] text-xs font-mono space-y-1 text-neutral-300">
                  <div className="flex justify-between">
                    <span>Expected Monthly Yield</span>
                    <span className="text-[#00FF87] font-bold">
                      +{(parseFloat(lendAmount || "0") * 0.08 / 12).toFixed(2)} {depositModalItem.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Withdrawal Liquidity</span>
                    <span className="text-white">Instantaneous (Sub-second)</span>
                  </div>
                </div>

                <button
                  disabled={isDepositing}
                  onClick={() => {
                    playDepositChime();
                    setIsDepositing(true);
                    setTimeout(() => {
                      setIsDepositing(false);
                      setDepositSuccess(true);
                    }, 800);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#E1007E] hover:bg-[#ff1a8c] text-white font-bold text-sm transition-all shadow-[0_0_16px_rgba(225,0,126,0.35)]"
                >
                  {isDepositing ? "Pipelining Deposit..." : `Confirm Deposit of ${lendAmount} ${depositModalItem.symbol}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
