// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../types/Types.sol";

interface ISwapHandler {
    function processSwap(
        ShieldedSwapData calldata swapData
    ) external payable returns (uint256 swapOutput, uint256 totalProtocolFee);
    
    function processJoinSplitSwap(
        JoinSplitSwapData calldata swapData
    ) external payable returns (uint256 swapOutput, uint256 totalProtocolFee);
}
