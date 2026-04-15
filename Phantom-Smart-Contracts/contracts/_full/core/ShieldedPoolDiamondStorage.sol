// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "../interfaces/IVerifier.sol";
import "../interfaces/IPancakeSwapAdaptor.sol";
import "../interfaces/IFeeOracle.sol";
import "../interfaces/IRelayerRegistry.sol";
import "../libraries/IncrementalMerkleTree.sol";

/**
 * @dev Shared storage layout for ShieldedPool Diamond facets.
 * All facets MUST use this layout to access state.
 */
library ShieldedPoolDiamondStorage {
    bytes32 internal constant STORAGE_POSITION = keccak256("phantomprotocol.shieldedpool.diamond.storage");

    struct SwapOrder {
        bytes32 inputCommitment;
        bytes32 outputCommitment;
        uint256 inputAssetID;
        uint256 outputAssetID;
        bytes32 nullifier;
        bytes32 merkleRoot;
        uint256 timestamp;
        bool matched;
        bytes32 matchHash;
    }

    struct Layout {
        // core deps
        IVerifier verifier;
        IVerifier thresholdVerifier;
        IPancakeSwapAdaptor swapAdaptor;
        IFeeOracle feeOracle;
        IRelayerRegistry relayerRegistry;
        address transactionHistory;
        address depositHandler;
        address timelock;
        address fheCoprocessor;
        address thresholdEncryption;

        // internal matching
        mapping(bytes32 => SwapOrder) pendingOrders;
        mapping(bytes32 => bytes32[]) buyOrders;
        mapping(bytes32 => bytes32[]) sellOrders;
        mapping(bytes32 => bytes32) matchedSwaps;
        mapping(bytes32 => bool) executedMatches;

        // merkle tree
        IncrementalMerkleTree.Tree tree;
        bytes32 merkleRoot;
        uint256 commitmentCount;
        mapping(uint256 => bytes32) commitments;

        // nullifiers
        mapping(bytes32 => bool) nullifiers;

        // assets
        mapping(uint256 => address) assetRegistry;
        mapping(address => uint256) assetIDMap;
        uint256 nextAssetID;

        // single note system
        mapping(address => bytes32) userNotes;
        mapping(address => uint256) userNoteAssetID;

        // stack depth temp (kept for parity)
        address tempAddr1;
        address tempAddr2;
        uint256 tempUint1;
        uint256 tempUint2;
        uint256 tempUint3;
        bytes32 tempBytes32;

        // gas reserve & relayer
        uint256 gasReserve;
        mapping(address => bool) blacklistedRelayers;

        // mev protection
        mapping(bytes32 => bool) swapCommitments;
        mapping(bytes32 => uint256) swapCommitmentDeadline;
        mapping(address => uint256) userNonces;
        uint256 maxBatchSize; // configurable, default 10
        mapping(bytes32 => uint256) batchExecutionTime;

        // compliance + owner
        address complianceModuleAddress;
        address poolOwner;
    }

    function layout() internal pure returns (Layout storage l) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            l.slot := position
        }
    }
}

