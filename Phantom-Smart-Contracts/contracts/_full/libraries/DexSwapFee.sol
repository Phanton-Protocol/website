// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title DexSwapFee
 * @notice Protocol DEX swap fee: **10 bps (0.10%)** of input notional (Phantom E-paper §1.8).
 * @dev Must match `RUNTIME_PARAMS.fees.dexSwapFeeBps` (default 10) in relayer `index.js`.
 */
library DexSwapFee {
    uint256 internal constant BPS = 10;
    uint256 internal constant DENOMINATOR = 10000;

    function swapFee(uint256 inputAmount) internal pure returns (uint256) {
        return (inputAmount * BPS) / DENOMINATOR;
    }
}
