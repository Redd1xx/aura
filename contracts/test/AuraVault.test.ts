import assert from "node:assert";
import hre from "hardhat";
import { parseEther } from "viem";

describe("AURA Vault Protocol - Monad Track 01 Benchmark", function () {
  async function deployAuraFixture() {
    const [curator, depositor, agentUser] = await hre.viem.getWalletClients();
    const publicClient = await hre.viem.getPublicClient();

    // 1. Deploy AuraVault
    const vault = await hre.viem.deployContract("AuraVault");

    // 2. Deploy AuraCreditEngine
    const creditEngine = await hre.viem.deployContract("AuraCreditEngine", [vault.address]);

    return {
      vault,
      creditEngine,
      curator,
      depositor,
      agentUser,
      publicClient,
    };
  }

  it("Accepts permissionless deposits and mints auraLP shares (T3tris Model)", async function () {
    const { vault, depositor } = await deployAuraFixture();

    const depositAmount = parseEther("10");
    await vault.write.deposit({
      value: depositAmount,
      account: depositor.account,
    });

    const shares = await vault.read.shareBalance([depositor.account.address]);
    assert.strictEqual(shares, depositAmount);

    const totalAssets = await vault.read.totalAssets();
    assert.strictEqual(totalAssets, depositAmount);
  });

  it("Executes continuous agent credit borrowing and yields 80/20 profit split (Advance Model)", async function () {
    const { vault, curator, depositor } = await deployAuraFixture();

    // Seed vault liquidity
    await vault.write.deposit({
      value: parseEther("20"),
      account: depositor.account,
    });

    // Curator issues credit line to agent target
    const borrowAmount = parseEther("5");
    await vault.write.borrowCredit([curator.account.address, curator.account.address, borrowAmount], {
      account: curator.account,
    });

    const borrowsAfter = await vault.read.activeCreditBorrows();
    assert.strictEqual(borrowsAfter, borrowAmount);

    // Agent repays credit with 1 MON profit (total 6 MON sent)
    const profit = parseEther("1");
    await vault.write.repayCredit([curator.account.address, borrowAmount], {
      value: borrowAmount + profit,
      account: curator.account,
    });

    // Check 20% curator fee (0.2 MON) and 80% LP yield (0.8 MON)
    const accruedFees = await vault.read.accruedCuratorFees();
    const distributedYield = await vault.read.totalYieldDistributed();
    assert.strictEqual(accruedFees, parseEther("0.2"));
    assert.strictEqual(distributedYield, parseEther("0.8"));
  });

  it("Runs Cassie Pre-Flight Order Simulation before dispatch (Cassie Model)", async function () {
    const { vault, creditEngine, depositor } = await deployAuraFixture();

    await vault.write.deposit({
      value: parseEther("15"),
      account: depositor.account,
    });

    const mockMarket = "0x0000000000000000000000000000000000000042";
    const simOrder = await creditEngine.read.simulateOrder([mockMarket, parseEther("2")]);

    // [allowed, riskScore, status]
    assert.strictEqual(simOrder[0], true);
    assert.strictEqual(simOrder[1] <= 60n, true); // Low to medium risk score
  });

  it("Enforces emergency circuit breaker halt", async function () {
    const { vault, curator } = await deployAuraFixture();

    await vault.write.toggleCircuitBreaker({ account: curator.account });
    const isHalted = await vault.read.circuitBreakerActive();
    assert.strictEqual(isHalted, true);
  });
});
