// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IVerifier.sol";

/**
 * @title MockThresholdVerifier
 * @notice Always returns true for verifyProof - for dev/E2E testing without validators
 * @dev Use only on testnet. Replace with real ThresholdVerifier for production.
 */
contract MockThresholdVerifier is IVerifier {
    function verifyProof(
        Proof calldata /* proof */,
        uint256[] calldata /* publicInputs */
    ) external pure override returns (bool) {
        return true;
    }
}
