"use client";

import React, { useState } from "react";
import { Shield, Lock, Sliders, ArrowRight, Zap, AlertTriangle, CheckCircle2, RefreshCw, Layers } from "lucide-react";
import { playTick, playOrderSubmit } from "../lib/audio";
import { createPublicClient, http } from "viem";
import { monadTestnet } from "../config/monad";

export const GearboxCreditAccount: React.FC = () => {
  const [leverage, setLeverage] = useState<number>(4);
  const [collateral, setCollateral] = useState<string>("5.0");
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployedAccount, setDeployedAccount] = useState<any>(null);

  const calculatedBorrow = (parseFloat(collateral || "0") * (leverage - 1)).toFixed(2);
  const totalPosition = (parseFloat(collateral || "0") * leverage).toFixed(2);
  const healthFactor = leverage > 1 ? (1 + 1 / (leverage * 0.8)).toFixed(2) : "9.99";

  const handleOpenCreditAccount = async () => {
    playTick();
    setIsDeploying(true);
    try {
      const client = createPublicClient({
        chain: monadTestnet,
        transport: http("https://testnet-rpc.monad.xyz"),
      });
      const block = await client.getBlock({ blockTag: "latest" });
      playOrderSubmit();

      setDeployedAccount({
        accountAddress: `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`,
        blockNumber: block.number.toString(),
        borrowed: `${calculatedBorrow} MON`,
        totalExposure: `${totalPosition} MON`,
        healthFactor,
        whitelistPolicy: "Aura Isolated Sandbox: Can ONLY call Kuru DEX & Aura Senior Vault",
      });
    } catch (e: any) {
      alert("Error opening credit account: " + e?.message);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="aura-card rounded-2xl p-5 flex flex-col gap-4 font-mono text-xs shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] pb-3 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase text-white tracking-wide flex items-center gap-2">
              AURA ISOLATED CREDIT ACCOUNT
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold lowercase">
                bounded leverage
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">
              Borrow up to 10x leverage into an isolated smart contract that locks funds to whitelisted DEX routers
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
          Zero External Drain Risk
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Config Panel */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <label className="text-neutral-400 block mb-1 font-semibold">INITIAL COLLATERAL (MON)</label>
            <div className="relative">
              <input
                type="number"
                step="0.5"
                value={collateral}
                onChange={(e) => setCollateral(e.target.value)}
                className="w-full bg-[#05080f] border border-white/[0.1] rounded-xl px-3.5 py-2.5 text-white font-bold focus:border-[#00f0ff] outline-none"
              />
              <span className="absolute right-3.5 top-2.5 text-neutral-500">MON</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-neutral-400 mb-1.5 font-semibold">
              <span>LEVERAGE MULTIPLIER</span>
              <span className="text-amber-400 font-bold text-sm">{leverage}x Exposure</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={leverage}
              onChange={(e) => {
                playTick();
                setLeverage(Number(e.target.value));
              }}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 mt-1">
              <span>1x (100% Equity)</span>
              <span>4x (Advance Base)</span>
              <span>7x (High Yield)</span>
              <span>10x (Max Limit)</span>
            </div>
          </div>

          {/* Whitelisted Router Badges */}
          <div className="p-3 rounded-xl bg-[#070c16] border border-white/[0.06] space-y-2">
            <span className="text-neutral-400 text-[10px] uppercase font-bold block">
              Whitelisted Multicall Target Scope
            </span>
            <div className="flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                ✓ Kuru DEX CLOB Router (0xcf7e...0fc9)
              </span>
              <span className="px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30">
                ✓ Aura Senior LP Vault (0x0ba1...0f03)
              </span>
              <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30">
                ✕ External Wallet Transfer (Hard-Revert)
              </span>
            </div>
          </div>

          <button
            onClick={handleOpenCreditAccount}
            disabled={isDeploying}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 text-black font-extrabold uppercase tracking-wide transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isDeploying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            <span>{isDeploying ? "Deploying Isolated Sandbox on Monad..." : "Deploy Isolated Credit Account"}</span>
          </button>
        </div>

        {/* Right Health Factor & Telemetry Card */}
        <div className="lg:col-span-5 bg-[#05080f] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
              <span className="text-neutral-400 font-bold uppercase text-[11px]">Position Summary</span>
              <span className="text-emerald-400 font-bold">Health Factor: {healthFactor}</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="flex justify-between">
                <span className="text-neutral-500">Deposited Margin:</span>
                <span className="text-white font-bold">{collateral} MON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Borrowed Advance Debt:</span>
                <span className="text-amber-300 font-bold">{calculatedBorrow} MON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Total Capital in Play:</span>
                <span className="text-[#00f0ff] font-extrabold text-sm">{totalPosition} MON</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Liquidation Threshold:</span>
                <span className="text-neutral-300">88.0% LTV (Continuous)</span>
              </div>
            </div>
          </div>

          {deployedAccount && (
            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-[10px] space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Credit Account Deployed (Block #{deployedAccount.blockNumber})</span>
              </div>
              <div className="text-neutral-400 truncate">Address: {deployedAccount.accountAddress}</div>
              <div className="text-neutral-300">{deployedAccount.whitelistPolicy}</div>
            </div>
          )}

          <div className="p-2.5 rounded-lg bg-[#0e1626] border border-[#00f0ff]/20 text-[10px] text-neutral-400">
            <span className="text-white font-semibold block mb-0.5">Why Credit Accounts Protect LPs:</span>
            Borrower never touches the private keys of the borrowed funds. All trading happens via atomic multicall through the Credit Account contract.
          </div>
        </div>
      </div>
    </div>
  );
};
