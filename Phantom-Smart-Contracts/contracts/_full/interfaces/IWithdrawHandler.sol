// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../types/Types.sol";

interface IWithdrawHandler {
    function processWithdraw(
        ShieldedWithdrawData calldata withdrawData
    ) external returns (uint256 withdrawAmount, uint256 protocolFee);
}
