// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IChainalysisOracle
 * @notice Interface for Chainalysis API oracle
 * @dev Phantom Protocol - Chainalysis Integration
 */
interface IChainalysisOracle {
    /**
     * @notice Check address compliance
     * @param addr Address to check
     * @return riskScore Risk score (0-100)
     * @return isSanctioned Sanctioned status
     * @return riskCategory Risk category
     */
    function checkAddress(address addr) external view returns (
        uint256 riskScore,
        bool isSanctioned,
        string memory riskCategory
    );
    
    /**
     * @notice Batch check addresses
     * @param addrs Array of addresses
     * @return riskScores Array of risk scores
     * @return sanctionedStatus Array of sanctioned statuses
     */
    function batchCheckAddresses(address[] calldata addrs) external view returns (
        uint256[] memory riskScores,
        bool[] memory sanctionedStatus
    );
}
