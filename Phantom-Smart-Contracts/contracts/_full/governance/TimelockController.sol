// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title TimelockController
 * @notice Simple timelock for upgrade delays
 * @dev For production, use 48 hours. For testing, use 48 seconds.
 */
contract TimelockController {
    uint256 public constant DELAY = 48 seconds; // 48 seconds for testing, 48 hours for production
    
    mapping(bytes32 => uint256) public scheduledOperations;
    
    event OperationScheduled(bytes32 indexed operationId, uint256 executeAfter);
    event OperationExecuted(bytes32 indexed operationId);
    event OperationCancelled(bytes32 indexed operationId);
    
    function scheduleUpgrade(
        address target,
        bytes calldata data
    ) external returns (bytes32 operationId) {
        operationId = keccak256(abi.encodePacked(target, data, block.timestamp));
        uint256 executeAfter = block.timestamp + DELAY;
        scheduledOperations[operationId] = executeAfter;
        emit OperationScheduled(operationId, executeAfter);
        return operationId;
    }
    
    function executeUpgrade(
        address target,
        bytes calldata data,
        bytes32 operationId
    ) external {
        require(scheduledOperations[operationId] > 0, "TimelockController: operation not scheduled");
        require(block.timestamp >= scheduledOperations[operationId], "TimelockController: operation not ready");
        require(keccak256(abi.encodePacked(target, data, scheduledOperations[operationId] - DELAY)) == operationId, "TimelockController: invalid operation");
        
        delete scheduledOperations[operationId];
        
        (bool success, ) = target.call(data);
        require(success, "TimelockController: execution failed");
        
        emit OperationExecuted(operationId);
    }
    
    function cancelOperation(bytes32 operationId) external {
        require(scheduledOperations[operationId] > 0, "TimelockController: operation not scheduled");
        delete scheduledOperations[operationId];
        emit OperationCancelled(operationId);
    }
    
    function getExecuteAfter(bytes32 operationId) external view returns (uint256) {
        return scheduledOperations[operationId];
    }
}
