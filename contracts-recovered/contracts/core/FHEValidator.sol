// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FHEValidator
 * @notice FHE validator registry and computation coordinator
 * @dev Team runs 10-20 staker nodes, others can join later
 * 
 * Architecture:
 * - Validators register with FHE public key and endpoint
 * - Users submit FHE computation requests
 * - Random validators selected (e.g., 3-5)
 * - Validators compute off-chain, submit results
 * - Consensus required (2/3+ must agree)
 * - Result committed on-chain
 */
contract FHEValidator {
    
    // ============ State Variables ============
    
    enum RequestStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }
    
    struct ValidatorInfo {
        string endpoint;        // FHE node endpoint (e.g., "https://fhe-node-1.example.com")
        bytes publicKey;        // FHE public key
        uint256 staked;         // Staked amount (for slashing)
        bool active;            // Active status
        uint256 reputation;     // Reputation score (0-1000)
        uint256 totalRequests; // Total requests processed
        uint256 successfulRequests; // Successful requests
    }
    
    struct FHERequest {
        bytes encryptedData;    // Encrypted input data
        bytes32 commitment;     // Commitment to expected result
        address[] validators;   // Selected validators
        bytes[] results;        // Validator results
        address[] resultSubmitters; // Who submitted each result
        uint256 timestamp;      // Request timestamp
        RequestStatus status;   // Request status
        bytes finalResult;      // Final committed result
    }
    
    mapping(address => ValidatorInfo) public validators;
    mapping(bytes32 => FHERequest) public requests;
    
    address[] public validatorList; // List of all validators
    
    uint256 public constant MIN_STAKE = 1 ether; // Minimum stake (1 BNB)
    uint256 public constant VALIDATOR_COUNT = 3; // Select 3 validators per request
    uint256 public constant CONSENSUS_THRESHOLD = 2; // Need 2/3 consensus
    
    address public owner; // Contract owner (can add team validators initially)
    
    // ============ Events ============
    
    event ValidatorRegistered(
        address indexed validator,
        string endpoint,
        bytes publicKey
    );
    
    event ValidatorRemoved(address indexed validator);
    
    event FHEComputationRequested(
        bytes32 indexed requestId,
        address indexed requester,
        bytes encryptedData,
        bytes32 commitment,
        address[] validators
    );
    
    event FHEResultSubmitted(
        bytes32 indexed requestId,
        address indexed validator,
        bytes result
    );
    
    event FHEComputationCompleted(
        bytes32 indexed requestId,
        bytes result,
        address[] validators
    );
    
    event FHEComputationFailed(
        bytes32 indexed requestId,
        string reason
    );
    
    event ValidatorRewarded(
        address indexed validator,
        uint256 amount
    );
    
    event ValidatorSlashed(
        address indexed validator,
        uint256 amount,
        string reason
    );
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ Validator Registration ============
    
    /**
     * @notice Register as FHE validator
     * @param endpoint FHE node endpoint (e.g., "https://fhe-node-1.example.com")
     * @param publicKey FHE public key
     */
    function registerValidator(
        string memory endpoint,
        bytes memory publicKey
    ) external payable {
        require(msg.value >= MIN_STAKE, "FHEValidator: insufficient stake");
        require(!validators[msg.sender].active, "FHEValidator: already registered");
        require(publicKey.length > 0, "FHEValidator: empty public key");
        
        validators[msg.sender] = ValidatorInfo({
            endpoint: endpoint,
            publicKey: publicKey,
            staked: msg.value,
            active: true,
            reputation: 1000, // Start with max reputation
            totalRequests: 0,
            successfulRequests: 0
        });
        
        validatorList.push(msg.sender);
        
        emit ValidatorRegistered(msg.sender, endpoint, publicKey);
    }
    
    /**
     * @notice Owner can add team validators (for bootstrap)
     * @param validator Validator address
     * @param endpoint FHE node endpoint
     * @param publicKey FHE public key
     */
    function addTeamValidator(
        address validator,
        string memory endpoint,
        bytes memory publicKey
    ) external {
        require(msg.sender == owner, "FHEValidator: not owner");
        require(!validators[validator].active, "FHEValidator: already registered");
        
        validators[validator] = ValidatorInfo({
            endpoint: endpoint,
            publicKey: publicKey,
            staked: 0, // Team validators don't need stake initially
            active: true,
            reputation: 1000,
            totalRequests: 0,
            successfulRequests: 0
        });
        
        validatorList.push(validator);
        
        emit ValidatorRegistered(validator, endpoint, publicKey);
    }
    
    /**
     * @notice Remove validator (owner only, for emergency)
     */
    function removeValidator(address validator) external {
        require(msg.sender == owner, "FHEValidator: not owner");
        require(validators[validator].active, "FHEValidator: not active");
        
        validators[validator].active = false;
        
        // Remove from list
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validatorList[i] == validator) {
                validatorList[i] = validatorList[validatorList.length - 1];
                validatorList.pop();
                break;
            }
        }
        
        emit ValidatorRemoved(validator);
    }
    
    // ============ FHE Computation ============
    
    /**
     * @notice Submit FHE computation request
     * @param encryptedData Encrypted input data
     * @param commitment Commitment to expected result
     * @return requestId Request identifier
     */
    function submitFHEComputation(
        bytes memory encryptedData,
        bytes32 commitment
    ) external returns (bytes32 requestId) {
        require(encryptedData.length > 0, "FHEValidator: empty data");
        require(commitment != bytes32(0), "FHEValidator: zero commitment");
        require(validatorList.length >= VALIDATOR_COUNT, "FHEValidator: insufficient validators");
        
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            encryptedData,
            commitment,
            block.timestamp,
            block.number
        ));
        
        // Select random validators
        address[] memory selectedValidators = selectValidators(VALIDATOR_COUNT);
        
        requests[requestId] = FHERequest({
            encryptedData: encryptedData,
            commitment: commitment,
            validators: selectedValidators,
            results: new bytes[](0),
            resultSubmitters: new address[](0),
            timestamp: block.timestamp,
            status: RequestStatus.PENDING,
            finalResult: ""
        });
        
        emit FHEComputationRequested(requestId, msg.sender, encryptedData, commitment, selectedValidators);
        
        return requestId;
    }
    
    /**
     * @notice Validator submits FHE computation result
     * @param requestId Request identifier
     * @param encryptedResult Encrypted computation result
     * @param proof Optional proof (for verification)
     */
    function submitFHEResult(
        bytes32 requestId,
        bytes memory encryptedResult,
        bytes memory proof
    ) external {
        require(validators[msg.sender].active, "FHEValidator: not a validator");
        FHERequest storage request = requests[requestId];
        require(request.status == RequestStatus.PENDING || request.status == RequestStatus.PROCESSING, "FHEValidator: request not pending");
        require(isSelectedValidator(requestId, msg.sender), "FHEValidator: not selected");
        require(encryptedResult.length > 0, "FHEValidator: empty result");
        
        // Check if already submitted
        bool alreadySubmitted = false;
        for (uint256 i = 0; i < request.resultSubmitters.length; i++) {
            if (request.resultSubmitters[i] == msg.sender) {
                alreadySubmitted = true;
                break;
            }
        }
        require(!alreadySubmitted, "FHEValidator: already submitted");
        
        // Verify proof (optional, for additional security)
        // TODO: Implement proof verification
        // require(verifyProof(encryptedResult, proof), "FHEValidator: invalid proof");
        
        // Store result
        request.results.push(encryptedResult);
        request.resultSubmitters.push(msg.sender);
        request.status = RequestStatus.PROCESSING;
        
        // Update validator stats
        validators[msg.sender].totalRequests++;
        
        emit FHEResultSubmitted(requestId, msg.sender, encryptedResult);
        
        // Check if we have consensus
        if (request.results.length >= CONSENSUS_THRESHOLD) {
            _checkConsensus(requestId);
        }
    }
    
    /**
     * @notice Check consensus and commit result
     */
    function _checkConsensus(bytes32 requestId) internal {
        FHERequest storage request = requests[requestId];
        
        // Verify results match (all validators got same result)
        if (verifyResultsMatch(request.results)) {
            // Consensus reached!
            request.finalResult = request.results[0]; // Use first result (all are identical)
            request.status = RequestStatus.COMPLETED;
            
            // Update validator reputations
            for (uint256 i = 0; i < request.resultSubmitters.length; i++) {
                validators[request.resultSubmitters[i]].successfulRequests++;
                // Increase reputation slightly
                if (validators[request.resultSubmitters[i]].reputation < 1000) {
                    validators[request.resultSubmitters[i]].reputation += 1;
                }
            }
            
            emit FHEComputationCompleted(requestId, request.finalResult, request.resultSubmitters);
            
            // TODO: Reward validators (distribute fees)
            // rewardValidators(requestId);
        } else {
            // Results don't match - consensus failed
            request.status = RequestStatus.FAILED;
            
            // Slash validators (for now, just decrease reputation)
            for (uint256 i = 0; i < request.resultSubmitters.length; i++) {
                if (validators[request.resultSubmitters[i]].reputation > 0) {
                    validators[request.resultSubmitters[i]].reputation -= 10;
                }
            }
            
            emit FHEComputationFailed(requestId, "Consensus failed: results don't match");
        }
    }
    
    /**
     * @notice Select random validators
     * @param count Number of validators to select
     * @return selected Array of selected validator addresses
     */
    function selectValidators(uint256 count) internal view returns (address[] memory selected) {
        require(validatorList.length >= count, "FHEValidator: insufficient validators");
        
        selected = new address[](count);
        address[] memory available = new address[](validatorList.length);
        uint256 availableCount = 0;
        
        // Filter active validators
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].active) {
                available[availableCount] = validatorList[i];
                availableCount++;
            }
        }
        
        require(availableCount >= count, "FHEValidator: insufficient active validators");
        
        // Select random validators (using block hash for randomness)
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty, block.number)));
        uint256 selectedCount = 0;
        
        while (selectedCount < count) {
            uint256 index = seed % availableCount;
            address candidate = available[index];
            
            // Check if already selected
            bool alreadySelected = false;
            for (uint256 j = 0; j < selectedCount; j++) {
                if (selected[j] == candidate) {
                    alreadySelected = true;
                    break;
                }
            }
            
            if (!alreadySelected) {
                selected[selectedCount] = candidate;
                selectedCount++;
            }
            
            // Update seed for next iteration
            seed = uint256(keccak256(abi.encodePacked(seed)));
        }
        
        return selected;
    }
    
    /**
     * @notice Verify results match (consensus check)
     */
    function verifyResultsMatch(bytes[] memory results) internal pure returns (bool) {
        if (results.length < CONSENSUS_THRESHOLD) return false;
        
        // Check if all results are identical (hash comparison)
        bytes32 firstHash = keccak256(results[0]);
        for (uint256 i = 1; i < results.length; i++) {
            if (keccak256(results[i]) != firstHash) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * @notice Check if validator is selected for request
     */
    function isSelectedValidator(bytes32 requestId, address validator) internal view returns (bool) {
        address[] memory selected = requests[requestId].validators;
        for (uint256 i = 0; i < selected.length; i++) {
            if (selected[i] == validator) return true;
        }
        return false;
    }
    
    // ============ View Functions ============
    
    /**
     * @notice Get request status
     */
    function getRequestStatus(bytes32 requestId) external view returns (
        RequestStatus status,
        bytes memory finalResult,
        uint256 resultCount
    ) {
        FHERequest storage request = requests[requestId];
        return (request.status, request.finalResult, request.results.length);
    }
    
    /**
     * @notice Get validator count
     */
    function getValidatorCount() external view returns (uint256) {
        return validatorList.length;
    }
    
    /**
     * @notice Get active validator count
     */
    function getActiveValidatorCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].active) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @notice Get validator info
     */
    function getValidatorInfo(address validator) external view returns (
        string memory endpoint,
        uint256 staked,
        bool active,
        uint256 reputation,
        uint256 totalRequests,
        uint256 successfulRequests
    ) {
        ValidatorInfo storage info = validators[validator];
        return (
            info.endpoint,
            info.staked,
            info.active,
            info.reputation,
            info.totalRequests,
            info.successfulRequests
        );
    }
}
