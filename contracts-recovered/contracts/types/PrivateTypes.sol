// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Types.sol";

// Re-export types for convenience
// Proof, SwapParams are defined in Types.sol

/**
 * @title PrivateTypes
 * @notice Privacy-enhanced data structures - amounts hidden in ZK proof
 * @dev These types move sensitive data (amounts, asset IDs) inside the ZK proof
 * 
 * CRITICAL PRIVACY FIX:
 * - Amounts are NOT in public inputs (hidden in proof)
 * - Asset IDs are NOT in public inputs (in commitments)
 * - Only commitments, nullifiers, and merkle root are public
 * 
 * Circuit Requirements:
 * - ZK circuit must verify amounts match commitments INSIDE proof
 * - Circuit must verify asset IDs match commitments INSIDE proof
 * - Public inputs: Only commitments, nullifiers, merkle root
 */

/**
 * @notice Privacy-enhanced public inputs (amounts hidden)
 * @dev Only commitments and nullifiers are public - amounts are in proof
 */
struct PrivatePublicInputs {
    bytes32 nullifier;           // Hash of spent note (prevents double-spending)
    bytes32 inputCommitment;     // Commitment of the note being spent
    bytes32 outputCommitment;    // Commitment of the new note being created
    bytes32 merkleRoot;          // Current Merkle root of the state tree
    // Amounts, asset IDs, fees are INSIDE the ZK proof (private inputs)
    // Circuit verifies: commitment = pedersen(amount, assetID, blindingFactor, ...)
}

/**
 * @notice Privacy-enhanced join-split public inputs
 * @dev Amounts and asset IDs are hidden in proof
 */
struct PrivateJoinSplitPublicInputs {
    bytes32 nullifier;              // Hash of spent note
    bytes32 inputCommitment;        // Commitment of the note being spent
    bytes32 outputCommitmentSwap;    // Commitment of the swap output note
    bytes32 outputCommitmentChange; // Commitment of the change note
    bytes32 merkleRoot;             // Current Merkle root
    // All amounts, asset IDs, fees are INSIDE the ZK proof
}

/**
 * @notice Private swap data (amounts hidden)
 * @dev SwapParams still needed for PancakeSwap, but amounts verified via commitment
 */
struct PrivateShieldedSwapData {
    Proof proof;                      // ZK-SNARK proof (contains amounts as private inputs)
    PrivatePublicInputs publicInputs; // Only commitments public
    SwapParams swapParams;            // For PancakeSwap execution (amounts verified via commitment)
    address relayer;                  // Relayer address
    bytes commitmentProof;           // Optional: Proof that swapParams.amountIn matches commitment
}

/**
 * @notice Private join-split swap data
 */
struct PrivateJoinSplitSwapData {
    Proof proof;                              // ZK-SNARK proof (contains all amounts)
    PrivateJoinSplitPublicInputs publicInputs; // Only commitments public
    SwapParams swapParams;                    // For PancakeSwap (verified via commitment)
    address relayer;                          // Relayer address
    bytes encryptedPayload;                   // Optional encrypted payload
}

/**
 * @notice Commitment verification data
 * @dev Used to verify amounts match commitments without revealing amounts
 */
struct CommitmentVerification {
    bytes32 commitment;      // Commitment hash
    bytes32 amountHash;      // Hash of amount (for verification)
    bytes32 assetIDHash;     // Hash of asset ID (for verification)
    bytes proof;             // ZK proof that commitment matches amount/assetID
}
