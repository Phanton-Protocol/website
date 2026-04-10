// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

interface IMatchingHandler {
    function createOrder(
        bytes32 orderHash,
        bytes32 inputCommitment,
        bytes32 outputCommitment,
        uint256 inputAssetID,
        uint256 outputAssetID,
        bytes32 nullifier,
        bytes32 merkleRoot
    ) external;
    
    function createOrderFHE(
        bytes32 orderHash,
        bytes32 inputCommitment,
        bytes32 outputCommitment,
        uint256 inputAssetID,
        uint256 outputAssetID,
        bytes32 nullifier,
        bytes32 merkleRoot,
        bytes calldata fheEncryptedInputAmount,
        bytes calldata fheEncryptedMinOutput
    ) external;
    
    function tryMatchOrder(bytes32 orderHash) external returns (bytes32 matchHash);
    
    function tryMatchOrderFHE(bytes32 orderHash) external returns (bytes32 matchHash);
    
    function executeInternalMatch(bytes32 matchHash) external returns (bool);
    
    function setFHECoprocessor(address _fheCoprocessor) external;
    
    function isMatchExecuted(bytes32 matchHash) external view returns (bool);
    
    function getOrder(bytes32 orderHash) external view returns (
        bytes32 inputCommitment,
        bytes32 outputCommitment,
        uint256 inputAssetID,
        uint256 outputAssetID,
        bool matched,
        bytes32 matchHash
    );
}
