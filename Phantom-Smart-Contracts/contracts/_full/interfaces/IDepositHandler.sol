// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title IDepositHandler
 * @notice Interface for DepositHandler contract
 * @dev Used by ShieldedPool to process deposits and reduce stack depth
 */
interface IDepositHandler {
    /**
     * @notice Process complete deposit (handles all logic to reduce stack depth in ShieldedPool)
     * @param depositor User depositing
     * @param token Token address
     * @param amount Deposit amount
     * @param commitment Commitment hash
     * @param assetID Asset ID
     * @param value msg.value (for BNB deposits)
     * @param complianceModule Compliance module address
     * @param relayer Address that submitted the deposit (receives 0.5¢ cut)
     */
    function processDeposit(
        address depositor,
        address token,
        uint256 amount,
        bytes32 commitment,
        uint256 assetID,
        uint256 value,
        address complianceModule,
        address relayer
    ) external;
    
    /**
     * @notice Get estimated gas refund amount
     * @param depositFeeBNB Total deposit fee
     * @return gasRefundAmount Amount to refund to relayer
     */
    function getGasRefundAmount(uint256 depositFeeBNB) external pure returns (uint256);
}
