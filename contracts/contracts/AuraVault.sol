// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title AuraVault
 * @notice Permissionless Autonomous Agent Liquidity Vault on Monad (T3tris & Advance Primitives)
 * @dev High-throughput deposit, borrow credit line, continuous clearing, and asymmetric yield harvest.
 */
contract AuraVault {
    string public constant name = "AURA Liquidity Vault";
    string public constant symbol = "auraLP";
    uint8 public constant decimals = 18;

    address public immutable curator;
    uint256 public totalShares;
    mapping(address => uint256) public shareBalance;

    uint256 public activeCreditBorrows;
    uint256 public maxCreditQuota;
    uint256 public totalYieldDistributed;
    uint256 public accruedCuratorFees;

    uint256 public constant CURATOR_FEE_BPS = 2000; // 20% to Curator
    uint256 public constant BPS_DENOMINATOR = 10000; // 80% to LPs

    bool public circuitBreakerActive;

    event Deposited(address indexed depositor, uint256 monAmount, uint256 sharesMinted);
    event Withdrawn(address indexed depositor, uint256 monAmount, uint256 sharesBurned);
    event CreditBorrowed(address indexed agentSession, address indexed target, uint256 amount);
    event CreditRepaid(address indexed agentSession, uint256 principal, uint256 profit);
    event CuratorFeeClaimed(address indexed curator, uint256 amount);
    event CircuitBreakerToggled(bool active);

    modifier onlyCurator() {
        require(msg.sender == curator, "AuraVault: Caller not curator");
        _;
    }

    modifier whenNotHalted() {
        require(!circuitBreakerActive, "AuraVault: Circuit breaker engaged");
        _;
    }

    constructor() {
        curator = msg.sender;
        maxCreditQuota = 100 ether; // 100 MON default credit line quota
    }

    receive() external payable {
        deposit();
    }

    function totalAssets() public view returns (uint256) {
        return address(this).balance + activeCreditBorrows;
    }

    function deposit() public payable whenNotHalted returns (uint256 shares) {
        require(msg.value > 0, "AuraVault: Zero deposit amount");

        uint256 poolAssets = totalAssets() - msg.value;
        if (totalShares == 0 || poolAssets == 0) {
            shares = msg.value;
        } else {
            shares = (msg.value * totalShares) / poolAssets;
        }

        require(shares > 0, "AuraVault: Zero shares minted");
        shareBalance[msg.sender] += shares;
        totalShares += shares;

        emit Deposited(msg.sender, msg.value, shares);
    }

    function withdraw(uint256 shares) external returns (uint256 payout) {
        require(shares > 0, "AuraVault: Zero shares");
        require(shareBalance[msg.sender] >= shares, "AuraVault: Insufficient share balance");

        payout = (shares * address(this).balance) / totalShares;
        require(payout > 0, "AuraVault: Zero payout");
        require(address(this).balance >= payout, "AuraVault: Liquidity locked in active orders");

        shareBalance[msg.sender] -= shares;
        totalShares -= shares;

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "AuraVault: Payout transfer failed");

        emit Withdrawn(msg.sender, payout, shares);
    }

    function borrowCredit(
        address agentSession,
        address target,
        uint256 amount
    ) external onlyCurator whenNotHalted returns (bool) {
        require(activeCreditBorrows + amount <= maxCreditQuota, "AuraVault: Exceeds max credit quota");
        require(address(this).balance >= amount, "AuraVault: Insufficient vault liquidity");

        activeCreditBorrows += amount;

        (bool sent, ) = payable(target).call{value: amount}("");
        require(sent, "AuraVault: Credit transfer failed");

        emit CreditBorrowed(agentSession, target, amount);
        return true;
    }

    function repayCredit(
        address agentSession,
        uint256 principal
    ) external payable {
        require(msg.value >= principal, "AuraVault: Underfunded repayment");
        require(activeCreditBorrows >= principal, "AuraVault: Over-repaying principal");

        activeCreditBorrows -= principal;
        uint256 profit = msg.value - principal;

        if (profit > 0) {
            uint256 curatorFee = (profit * CURATOR_FEE_BPS) / BPS_DENOMINATOR;
            uint256 lpYield = profit - curatorFee;

            totalYieldDistributed += lpYield;
            accruedCuratorFees += curatorFee;
        }

        emit CreditRepaid(agentSession, principal, profit);
    }

    function claimCuratorFee() external onlyCurator returns (uint256 amount) {
        amount = accruedCuratorFees;
        require(amount > 0, "AuraVault: No fees accrued");
        require(address(this).balance >= amount, "AuraVault: Insufficient vault cash");

        accruedCuratorFees = 0;
        (bool sent, ) = payable(curator).call{value: amount}("");
        require(sent, "AuraVault: Fee transfer failed");

        emit CuratorFeeClaimed(curator, amount);
    }

    function toggleCircuitBreaker() external onlyCurator {
        circuitBreakerActive = !circuitBreakerActive;
        emit CircuitBreakerToggled(circuitBreakerActive);
    }

    function setMaxCreditQuota(uint256 newQuota) external onlyCurator {
        maxCreditQuota = newQuota;
    }

    function getVaultMetrics() external view returns (
        uint256 aum,
        uint256 idleLiquidity,
        uint256 borrows,
        uint256 creditLimit,
        uint256 yieldDistributed,
        uint256 claimableFees
    ) {
        return (
            totalAssets(),
            address(this).balance,
            activeCreditBorrows,
            maxCreditQuota,
            totalYieldDistributed,
            accruedCuratorFees
        );
    }
}
