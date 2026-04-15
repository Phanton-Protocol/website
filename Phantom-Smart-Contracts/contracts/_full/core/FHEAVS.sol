// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FHEAVS
 * @notice FHE Validator as EigenLayer AVS (Actively Validated Service)
 * @dev Stakers can restake and run FHE nodes to earn fees
 * 
 * Architecture:
 * - EigenLayer integration (restaking)
 * - Stakers run FHE nodes (rent infrastructure)
 * - Fee distribution to stakers
 * - Team runs initial nodes (bootstrap)
 * - Others can join and earn fees
 * 
 * Staker Requirements:
 * - Restake tokens (via EigenLayer)
 * - Run FHE node (rent server or use own)
 * - Process FHE computations
 * - Earn fees from transactions
 */
contract FHEAVS {
    
    // ============ State Variables ============
    
    enum RequestStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }
    
    struct ValidatorInfo {
        string endpoint;        // FHE node endpoint
        bytes publicKey;        // FHE public key
        uint256 staked;         // Restaked amount (via EigenLayer)
        bool active;            // Active status
        uint256 reputation;     // Reputation (0-1000)
        uint256 totalRequests;  // Total requests processed
        uint256 successfulRequests; // Successful requests
        uint256 earnedFees;     // Total fees earned
    }
    
    struct FHERequest {
        bytes encryptedData;
        bytes32 commitment;
        address[] validators;
        bytes[] results;
        address[] resultSubmitters;
        uint256 timestamp;
        RequestStatus status;
        bytes finalResult;
        uint256 fee;            // Fee for this computation
    }
    
    mapping(address => ValidatorInfo) public validators;
    mapping(bytes32 => FHERequest) public requests;
    
    address[] public validatorList;
    
    uint256 public constant MIN_STAKE = 1 ether; // Minimum restake
    uint256 public constant VALIDATOR_COUNT = 3;  // Select 3 validators
    uint256 public constant CONSENSUS_THRESHOLD = 2; // Need 2/3 consensus
    
    // Fee distribution
    uint256 public constant FEE_PERCENTAGE = 80; // 80% to validators, 20% to protocol
    uint256 public constant FEE_DENOMINATOR = 100;
    
    address public owner;
    uint256 public totalFeesCollected;
    uint256 public totalFeesDistributed;
    
    // ============ Events ============
    
    event ValidatorRegistered(address indexed validator, string endpoint);
    event FHEComputationRequested(bytes32 indexed requestId, address[] validators, uint256 fee);
    event FHEResultSubmitted(bytes32 indexed requestId, address indexed validator);
    event FHEComputationCompleted(bytes32 indexed requestId, bytes result);
    event FeesDistributed(address[] validators, uint256[] amounts);
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ Validator Registration ============
    
    /**
     * @notice Register as FHE validator (staker)
     * @dev Staker must restake via EigenLayer first
     * @param endpoint FHE node endpoint
     * @param publicKey FHE public key
     */
    function registerValidator(
        string memory endpoint,
        bytes memory publicKey
    ) external payable {
        require(msg.value >= MIN_STAKE, "FHEAVS: insufficient stake");
        require(!validators[msg.sender].active, "FHEAVS: already registered");
        require(publicKey.length > 0, "FHEAVS: empty public key");
        
        // TODO: Verify EigenLayer restaking
        // require(eigenLayer.isRestaked(msg.sender), "FHEAVS: not restaked");
        
        validators[msg.sender] = ValidatorInfo({
            endpoint: endpoint,
            publicKey: publicKey,
            staked: msg.value,
            active: true,
            reputation: 1000,
            totalRequests: 0,
            successfulRequests: 0,
            earnedFees: 0
        });
        
        validatorList.push(msg.sender);
        
        emit ValidatorRegistered(msg.sender, endpoint);
    }
    
    /**
     * @notice Owner can add team validators (bootstrap)
     */
    function addTeamValidator(
        address validator,
        string memory endpoint,
        bytes memory publicKey
    ) external {
        require(msg.sender == owner, "FHEAVS: not owner");
        require(!validators[validator].active, "FHEAVS: already registered");
        
        validators[validator] = ValidatorInfo({
            endpoint: endpoint,
            publicKey: publicKey,
            staked: 0, // Team validators don't need stake initially
            active: true,
            reputation: 1000,
            totalRequests: 0,
            successfulRequests: 0,
            earnedFees: 0
        });
        
        validatorList.push(validator);
        
        emit ValidatorRegistered(validator, endpoint);
    }
    
    // ============ FHE Computation ============
    
    /**
     * @notice Submit FHE computation request (with fee)
     * @param encryptedData Encrypted input data
     * @param commitment Commitment to expected result
     * @return requestId Request identifier
     */
    function submitFHEComputation(
        bytes memory encryptedData,
        bytes32 commitment
    ) external payable returns (bytes32 requestId) {
        require(encryptedData.length > 0, "FHEAVS: empty data");
        require(commitment != bytes32(0), "FHEAVS: zero commitment");
        require(validatorList.length >= VALIDATOR_COUNT, "FHEAVS: insufficient validators");
        require(msg.value > 0, "FHEAVS: fee required");
        
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            encryptedData,
            commitment,
            block.timestamp,
            block.number
        ));
        
        address[] memory selectedValidators = selectValidators(VALIDATOR_COUNT);
        
        requests[requestId] = FHERequest({
            encryptedData: encryptedData,
            commitment: commitment,
            validators: selectedValidators,
            results: new bytes[](0),
            resultSubmitters: new address[](0),
            timestamp: block.timestamp,
            status: RequestStatus.PENDING,
            finalResult: "",
            fee: msg.value
        });
        
        totalFeesCollected += msg.value;
        
        emit FHEComputationRequested(requestId, selectedValidators, msg.value);
        
        return requestId;
    }
    
    /**
     * @notice Validator submits FHE computation result
     */
    function submitFHEResult(
        bytes32 requestId,
        bytes memory encryptedResult,
        bytes memory _proof
    ) external {
        require(validators[msg.sender].active, "FHEAVS: not a validator");
        FHERequest storage request = requests[requestId];
        require(request.status == RequestStatus.PENDING || request.status == RequestStatus.PROCESSING, "FHEAVS: request not pending");
        require(isSelectedValidator(requestId, msg.sender), "FHEAVS: not selected");
        require(encryptedResult.length > 0, "FHEAVS: empty result");
        
        // Check if already submitted
        bool alreadySubmitted = false;
        for (uint256 i = 0; i < request.resultSubmitters.length; i++) {
            if (request.resultSubmitters[i] == msg.sender) {
                alreadySubmitted = true;
                break;
            }
        }
        require(!alreadySubmitted, "FHEAVS: already submitted");
        
        request.results.push(encryptedResult);
        request.resultSubmitters.push(msg.sender);
        request.status = RequestStatus.PROCESSING;
        
        validators[msg.sender].totalRequests++;
        
        emit FHEResultSubmitted(requestId, msg.sender);
        
        if (request.results.length >= CONSENSUS_THRESHOLD) {
            _checkConsensus(requestId);
        }
    }
    
    /**
     * @notice Check consensus and distribute fees
     */
    function _checkConsensus(bytes32 requestId) internal {
        FHERequest storage request = requests[requestId];
        
        if (verifyResultsMatch(request.results)) {
            request.finalResult = request.results[0];
            request.status = RequestStatus.COMPLETED;
            
            // Update validator stats
            for (uint256 i = 0; i < request.resultSubmitters.length; i++) {
                validators[request.resultSubmitters[i]].successfulRequests++;
                if (validators[request.resultSubmitters[i]].reputation < 1000) {
                    validators[request.resultSubmitters[i]].reputation += 1;
                }
            }
            
            // Distribute fees
            _distributeFees(requestId);
            
            emit FHEComputationCompleted(requestId, request.finalResult);
        } else {
            request.status = RequestStatus.FAILED;
            
            // Slash reputation
            for (uint256 i = 0; i < request.resultSubmitters.length; i++) {
                if (validators[request.resultSubmitters[i]].reputation > 0) {
                    validators[request.resultSubmitters[i]].reputation -= 10;
                }
            }
        }
    }
    
    /**
     * @notice Distribute fees to validators
     */
    function _distributeFees(bytes32 requestId) internal {
        FHERequest storage request = requests[requestId];
        
        uint256 validatorFee = (request.fee * FEE_PERCENTAGE) / FEE_DENOMINATOR;
        uint256 feePerValidator = validatorFee / request.resultSubmitters.length;

        // Distribute to validators
        uint256[] memory amounts = new uint256[](request.resultSubmitters.length);
        for (uint256 i = 0; i < request.resultSubmitters.length; i++) {
            validators[request.resultSubmitters[i]].earnedFees += feePerValidator;
            amounts[i] = feePerValidator;
            
            // Transfer fee
            payable(request.resultSubmitters[i]).transfer(feePerValidator);
        }
        
        totalFeesDistributed += validatorFee;
        
        emit FeesDistributed(request.resultSubmitters, amounts);
    }
    
    // ============ Helper Functions ============
    
    function selectValidators(uint256 count) internal view returns (address[] memory) {
        require(validatorList.length >= count, "FHEAVS: insufficient validators");
        
        address[] memory selected = new address[](count);
        address[] memory available = new address[](validatorList.length);
        uint256 availableCount = 0;
        
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].active) {
                available[availableCount] = validatorList[i];
                availableCount++;
            }
        }
        
        require(availableCount >= count, "FHEAVS: insufficient active validators");
        
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, block.number)));
        uint256 selectedCount = 0;
        
        while (selectedCount < count) {
            uint256 index = seed % availableCount;
            address candidate = available[index];
            
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
            
            seed = uint256(keccak256(abi.encodePacked(seed)));
        }
        
        return selected;
    }
    
    function verifyResultsMatch(bytes[] memory results) internal pure returns (bool) {
        if (results.length < CONSENSUS_THRESHOLD) return false;
        
        bytes32 firstHash = keccak256(results[0]);
        for (uint256 i = 1; i < results.length; i++) {
            if (keccak256(results[i]) != firstHash) {
                return false;
            }
        }
        return true;
    }
    
    function isSelectedValidator(bytes32 requestId, address validator) internal view returns (bool) {
        address[] memory selected = requests[requestId].validators;
        for (uint256 i = 0; i < selected.length; i++) {
            if (selected[i] == validator) return true;
        }
        return false;
    }
    
    // ============ View Functions ============
    
    function getRequestStatus(bytes32 requestId) external view returns (
        RequestStatus status,
        bytes memory finalResult,
        uint256 resultCount
    ) {
        FHERequest storage request = requests[requestId];
        return (request.status, request.finalResult, request.results.length);
    }
    
    function getValidatorCount() external view returns (uint256) {
        return validatorList.length;
    }
    
    function getActiveValidatorCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < validatorList.length; i++) {
            if (validators[validatorList[i]].active) {
                count++;
            }
        }
        return count;
    }
    
    function getValidatorInfo(address validator) external view returns (
        string memory endpoint,
        uint256 staked,
        bool active,
        uint256 reputation,
        uint256 totalRequests,
        uint256 successfulRequests,
        uint256 earnedFees
    ) {
        ValidatorInfo storage info = validators[validator];
        return (
            info.endpoint,
            info.staked,
            info.active,
            info.reputation,
            info.totalRequests,
            info.successfulRequests,
            info.earnedFees
        );
    }
}
