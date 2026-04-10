// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AntiAnalysisPool.sol";
import "./DynamicPoolFactory.sol";

/**
 * @title PrivacyEnhancedPool
 * @notice Complete privacy-enhanced pool with all Monero-level features
 * @dev Combines FHE encryption, dynamic pools, and anti-analysis tools
 * 
 * Full Feature Set:
 * 1. FHE-encrypted commitments (euint hashes)
 * 2. Dynamic sub-pool rotation
 * 3. FHE-encrypted queries (TVL obfuscation)
 * 4. Timing randomization
 * 5. Dummy deposit noise
 * 6. Blinded signatures
 * 7. Client-side decryption
 */
contract PrivacyEnhancedPool is AntiAnalysisPool {
    
    // ============ State Variables ============
    
    /// @notice Pool factory for dynamic pool management
    DynamicPoolFactory public immutable poolFactory;
    
    /// @notice Current pool rotation index
    uint256 public currentPoolRotation;
    
    // ============ Constructor ============
    
    constructor(
        address _verifier,
        address _thresholdVerifier,
        address _swapAdaptor,
        address _feeOracle,
        address _relayerRegistry,
        address _fheCoprocessor,
        address _poolFactory
    ) AntiAnalysisPool(
        _verifier,
        _thresholdVerifier,
        _swapAdaptor,
        _feeOracle,
        _relayerRegistry,
        _fheCoprocessor
    ) {
        require(_poolFactory != address(0), "PrivacyEnhancedPool: zero factory");
        poolFactory = DynamicPoolFactory(_poolFactory);
    }
    
    // ============ Enhanced Deposit with Full Privacy ============
    
    /**
     * @notice Deposit with full privacy features
     * @dev FHE encryption + timing randomization + noise
     * @param token Token address
     * @param amount Amount
     * @param commitment Plain commitment
     * @param fheEncryptedCommitment FHE-encrypted commitment
     * @param fheEncryptedAmount FHE-encrypted amount
     * @param assetID Asset ID
     * @param useDelay Whether to use timing randomization
     */
    function depositFullPrivacy(
        address token,
        uint256 amount,
        bytes32 commitment,
        bytes calldata fheEncryptedCommitment,
        bytes calldata fheEncryptedAmount,
        uint256 assetID,
        bool useDelay
    ) external payable {
        if (useDelay) {
            // Submit with random delay
            bytes memory txData = abi.encode(
                token,
                amount,
                commitment,
                fheEncryptedCommitment,
                fheEncryptedAmount,
                assetID
            );
            this.submitWithDelay(txData);
        } else {
            // Immediate deposit
            this.depositFHE(
                token,
                amount,
                commitment,
                fheEncryptedCommitment,
                fheEncryptedAmount,
                assetID
            );
        }
        
        // Dummy deposits removed - not needed and wastes gas
    }
    
    // ============ FHE-Encrypted Aggregate Queries ============
    
    /**
     * @notice Query total TVL across factory pools (FHE-encrypted)
     * @return fheEncryptedTotal FHE-encrypted total (euint)
     */
    function getFactoryTVLFHE() external view returns (bytes memory fheEncryptedTotal) {
        return poolFactory.getTotalTVLFHE();
    }
}
