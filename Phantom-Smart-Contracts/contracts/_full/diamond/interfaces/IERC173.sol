// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/// @dev ERC-173 Ownership Standard (minimal)
interface IERC173 {
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    function owner() external view returns (address owner_);
    function transferOwnership(address _newOwner) external;
}

