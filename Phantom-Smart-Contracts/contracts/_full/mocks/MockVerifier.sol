// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IVerifier.sol";

/**
 * @title MockVerifier
 * @notice Temporary mock for testing - always returns true
 * @dev DO NOT USE IN PRODUCTION
 */
contract MockVerifier is IVerifier {
    /**
     * @notice Mock proof verification - always passes
     * @dev In production, this would verify ZK-SNARK proofs
     */
    function verifyProof(
        Proof calldata,
        uint256[] calldata
    ) external pure override returns (bool) {
        return true; // Always accept proofs for testing
    }
}
