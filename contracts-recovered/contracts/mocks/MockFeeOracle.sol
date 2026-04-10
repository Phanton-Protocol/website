// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IFeeOracle.sol";

/**
 * @title MockFeeOracle
 * @notice Temporary mock for testing - bypasses fee calculation
 * @dev DO NOT USE IN PRODUCTION
 */
contract MockFeeOracle is IFeeOracle {
    function requireFreshPrice(address) external pure override {
        // Always pass
    }

    function calculateFee(address, uint256) external pure override returns (uint256) {
        return 0;
    }

    function getUSDValue(address, uint256 amount) external pure override returns (uint256) {
        // Simulate ~$600/BNB for testing: 1e18 wei -> $600 (600e8)
        return (amount * 600e8) / 1e18;
    }

    function getTokenAmountForUSD(address, uint256 usdValue) external pure override returns (uint256) {
        // $2 = 2e8 -> ~0.00333 BNB (2e8 * 1e18 / 600e8)
        return (usdValue * 1e18) / 600e8;
    }
}
