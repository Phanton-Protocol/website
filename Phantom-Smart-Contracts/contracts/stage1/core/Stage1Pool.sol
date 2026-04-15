// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../libraries/MerkleTree.sol";
import "../libraries/IncrementalMerkleTree.sol";
import "../libraries/DepositLibrary.sol";

/**
 * @dev Minimal “pool” for stage-1 compile: uses Merkle + deposit libs together.
 * Full pool variants live under contracts/_full/ (compile with HH_FULL=1).
 */
contract Stage1Pool {
    using IncrementalMerkleTree for IncrementalMerkleTree.Tree;

    IncrementalMerkleTree.Tree private _tree;

    constructor() {
        IncrementalMerkleTree.init(_tree, 10);
    }

    function merkleRoot() external view returns (bytes32) {
        return _tree.root;
    }

    function smokeCalculateRoot(
        bytes32 leaf,
        bytes32[10] memory path,
        uint256[10] memory pathIndices,
        uint256 depth
    ) external pure returns (bytes32) {
        return MerkleTree.calculateRoot(leaf, path, pathIndices, depth);
    }

    function smokeValidateDeposit(DepositLibrary.DepositData memory data) external pure {
        DepositLibrary.validateDeposit(data);
    }
}
