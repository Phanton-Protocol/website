// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IPancakeSwapAdaptor.sol";

/**
 * @notice Test adaptor: returns `amountIn - 1` to exercise strict DEX vs public `outputAmountSwap` binding.
 * @dev Not for production.
 */
contract MockSwapAdaptorSubtractWei is IPancakeSwapAdaptor {
    function executeSwap(SwapParams calldata params) external payable override returns (uint256) {
        require(params.amountIn > 0, "MockSwapAdaptorSubtractWei: zero amount");
        return params.amountIn - 1;
    }

    function getExpectedOutput(SwapParams calldata params) external view override returns (uint256) {
        if (params.amountIn == 0) return 0;
        return params.amountIn - 1;
    }
}
