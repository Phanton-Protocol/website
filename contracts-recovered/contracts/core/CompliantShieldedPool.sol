// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ShieldedPool.sol";
import "./ComplianceModule.sol";

/**
 * @title CompliantShieldedPool
 * @notice ShieldedPool with Chainalysis compliance
 * @dev Phantom Protocol - Compliant Privacy Pool
 * 
 * Features:
 * - All ShieldedPool features
 * - Chainalysis compliance checks
 * - KYB/AML verification
 * - Sanctioned address blocking
 */
contract CompliantShieldedPool is ShieldedPool {
    
    ComplianceModule public complianceModule;
    
    // ============ Events ============
    
    event ComplianceCheckFailed(address indexed addr, string reason);
    
    // ============ Constructor ============
    
    address public owner;
    
    constructor(
        address _verifier,
        address _thresholdVerifier,
        address _swapAdaptor,
        address _feeOracle,
        address _relayerRegistry,
        address _complianceModule
    ) ShieldedPool(
        _verifier,
        address(0),
        _thresholdVerifier,
        _swapAdaptor,
        _feeOracle,
        _relayerRegistry
    ) {
        complianceModule = ComplianceModule(_complianceModule);
        owner = msg.sender; // Set owner
    }
    
    // Note: Compliance checks are done via modifier in ShieldedPool
    // For now, we'll add compliance checks in a wrapper contract or via events
    // The main ShieldedPool can be used directly, compliance can be checked off-chain
    
    // ============ Internal Functions ============
    
    /**
     * @notice Check address compliance
     */
    function _checkCompliance(address addr) internal override {
        // Check if blocked
        require(
            !complianceModule.isBlocked(addr),
            "CompliantShieldedPool: address blocked"
        );
        
        // Check if sanctioned
        require(
            !complianceModule.isSanctioned(addr),
            "CompliantShieldedPool: sanctioned address"
        );
        
        // Check risk level
        ComplianceModule.RiskLevel riskLevel = complianceModule.getRiskLevel(addr);
        require(
            riskLevel != ComplianceModule.RiskLevel.HIGH &&
            riskLevel != ComplianceModule.RiskLevel.SANCTIONED,
            "CompliantShieldedPool: high risk address"
        );
        
        // Auto-check if needed
        if (complianceModule.needsRecheck(addr)) {
            complianceModule.checkAddress(addr);
        }
    }
    
    /**
     * @notice Set compliance module
     */
    function setComplianceModule(address _complianceModule) external override {
        require(msg.sender == owner, "CompliantShieldedPool: not owner");
        complianceModule = ComplianceModule(_complianceModule);
    }
}
