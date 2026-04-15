// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title DepositLibrary
 * @notice Library for deposit operations to reduce stack depth in main contract
 */
library DepositLibrary {
    struct DepositData {
        address depositor;
        address token;
        uint256 amount;
        bytes32 commitment;
        uint256 assetID;
        uint256 value;
        uint256 depositFeeBNB;
        uint256 index;
    }
    
    /**
     * @notice Validates deposit inputs
     */
    function validateDeposit(
        DepositData memory data
    ) internal pure {
        require(data.amount > 0, "DepositLibrary: zero amount");
        require(data.commitment != bytes32(0), "DepositLibrary: zero commitment");
        require(data.depositor != address(0), "DepositLibrary: zero depositor");
    }
}
