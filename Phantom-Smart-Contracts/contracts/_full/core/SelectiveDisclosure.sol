// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IVerifier.sol";
import "../types/Types.sol";

/**
 * @title SelectiveDisclosure
 * @notice Enables selective disclosure of private information using zk proofs
 * @dev Allows users to prove predicates about their private data without revealing the data itself
 * 
 * Use cases:
 * - Prove balance is in a range without revealing exact balance
 * - Prove source of funds is clean without revealing transaction history
 * - Export tax liability without revealing all transactions
 * - Prove KYC status without revealing identity
 */
contract SelectiveDisclosure {
    
    // ============ State Variables ============
    
    /// @notice Verifier for zk proof verification
    IVerifier public immutable verifier;
    
    /// @notice Disclosure proofs per user
    mapping(address => DisclosureProof[]) public userProofs;
    
    /// @notice Proof registry by hash
    mapping(bytes32 => bool) public proofRegistry;
    
    // ============ Structs ============
    
    struct DisclosureProof {
        bytes32 proofHash;
        DisclosureType disclosureType;
        bytes predicate; // zk predicate (e.g., "balance > X")
        uint256 timestamp;
        bool verified;
    }
    
    enum DisclosureType {
        BALANCE_RANGE,      // Prove balance in range
        SOURCE_OF_FUNDS,    // Prove clean source
        TAX_LIABILITY,      // Export for taxes
        KYC_STATUS         // Prove KYC'd
    }
    
    // ============ Events ============
    
    event DisclosureProofSubmitted(
        address indexed user,
        bytes32 indexed proofHash,
        DisclosureType disclosureType,
        uint256 timestamp
    );
    
    event DisclosureProofVerified(
        address indexed user,
        bytes32 indexed proofHash,
        bool valid
    );
    
    // ============ Constructor ============
    
    constructor(address _verifier) {
        require(_verifier != address(0), "SelectiveDisclosure: zero verifier");
        verifier = IVerifier(_verifier);
    }
    
    // ============ Public Functions ============
    
    /**
     * @notice Submit a selective disclosure proof
     * @param disclosureType Type of disclosure
     * @param proof ZK proof bytes
     * @param publicInputs Public inputs for verification
     * @param predicate Predicate description (for reference)
     */
    function submitProof(
        DisclosureType disclosureType,
        bytes calldata proof,
        uint256[] calldata publicInputs,
        bytes calldata predicate
    ) external returns (bytes32 proofHash) {
        // Verify proof
        bool valid = verifier.verifyProof(
            abi.decode(proof, (Proof)),
            publicInputs
        );
        
        require(valid, "SelectiveDisclosure: invalid proof");
        
        proofHash = keccak256(abi.encodePacked(
            msg.sender,
            disclosureType,
            proof,
            block.timestamp
        ));
        
        require(!proofRegistry[proofHash], "SelectiveDisclosure: proof already exists");
        
        // Store proof
        userProofs[msg.sender].push(DisclosureProof({
            proofHash: proofHash,
            disclosureType: disclosureType,
            predicate: predicate,
            timestamp: block.timestamp,
            verified: true
        }));
        
        proofRegistry[proofHash] = true;
        
        emit DisclosureProofSubmitted(
            msg.sender,
            proofHash,
            disclosureType,
            block.timestamp
        );
        
        emit DisclosureProofVerified(msg.sender, proofHash, true);
        
        return proofHash;
    }
    
    /**
     * @notice Verify a disclosure proof
     * @param user User address
     * @param proofHash Proof hash to verify
     * @return valid True if proof is valid
     * @return disclosureType Type of disclosure
     */
    function verifyProof(
        address user,
        bytes32 proofHash
    ) external view returns (bool valid, DisclosureType disclosureType) {
        DisclosureProof[] storage proofs = userProofs[user];
        
        for (uint256 i = 0; i < proofs.length; i++) {
            if (proofs[i].proofHash == proofHash) {
                return (proofs[i].verified, proofs[i].disclosureType);
            }
        }
        
        return (false, DisclosureType.BALANCE_RANGE);
    }
    
    /**
     * @notice Get all proofs for a user
     * @param user User address
     * @return proofs Array of disclosure proofs
     */
    function getUserProofs(address user) 
        external 
        view 
        returns (DisclosureProof[] memory proofs) 
    {
        return userProofs[user];
    }
    
    /**
     * @notice Check if user has a specific type of disclosure proof
     * @param user User address
     * @param disclosureType Type to check
     * @return hasProof True if user has valid proof of this type
     */
    function hasDisclosureProof(
        address user,
        DisclosureType disclosureType
    ) external view returns (bool hasProof) {
        DisclosureProof[] storage proofs = userProofs[user];
        
        for (uint256 i = 0; i < proofs.length; i++) {
            if (proofs[i].disclosureType == disclosureType && proofs[i].verified) {
                return true;
            }
        }
        
        return false;
    }
}
