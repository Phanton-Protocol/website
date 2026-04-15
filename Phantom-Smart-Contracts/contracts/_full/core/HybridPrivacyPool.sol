// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ShieldedPool.sol";

/**
 * @title HybridPrivacyPool
 * @notice Works on BSC now with ZK-only mode, ready for FHE when Zama supports BSC
 * @dev Enhanced privacy using ZK-SNARKs + Pedersen commitments (works everywhere)
 * 
 * Privacy Features (BSC Compatible):
 * - ZK-SNARK proofs (Groth16/Plonk)
 * - Pedersen commitments (hides amounts)
 * - Merkle tree privacy (hides balances)
 * - Multiple commitment layers (enhanced obfuscation)
 * - Future: FHE when Zama supports BSC
 * 
 * This pool works on BSC immediately with strong privacy.
 * When Zama adds BSC support, can upgrade to FHE mode.
 */
contract HybridPrivacyPool is ShieldedPool {
    
    // ============ Enhanced Privacy Features ============
    
    /// @notice Multiple commitment layers for enhanced privacy
    /// @dev commitment => array of additional commitment hashes
    mapping(bytes32 => bytes32[]) public commitmentLayers;
    
    /// @notice Noise commitments (obfuscate patterns)
    /// @dev Random commitments added to break analysis
    bytes32[] public noiseCommitments;
    
    /// @notice Maximum noise commitments
    uint256 public constant MAX_NOISE = 100;
    
    // ============ Events ============
    
    event EnhancedCommitmentStored(
        bytes32 indexed commitment,
        bytes32[] layers,
        uint256 layerCount
    );
    
    event NoiseCommitmentAdded(bytes32 indexed noiseCommitment);
    
    // ============ Constructor ============
    
    constructor(
        address _verifier,
        address _thresholdVerifier,
        address _swapAdaptor,
        address _feeOracle,
        address _relayerRegistry
    ) ShieldedPool(
        _verifier,
        address(0),
        _thresholdVerifier,
        _swapAdaptor,
        _feeOracle,
        _relayerRegistry
    ) {}
    
    // ============ Enhanced Deposit ============
    
    /**
     * @notice Deposit with enhanced privacy (multiple commitment layers)
     * @dev Creates multiple commitment hashes to obfuscate patterns
     * @param token Token address
     * @param amount Amount
     * @param commitment Primary commitment
     * @param assetID Asset ID
     * @param additionalCommitments Additional commitment hashes for layering
     */
    function depositEnhanced(
        address token,
        uint256 amount,
        bytes32 commitment,
        uint256 assetID,
        bytes32[] calldata additionalCommitments
    ) external payable {
        // Standard deposit
        _depositInternal(msg.sender, token, amount, commitment, assetID, msg.value, address(0));
        
        // Store additional commitment layers
        if (additionalCommitments.length > 0) {
            commitmentLayers[commitment] = additionalCommitments;
            emit EnhancedCommitmentStored(commitment, additionalCommitments, additionalCommitments.length);
        }
    }
    
    // ============ Noise Generation ============
    
    /**
     * @notice Add noise commitment (breaks pattern analysis)
     * @dev Can be called by anyone to add privacy noise
     * @param noiseCommitment Random commitment hash
     */
    function addNoiseCommitment(bytes32 noiseCommitment) external {
        require(noiseCommitments.length < MAX_NOISE, "HybridPrivacyPool: max noise reached");
        require(noiseCommitment != bytes32(0), "HybridPrivacyPool: zero commitment");
        
        noiseCommitments.push(noiseCommitment);
        emit NoiseCommitmentAdded(noiseCommitment);
    }
    
    /**
     * @notice Get noise commitment count
     * @return count Number of noise commitments
     */
    function getNoiseCount() external view returns (uint256 count) {
        return noiseCommitments.length;
    }
    
    // ============ Privacy Queries ============
    
    /**
     * @notice Get obfuscated pool balance (returns merkle root hash)
     * @dev Observers can't see real balance, only merkle root
     * @return obfuscatedBalance Merkle root hash (obfuscates real balance)
     */
    function getObfuscatedBalance() external view returns (bytes32 obfuscatedBalance) {
        return merkleRoot; // merkleRoot is a public state variable in ShieldedPool
    }
    
    /**
     * @notice Get commitment layers for a commitment
     * @param commitment Commitment hash
     * @return layers Array of additional commitment hashes
     */
    function getCommitmentLayers(bytes32 commitment) external view returns (bytes32[] memory layers) {
        return commitmentLayers[commitment];
    }
}
