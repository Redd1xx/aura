import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadExplorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

export const AURA_VAULT_ABI = [
  {
    type: "function",
    name: "deposit",
    stateMutability: "payable",
    inputs: [],
    outputs: [{ name: "shares", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdraw",
    stateMutability: "nonpayable",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "payout", type: "uint256" }],
  },
  {
    type: "function",
    name: "claimCuratorFee",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [{ name: "amount", type: "uint256" }],
  },
  {
    type: "function",
    name: "getVaultMetrics",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "aum", type: "uint256" },
      { name: "idleLiquidity", type: "uint256" },
      { name: "borrows", type: "uint256" },
      { name: "creditLimit", type: "uint256" },
      { name: "yieldDistributed", type: "uint256" },
      { name: "claimableFees", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "shareBalance",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const AURA_ENGINE_ABI = [
  {
    type: "function",
    name: "simulateOrder",
    stateMutability: "view",
    inputs: [
      { name: "targetMarket", type: "address" },
      { name: "creditAmount", type: "uint256" },
    ],
    outputs: [
      { name: "allowed", type: "bool" },
      { name: "riskScore", type: "uint256" },
      { name: "status", type: "string" },
    ],
  },
] as const;
