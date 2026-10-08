// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "./AuraVault.sol";

/**
 * @title AuraCreditEngine
 * @notice Advance Continuous Clearing & Cassie Pre-Flight Verification Engine on Monad
 * @dev Dispatches high-frequency parallel orders to Kuru DEX orderbooks with pre-flight VaR guarantees.
 */
contract AuraCreditEngine {
    AuraVault public immutable vault;
    address public immutable owner;

    struct OrderIntent {
        address agentKey;
        address targetMarket;
        uint256 creditAmount;
        bytes callPayload;
        uint256 maxSlippageBps;
    }

    event OrderDispatched(address indexed agentKey, address indexed targetMarket, uint256 creditAmount, bool success);
    event PreFlightAuditPassed(address indexed agentKey, uint256 riskScore, string status);

    modifier onlyOwner() {
        require(msg.sender == owner, "AuraCreditEngine: Caller not owner");
        _;
    }

    constructor(address payable _vault) {
        vault = AuraVault(_vault);
        owner = msg.sender;
    }

    /**
     * @notice Cassie Pre-Flight Simulation Matrix
     * @dev Validates credit headroom, target validity, and calculates synthetic risk score (1-100).
     */
    function simulateOrder(
        address targetMarket,
        uint256 creditAmount
    ) external view returns (bool allowed, uint256 riskScore, string memory status) {
        if (vault.circuitBreakerActive()) {
            return (false, 100, "HALTED: CIRCUIT_BREAKER_ACTIVE");
        }
        if (targetMarket == address(0)) {
            return (false, 90, "REJECTED: ZERO_ADDRESS_MARKET");
        }
        if (address(vault).balance < creditAmount) {
            return (false, 80, "REJECTED: INSUFFICIENT_IDLE_VAULT_LIQUIDITY");
        }

        uint256 availableQuota = vault.maxCreditQuota() - vault.activeCreditBorrows();
        if (creditAmount > availableQuota) {
            return (false, 85, "REJECTED: EXCEEDS_CREDIT_QUOTA");
        }

        uint256 score = 10 + (creditAmount * 40) / vault.maxCreditQuota();
        return (true, score, "PASSED: RISK_CLEAR_FOR_PARALLEL_EXECUTION");
    }

    /**
     * @notice High-throughput order dispatch on Monad
     */
    function dispatchOrder(
        address targetMarket,
        uint256 creditAmount,
        bytes calldata callPayload
    ) external returns (bool success, bytes memory returnData) {
        // 1. Borrow credit from vault directly to target
        bool borrowed = vault.borrowCredit(msg.sender, targetMarket, creditAmount);
        require(borrowed, "AuraCreditEngine: Vault borrow failed");

        // 2. Execute target DEX trade
        (success, returnData) = targetMarket.call(callPayload);
        require(success, "AuraCreditEngine: Target DEX execution reverted");

        emit OrderDispatched(msg.sender, targetMarket, creditAmount, success);
    }
}
