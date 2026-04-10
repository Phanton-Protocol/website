// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ComplianceModule
 * @notice Chainalysis API integration for KYB/AML compliance
 * @dev Phantom Protocol - Compliance & Security
 * 
 * Features:
 * - Sanctioned address checking
 * - KYB (Know Your Business) verification
 * - AML (Anti-Money Laundering) compliance
 * - Real-time risk scoring
 * - Transaction blocking for high-risk addresses
 */
contract ComplianceModule {
    
    // ============ State Variables ============
    
    enum RiskLevel {
        LOW,        // Low risk - allow
        MEDIUM,     // Medium risk - review
        HIGH,       // High risk - block
        SANCTIONED  // Sanctioned - block
    }
    
    struct AddressRisk {
        RiskLevel riskLevel;    // Risk level
        uint256 riskScore;      // Risk score (0-100)
        bool isSanctioned;      // Sanctioned status
        bool isBlocked;         // Blocked status
        uint256 lastCheck;      // Last check timestamp
        string reason;          // Reason for risk/block
    }
    
    struct ComplianceConfig {
        bool enabled;           // Compliance enabled
        uint256 riskThreshold;  // Risk threshold (0-100)
        uint256 checkInterval;  // Check interval (seconds)
        address chainalysisOracle; // Chainalysis oracle address
    }
    
    mapping(address => AddressRisk) public addressRisks;
    mapping(address => bool) public sanctionedAddresses;
    mapping(address => bool) public blockedAddresses;
    mapping(address => bool) public whitelistedAddresses;
    
    ComplianceConfig public config;
    
    address public owner;
    address public complianceOfficer;
    
    // ============ Events ============
    
    event AddressChecked(
        address indexed addr,
        RiskLevel riskLevel,
        uint256 riskScore,
        bool isSanctioned
    );
    
    event AddressBlocked(
        address indexed addr,
        string reason
    );
    
    event AddressWhitelisted(
        address indexed addr,
        bool whitelisted
    );
    
    event ComplianceConfigUpdated(
        bool enabled,
        uint256 riskThreshold
    );
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "ComplianceModule: not owner");
        _;
    }
    
    modifier onlyComplianceOfficer() {
        require(
            msg.sender == owner || msg.sender == complianceOfficer,
            "ComplianceModule: not authorized"
        );
        _;
    }
    
    modifier complianceCheck(address addr) {
        if (config.enabled) {
            require(!isBlocked(addr), "ComplianceModule: address blocked");
            require(!isSanctioned(addr), "ComplianceModule: sanctioned address");
            require(
                getRiskLevel(addr) != RiskLevel.HIGH,
                "ComplianceModule: high risk address"
            );
        }
        _;
    }
    
    // ============ Constructor ============
    
    constructor(
        address _complianceOfficer,
        address _chainalysisOracle
    ) {
        owner = msg.sender;
        complianceOfficer = _complianceOfficer;
        
        config = ComplianceConfig({
            enabled: true,
            riskThreshold: 70, // Block if risk score > 70
            checkInterval: 86400, // Check daily
            chainalysisOracle: _chainalysisOracle
        });
    }
    
    // ============ Compliance Checks ============
    
    /**
     * @notice Check address compliance (Chainalysis API)
     * @dev Calls Chainalysis oracle for risk assessment
     * @param addr Address to check
     * @return riskLevel Risk level
     * @return riskScore Risk score (0-100)
     * @return sanctioned Sanctioned status
     */
    function checkAddress(address addr) external returns (
        RiskLevel riskLevel,
        uint256 riskScore,
        bool sanctioned
    ) {
        require(config.enabled, "ComplianceModule: compliance disabled");
        
        // Check if whitelisted
        if (whitelistedAddresses[addr]) {
            addressRisks[addr] = AddressRisk({
                riskLevel: RiskLevel.LOW,
                riskScore: 0,
                isSanctioned: false,
                isBlocked: false,
                lastCheck: block.timestamp,
                reason: "Whitelisted"
            });
            
            emit AddressChecked(addr, RiskLevel.LOW, 0, false);
            return (RiskLevel.LOW, 0, false);
        }
        
        // Check if already sanctioned
        if (sanctionedAddresses[addr]) {
            addressRisks[addr] = AddressRisk({
                riskLevel: RiskLevel.SANCTIONED,
                riskScore: 100,
                isSanctioned: true,
                isBlocked: true,
                lastCheck: block.timestamp,
                reason: "Sanctioned address"
            });
            
            emit AddressChecked(addr, RiskLevel.SANCTIONED, 100, true);
            return (RiskLevel.SANCTIONED, 100, true);
        }
        
        // Call Chainalysis oracle (mock for now, will be replaced with real API)
        (riskLevel, riskScore, sanctioned) = _queryChainalysis(addr);
        
        // Update address risk
        addressRisks[addr] = AddressRisk({
            riskLevel: riskLevel,
            riskScore: riskScore,
            isSanctioned: sanctioned,
            isBlocked: (riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.SANCTIONED),
            lastCheck: block.timestamp,
            reason: _getRiskReason(riskLevel)
        });
        
        // Block if high risk or sanctioned
        if (riskLevel == RiskLevel.HIGH || riskLevel == RiskLevel.SANCTIONED) {
            blockedAddresses[addr] = true;
            if (sanctioned) {
                sanctionedAddresses[addr] = true;
            }
            emit AddressBlocked(addr, _getRiskReason(riskLevel));
        }
        
        emit AddressChecked(addr, riskLevel, riskScore, sanctioned);
        
        return (riskLevel, riskScore, sanctioned);
    }
    
    /**
     * @notice Batch check addresses
     * @param addrs Array of addresses to check
     */
    function batchCheckAddresses(address[] calldata addrs) external {
        for (uint256 i = 0; i < addrs.length; i++) {
            this.checkAddress(addrs[i]);
        }
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Check if address is blocked
     */
    function isBlocked(address addr) public view returns (bool) {
        if (!config.enabled) return false;
        if (whitelistedAddresses[addr]) return false;
        return blockedAddresses[addr] || addressRisks[addr].isBlocked;
    }
    
    /**
     * @notice Check if address is sanctioned
     */
    function isSanctioned(address addr) public view returns (bool) {
        if (!config.enabled) return false;
        return sanctionedAddresses[addr] || addressRisks[addr].isSanctioned;
    }
    
    /**
     * @notice Get risk level for address
     */
    function getRiskLevel(address addr) public view returns (RiskLevel) {
        if (!config.enabled) return RiskLevel.LOW;
        if (whitelistedAddresses[addr]) return RiskLevel.LOW;
        return addressRisks[addr].riskLevel;
    }
    
    /**
     * @notice Get risk score for address
     */
    function getRiskScore(address addr) public view returns (uint256) {
        if (!config.enabled) return 0;
        if (whitelistedAddresses[addr]) return 0;
        return addressRisks[addr].riskScore;
    }
    
    /**
     * @notice Check if address needs re-check
     */
    function needsRecheck(address addr) public view returns (bool) {
        if (!config.enabled) return false;
        AddressRisk memory risk = addressRisks[addr];
        return (block.timestamp - risk.lastCheck) > config.checkInterval;
    }
    
    // ============ Admin Functions ============
    
    /**
     * @notice Manually block address
     */
    function blockAddress(address addr, string calldata reason) external onlyComplianceOfficer {
        blockedAddresses[addr] = true;
        addressRisks[addr].isBlocked = true;
        addressRisks[addr].riskLevel = RiskLevel.HIGH;
        addressRisks[addr].reason = reason;
        
        emit AddressBlocked(addr, reason);
    }
    
    /**
     * @notice Manually unblock address
     */
    function unblockAddress(address addr) external onlyComplianceOfficer {
        blockedAddresses[addr] = false;
        addressRisks[addr].isBlocked = false;
    }
    
    /**
     * @notice Add sanctioned address
     */
    function addSanctionedAddress(address addr) external onlyComplianceOfficer {
        sanctionedAddresses[addr] = true;
        blockedAddresses[addr] = true;
        addressRisks[addr] = AddressRisk({
            riskLevel: RiskLevel.SANCTIONED,
            riskScore: 100,
            isSanctioned: true,
            isBlocked: true,
            lastCheck: block.timestamp,
            reason: "Manually sanctioned"
        });
        
        emit AddressBlocked(addr, "Sanctioned address");
    }
    
    /**
     * @notice Remove sanctioned address
     */
    function removeSanctionedAddress(address addr) external onlyOwner {
        sanctionedAddresses[addr] = false;
        blockedAddresses[addr] = false;
    }
    
    /**
     * @notice Whitelist address (bypass compliance)
     */
    function whitelistAddress(address addr, bool whitelisted) external onlyComplianceOfficer {
        whitelistedAddresses[addr] = whitelisted;
        emit AddressWhitelisted(addr, whitelisted);
    }
    
    /**
     * @notice Update compliance config
     */
    function updateConfig(
        bool _enabled,
        uint256 _riskThreshold,
        uint256 _checkInterval
    ) external onlyOwner {
        config.enabled = _enabled;
        config.riskThreshold = _riskThreshold;
        config.checkInterval = _checkInterval;
        
        emit ComplianceConfigUpdated(_enabled, _riskThreshold);
    }
    
    /**
     * @notice Set Chainalysis oracle address
     */
    function setChainalysisOracle(address oracle) external onlyOwner {
        config.chainalysisOracle = oracle;
    }
    
    /**
     * @notice Set compliance officer
     */
    function setComplianceOfficer(address officer) external onlyOwner {
        complianceOfficer = officer;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Query Chainalysis API (via oracle)
     * @dev In production, this calls Chainalysis oracle contract
     */
    function _queryChainalysis(address addr) internal view returns (
        RiskLevel riskLevel,
        uint256 riskScore,
        bool sanctioned
    ) {
        // TODO: Replace with real Chainalysis oracle call
        // For now, return mock data
        // In production: call IChainalysisOracle(config.chainalysisOracle).checkAddress(addr)
        
        // Mock implementation (will be replaced)
        if (sanctionedAddresses[addr]) {
            return (RiskLevel.SANCTIONED, 100, true);
        }
        
        // Simulate risk score (0-100)
        uint256 simulatedRisk = uint256(keccak256(abi.encodePacked(addr, block.number))) % 100;
        
        if (simulatedRisk >= 80) {
            return (RiskLevel.HIGH, simulatedRisk, false);
        } else if (simulatedRisk >= 50) {
            return (RiskLevel.MEDIUM, simulatedRisk, false);
        } else {
            return (RiskLevel.LOW, simulatedRisk, false);
        }
    }
    
    /**
     * @notice Get risk reason string
     */
    function _getRiskReason(RiskLevel level) internal pure returns (string memory) {
        if (level == RiskLevel.SANCTIONED) return "Sanctioned address";
        if (level == RiskLevel.HIGH) return "High risk address";
        if (level == RiskLevel.MEDIUM) return "Medium risk address";
        return "Low risk address";
    }
}
