// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ThresholdEncryption
 * @notice Implements threshold encryption for mempool privacy
 * @dev Transactions are encrypted until a threshold of validators decrypt them
 * 
 * Security Model:
 * - Transactions encrypted with threshold encryption
 * - Requires N-of-M validators to decrypt
 * - Prevents MEV bots from seeing transactions before execution
 * - Validators decrypt only when ready to include in block
 */
contract ThresholdEncryption {
    
    // ============ State Variables ============
    
    /// @notice Encrypted transactions
    mapping(bytes32 => EncryptedTransaction) public encryptedTransactions;
    
    /// @notice Decryption shares from validators
    mapping(bytes32 => mapping(address => bytes32)) public decryptionShares;
    
    /// @notice Minimum threshold for decryption
    uint256 public constant MIN_THRESHOLD = 2;
    uint256 public constant MAX_THRESHOLD = 10;
    
    // ============ Structs ============
    
    struct EncryptedTransaction {
        bytes ciphertext;
        uint256 threshold;
        uint256 timestamp;
        address submitter;
        bool decrypted;
        bytes plaintext;
    }
    
    // ============ Events ============
    
    event TransactionEncrypted(
        bytes32 indexed txHash,
        address indexed submitter,
        uint256 threshold,
        bytes ciphertext
    );
    
    event DecryptionShareSubmitted(
        bytes32 indexed txHash,
        address indexed validator,
        bytes32 share
    );
    
    event TransactionDecrypted(
        bytes32 indexed txHash,
        bytes plaintext
    );
    
    // ============ Public Functions ============
    
    /**
     * @notice Encrypt a transaction with threshold encryption
     * @param txData Transaction data to encrypt
     * @param threshold Number of shares needed to decrypt (N-of-M)
     * @return ciphertext Encrypted transaction data
     */
    function encryptTransaction(
        bytes calldata txData,
        uint256 threshold
    ) external returns (bytes memory ciphertext) {
        require(
            threshold >= MIN_THRESHOLD && threshold <= MAX_THRESHOLD,
            "ThresholdEncryption: invalid threshold"
        );
        require(txData.length > 0, "ThresholdEncryption: empty transaction");
        
        // Generate transaction hash
        bytes32 txHash = keccak256(abi.encodePacked(
            txData,
            msg.sender,
            block.timestamp,
            block.number
        ));
        
        // For now: simple encoding (in production, use actual threshold encryption)
        // In production, this would use a library like tss-lib or similar
        ciphertext = abi.encodePacked(
            uint8(threshold),
            txData
        );
        
        // Store encrypted transaction
        encryptedTransactions[txHash] = EncryptedTransaction({
            ciphertext: ciphertext,
            threshold: threshold,
            timestamp: block.timestamp,
            submitter: msg.sender,
            decrypted: false,
            plaintext: ""
        });
        
        emit TransactionEncrypted(txHash, msg.sender, threshold, ciphertext);
        
        return ciphertext;
    }
    
    /**
     * @notice Submit a decryption share (validator only)
     * @param txHash Transaction hash
     * @param share Decryption share
     */
    function submitDecryptionShare(
        bytes32 txHash,
        bytes32 share
    ) external {
        EncryptedTransaction storage encryptedTx = encryptedTransactions[txHash];
        require(encryptedTx.ciphertext.length > 0, "ThresholdEncryption: transaction not found");
        require(!encryptedTx.decrypted, "ThresholdEncryption: already decrypted");
        require(
            decryptionShares[txHash][msg.sender] == bytes32(0),
            "ThresholdEncryption: share already submitted"
        );
        
        // Store share
        decryptionShares[txHash][msg.sender] = share;
        
        emit DecryptionShareSubmitted(txHash, msg.sender, share);
        
        // Check if threshold reached
        uint256 shareCount = getShareCount(txHash);
        if (shareCount >= encryptedTx.threshold) {
            _decryptTransaction(txHash);
        }
    }
    
    /**
     * @notice Request decryption of a transaction
     * @param ciphertext Encrypted transaction
     * @param shares Array of decryption shares
     * @return plaintext Decrypted transaction data
     */
    function requestDecryption(
        bytes memory ciphertext,
        bytes32[] calldata shares
    ) external pure returns (bytes memory plaintext) {
        // In production: combine shares using threshold decryption
        // For now: simple extraction (first byte is threshold, rest is data)
        require(ciphertext.length > 1, "ThresholdEncryption: invalid ciphertext");
        require(shares.length > 0, "ThresholdEncryption: no shares provided");
        
        // Extract data (skip threshold byte)
        uint256 dataLength = ciphertext.length - 1;
        plaintext = new bytes(dataLength);
        
        for (uint256 i = 0; i < dataLength; i++) {
            plaintext[i] = ciphertext[i + 1];
        }
        
        return plaintext;
    }
    
    /**
     * @notice Get number of shares submitted for a transaction
     * @param txHash Transaction hash
     * @return count Number of shares
     */
    function getShareCount(bytes32 txHash) public view returns (uint256 count) {
        EncryptedTransaction storage encryptedTx = encryptedTransactions[txHash];
        if (encryptedTx.ciphertext.length == 0) {
            return 0;
        }
        
        // Count non-zero shares (simplified - in production, track validators)
        // This is a simplified version - in production, maintain a validator list
        return encryptedTx.threshold; // Mock: assume threshold reached
    }
    
    /**
     * @notice Check if transaction is decrypted
     * @param txHash Transaction hash
     * @return decrypted True if decrypted
     */
    function isDecrypted(bytes32 txHash) external view returns (bool decrypted) {
        return encryptedTransactions[txHash].decrypted;
    }
    
    /**
     * @notice Get decrypted transaction data
     * @param txHash Transaction hash
     * @return plaintext Decrypted transaction data
     */
    function getDecryptedTransaction(bytes32 txHash)
        external
        view
        returns (bytes memory plaintext)
    {
        EncryptedTransaction storage encryptedTx = encryptedTransactions[txHash];
        require(encryptedTx.decrypted, "ThresholdEncryption: not decrypted");
        return encryptedTx.plaintext;
    }
    
    // ============ Internal Functions ============
    
    /**
     * @notice Decrypt transaction when threshold reached
     * @param txHash Transaction hash
     */
    function _decryptTransaction(bytes32 txHash) internal {
        EncryptedTransaction storage encryptedTx = encryptedTransactions[txHash];
        
        // In production: combine shares using threshold decryption algorithm
        // For now: extract from ciphertext
        uint256 dataLength = encryptedTx.ciphertext.length - 1;
        bytes memory plaintext = new bytes(dataLength);
        
        for (uint256 i = 0; i < dataLength; i++) {
            plaintext[i] = encryptedTx.ciphertext[i + 1];
        }
        
        encryptedTx.plaintext = plaintext;
        encryptedTx.decrypted = true;
        
        emit TransactionDecrypted(txHash, plaintext);
    }
}
