// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../types/Types.sol";

/**
 * @title JoinSplitPublicInputValidation
 * @notice Calldata checks + verifier calldata packing for join-split (M3a). Linked to reduce pool bytecode.
 * @dev Align with `SwapHandler.processJoinSplitSwap` / `WithdrawHandler` / `withdrawValidate.js` (non-fee; M3b fees).
 *      Revert codes: `cvs` conservation, `gRf` gas refund bound, `zSw`/`zCh` zero legs, `wCm`/`wAs`/`wAm` withdraw swap fields,
 *      `zWd` zero withdraw leg. Pool DEX binding: `SP:slp` slippage, `SP:out` exact output vs public `outputAmountSwap`.
 */
library JoinSplitPublicInputValidation {
    function merklePathToBytes32(uint256[10] memory arr) internal pure returns (bytes32[10] memory result) {
        unchecked {
            for (uint256 i = 0; i < 10; ++i) {
                result[i] = bytes32(arr[i]);
            }
        }
    }

    /// @dev Order matches `JoinSplitVerifier` / circuit public signals.
    function joinSplitInputsToArray(JoinSplitPublicInputs memory inputs) internal pure returns (uint256[] memory arr) {
        arr = new uint256[](9);
        arr[0] = uint256(inputs.nullifier);
        arr[1] = uint256(inputs.inputCommitment);
        arr[2] = uint256(inputs.outputCommitmentSwap);
        arr[3] = uint256(inputs.outputCommitmentChange);
        arr[4] = uint256(inputs.merkleRoot);
        arr[5] = inputs.outputAmountSwap;
        arr[6] = inputs.minOutputAmountSwap;
        arr[7] = inputs.protocolFee;
        arr[8] = inputs.gasRefund;
    }

    function requireCalldataConservation(JoinSplitPublicInputs memory inputs) internal pure {
        require(
            inputs.inputAmount == inputs.swapAmount + inputs.changeAmount + inputs.protocolFee + inputs.gasRefund,
            "SP:cvs"
        );
        require(inputs.gasRefund <= inputs.inputAmount, "SP:gRf");
    }

    function requireDexJoinSplitShape(JoinSplitPublicInputs memory inputs) internal pure {
        requireCalldataConservation(inputs);
        require(inputs.swapAmount > 0, "SP:zSw");
        require(inputs.changeAmount > 0, "SP:zCh");
    }

    function requireWithdrawJoinSplitShape(JoinSplitPublicInputs memory inputs) internal pure {
        requireCalldataConservation(inputs);
        require(inputs.outputCommitmentSwap == bytes32(0), "SP:wCm");
        require(inputs.outputAssetIDSwap == 0, "SP:wAs");
        require(inputs.outputAmountSwap == 0 && inputs.minOutputAmountSwap == 0, "SP:wAm");
        require(inputs.swapAmount > 0, "SP:zWd");
        require(inputs.changeAmount > 0, "SP:zCh");
    }
}
