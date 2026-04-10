// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title PhantomMain
 * @notice Main contract for cross-chain deployment (same address on all EVM chains)
 * @dev Uses CREATE2 to deploy to same address on all chains
 * 
 * This contract serves as the entry point for all chains and routes to chain-specific pools.
 * For now, it's a simple router. Later, it will handle cross-chain bridging.
 */
contract PhantomMain {
    // Chain ID => ShieldedPool address
    mapping(uint256 => address) public chainPools;
    
    address public owner;
    
    event PoolRegistered(uint256 indexed chainId, address indexed poolAddress);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "PhantomMain: not owner");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    function registerPool(uint256 chainId, address poolAddress) external onlyOwner {
        require(poolAddress != address(0), "PhantomMain: zero address");
        chainPools[chainId] = poolAddress;
        emit PoolRegistered(chainId, poolAddress);
    }
    
    function getPool(uint256 chainId) external view returns (address) {
        return chainPools[chainId];
    }
    
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "PhantomMain: zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}
