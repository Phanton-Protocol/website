// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../libraries/MerkleTree.sol";
import "../libraries/IncrementalMerkleTree.sol";

/**
 * @dev Exposes library functions for Hardhat tests. MiMC7 is exercised via MerkleTree / IncrementalMerkleTree.
 */
contract LibraryTestHarness {
    using IncrementalMerkleTree for IncrementalMerkleTree.Tree;

    IncrementalMerkleTree.Tree private _tree;

    function merkleCalculateRoot(
        bytes32 leaf,
        bytes32[10] calldata path,
        uint256[10] calldata pathIndices,
        uint256 depth
    ) external pure returns (bytes32) {
        return MerkleTree.calculateRoot(leaf, path, pathIndices, depth);
    }

    function merkleVerifyProof(
        bytes32 leaf,
        bytes32 root,
        bytes32[10] calldata path,
        uint256[10] calldata pathIndices,
        uint256 depth
    ) external pure returns (bool) {
        return MerkleTree.verifyProof(leaf, root, path, pathIndices, depth);
    }

    function treeInit(uint256 depth) external {
        IncrementalMerkleTree.init(_tree, depth);
    }

    function treeInsert(bytes32 leaf) external returns (uint256 index, bytes32 newRoot) {
        return IncrementalMerkleTree.insert(_tree, leaf);
    }

    function treeRoot() external view returns (bytes32) {
        return IncrementalMerkleTree.getRoot(_tree);
    }

    function treeNextIndex() external view returns (uint256) {
        return _tree.nextIndex;
    }

    function treeDepth() external view returns (uint256) {
        return _tree.depth;
    }

    function treeZero(uint256 i) external view returns (bytes32) {
        return _tree.zeros[i];
    }
}
