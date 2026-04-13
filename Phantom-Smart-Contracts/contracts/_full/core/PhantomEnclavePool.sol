// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PhantomEnclavePool
 * @notice Hybrid FHE pool: 5000 stakers + AWS Enclaves
 * @dev Phantom Protocol - Maximum Privacy DeFi Platform
 * 
 * Architecture:
 * - 5000 stakers (decentralized, low cost)
 * - AWS Enclaves (trusted, high security)
 * - Mixed pool: Best of both worlds
 * - Scales by adding more enclaves
 * 
 * Why This Approach:
 * - Stakers: Decentralization, low cost, anyone can join
 * - Enclaves: Trusted execution, high security, fast
 * - Hybrid: Best privacy + best security + best cost
 * 
 * Scaling:
 * - Start: 5000 stakers + 1 enclave
 * - Grow: Add more enclaves as needed
 * - Result: Infinite scalability
 */
contract PhantomEnclavePool {
    
    // ============ State Variables ============
    
    enum ComputationType {
        STAKER_ONLY,    // Use only stakers (decentralized)
        ENCLAVE_ONLY,   // Use only enclave (trusted)
        HYBRID          // Use both (mixed pool)
    }
    
    struct EnclaveInfo {
        string endpoint;        // Enclave endpoint (AWS Nitro Enclave)
        bytes publicKey;        // Enclave public key
        bool active;            // Active status
        uint256 capacity;       // Max computations per second
        uint256 currentLoad;    // Current load
        uint256 reputation;     // Reputation score
    }
    
    struct StakerInfo {
        address staker;         // Staker address
        uint256 staked;         // Staked amount
        bool active;            // Active status
        uint256 reputation;     // Reputation score
        uint256 totalRequests;  // Total requests processed
        uint256 successfulRequests; // Successful requests
    }
    
    struct ComputationRequest {
        bytes encryptedData;    // Encrypted input data
        bytes32 commitment;     // Commitment to expected result
        ComputationType type_;  // Computation type
        address[] stakers;      // Selected stakers (if staker/hybrid)
        address enclave;       // Selected enclave (if enclave/hybrid)
        bytes[] results;       // Results from stakers/enclave
        uint256 timestamp;      // Request timestamp
        bool completed;         // Completion status
        bytes finalResult;      // Final committed result
        uint256 fee;            // Fee for computation
    }
    
    mapping(address => EnclaveInfo) public enclaves;
    mapping(address => StakerInfo) public stakers;
    mapping(bytes32 => ComputationRequest) public requests;
    
    address[] public enclaveList;
    address[] public stakerList;
    
    uint256 public constant MIN_STAKE = 1 ether;
    uint256 public constant STAKER_COUNT = 5000; // Target: 5000 stakers
    uint256 public constant STAKERS_PER_REQUEST = 3; // Select 3 stakers per request
    uint256 public constant CONSENSUS_THRESHOLD = 2; // Need 2/3 consensus
    
    address public owner;
    ComputationType public defaultComputationType = ComputationType.HYBRID;
    
    uint256 public totalFeesCollected;
    uint256 public totalFeesDistributed;
    
    // ============ Events ============
    
    event EnclaveRegistered(address indexed enclave, string endpoint);
    event StakerRegistered(address indexed staker, uint256 staked);
    event ComputationRequested(
        bytes32 indexed requestId,
        ComputationType type_,
        address[] stakers,
        address enclave,
        uint256 fee
    );
    event ResultSubmitted(bytes32 indexed requestId, address indexed submitter, bytes result);
    event ComputationCompleted(bytes32 indexed requestId, bytes finalResult);
    event FeesDistributed(address[] recipients, uint256[] amounts);
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
    }
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "PhantomEnclavePool: not owner");
        _;
    }
    
    // ============ Enclave Management ============
    
    /**
     * @notice Register AWS Enclave
     * @dev Only owner can register enclaves (trusted infrastructure)
     * @param enclaveAddress Enclave address
     * @param endpoint Enclave endpoint (AWS Nitro Enclave)
     * @param publicKey Enclave public key
     * @param capacity Max computations per second
     */
    function registerEnclave(
        address enclaveAddress,
        string memory endpoint,
        bytes memory publicKey,
        uint256 capacity
    ) external onlyOwner {
        require(!enclaves[enclaveAddress].active, "PhantomEnclavePool: enclave already registered");
        
        enclaves[enclaveAddress] = EnclaveInfo({
            endpoint: endpoint,
            publicKey: publicKey,
            active: true,
            capacity: capacity,
            currentLoad: 0,
            reputation: 1000
        });
        
        enclaveList.push(enclaveAddress);
        
        emit EnclaveRegistered(enclaveAddress, endpoint);
    }
    
    /**
     * @notice Add more enclaves (scaling)
     * @dev As we grow, add more enclaves for capacity
     */
    function addEnclave(
        address enclaveAddress,
        string memory endpoint,
        bytes memory publicKey,
        uint256 capacity
    ) external onlyOwner {
        require(!enclaves[enclaveAddress].active, "PhantomEnclavePool: enclave already registered");
        
        enclaves[enclaveAddress] = EnclaveInfo({
            endpoint: endpoint,
            publicKey: publicKey,
            active: true,
            capacity: capacity,
            currentLoad: 0,
            reputation: 1000
        });
        
        enclaveList.push(enclaveAddress);
        
        emit EnclaveRegistered(enclaveAddress, endpoint);
    }
    
    // ============ Staker Management ============
    
    /**
     * @notice Register as staker
     * @dev Anyone can register (decentralized)
     * @param _endpoint Staker endpoint
     * @param _publicKey Staker public key
     */
    function registerStaker(
        string memory _endpoint,
        bytes memory _publicKey
    ) external payable {
        require(msg.value >= MIN_STAKE, "PhantomEnclavePool: insufficient stake");
        require(!stakers[msg.sender].active, "PhantomEnclavePool: staker already registered");
        require(stakerList.length < STAKER_COUNT, "PhantomEnclavePool: max stakers reached");
        
        stakers[msg.sender] = StakerInfo({
            staker: msg.sender,
            staked: msg.value,
            active: true,
            reputation: 1000,
            totalRequests: 0,
            successfulRequests: 0
        });
        
        stakerList.push(msg.sender);
        
        emit StakerRegistered(msg.sender, msg.value);
    }
    
    // ============ Computation ============
    
    /**
     * @notice Submit FHE computation request
     * @dev Uses hybrid pool (stakers + enclaves)
     * @param encryptedData Encrypted input data
     * @param commitment Commitment to expected result
     * @param type_ Computation type (STAKER_ONLY, ENCLAVE_ONLY, HYBRID)
     * @return requestId Request identifier
     */
    function submitComputation(
        bytes memory encryptedData,
        bytes32 commitment,
        ComputationType type_
    ) external payable returns (bytes32 requestId) {
        require(encryptedData.length > 0, "PhantomEnclavePool: empty data");
        require(commitment != bytes32(0), "PhantomEnclavePool: zero commitment");
        require(msg.value > 0, "PhantomEnclavePool: fee required");
        
        // Use default type if not specified
        if (type_ == ComputationType.HYBRID && enclaveList.length == 0) {
            type_ = ComputationType.STAKER_ONLY;
        }
        
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            encryptedData,
            commitment,
            block.timestamp,
            block.number
        ));
        
        address[] memory selectedStakers = new address[](0);
        address selectedEnclave = address(0);
        
        // Select computation providers based on type
        if (type_ == ComputationType.STAKER_ONLY || type_ == ComputationType.HYBRID) {
            require(stakerList.length >= STAKERS_PER_REQUEST, "PhantomEnclavePool: insufficient stakers");
            selectedStakers = _selectRandomStakers(STAKERS_PER_REQUEST);
        }
        
        if (type_ == ComputationType.ENCLAVE_ONLY || type_ == ComputationType.HYBRID) {
            require(enclaveList.length > 0, "PhantomEnclavePool: no enclaves available");
            selectedEnclave = _selectEnclave();
        }
        
        requests[requestId] = ComputationRequest({
            encryptedData: encryptedData,
            commitment: commitment,
            type_: type_,
            stakers: selectedStakers,
            enclave: selectedEnclave,
            results: new bytes[](0),
            timestamp: block.timestamp,
            completed: false,
            finalResult: "",
            fee: msg.value
        });
        
        totalFeesCollected += msg.value;
        
        emit ComputationRequested(requestId, type_, selectedStakers, selectedEnclave, msg.value);
        
        return requestId;
    }
    
    /**
     * @notice Submit computation result (staker)
     */
    function submitStakerResult(
        bytes32 requestId,
        bytes memory result
    ) external {
        require(stakers[msg.sender].active, "PhantomEnclavePool: not a staker");
        ComputationRequest storage request = requests[requestId];
        require(!request.completed, "PhantomEnclavePool: request completed");
        
        // Check if staker is selected
        bool isSelected = false;
        for (uint256 i = 0; i < request.stakers.length; i++) {
            if (request.stakers[i] == msg.sender) {
                isSelected = true;
                break;
            }
        }
        require(isSelected, "PhantomEnclavePool: not selected staker");
        
        request.results.push(result);
        stakers[msg.sender].totalRequests++;
        
        emit ResultSubmitted(requestId, msg.sender, result);
        
        // Check consensus
        _checkConsensus(requestId);
    }
    
    /**
     * @notice Submit computation result (enclave)
     */
    function submitEnclaveResult(
        bytes32 requestId,
        bytes memory result
    ) external {
        require(enclaves[msg.sender].active, "PhantomEnclavePool: not an enclave");
        ComputationRequest storage request = requests[requestId];
        require(!request.completed, "PhantomEnclavePool: request completed");
        require(request.enclave == msg.sender, "PhantomEnclavePool: not selected enclave");
        
        // Enclave results are trusted (AWS Nitro Enclave)
        request.finalResult = result;
        request.completed = true;
        
        // Distribute fees
        _distributeFees(requestId);
        
        emit ComputationCompleted(requestId, result);
    }
    
    // ============ Internal Functions ============
    
    function _selectRandomStakers(uint256 count) internal view returns (address[] memory) {
        require(stakerList.length >= count, "PhantomEnclavePool: insufficient stakers");
        
        address[] memory selected = new address[](count);
        uint256 seed = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, block.number)));
        
        for (uint256 i = 0; i < count; i++) {
            uint256 index = (seed + i) % stakerList.length;
            selected[i] = stakerList[index];
            seed = uint256(keccak256(abi.encodePacked(seed)));
        }
        
        return selected;
    }
    
    function _selectEnclave() internal view returns (address) {
        require(enclaveList.length > 0, "PhantomEnclavePool: no enclaves");
        
        // Select enclave with lowest load
        address selected = enclaveList[0];
        uint256 minLoad = enclaves[selected].currentLoad;
        
        for (uint256 i = 1; i < enclaveList.length; i++) {
            if (enclaves[enclaveList[i]].currentLoad < minLoad) {
                minLoad = enclaves[enclaveList[i]].currentLoad;
                selected = enclaveList[i];
            }
        }
        
        return selected;
    }
    
    function _checkConsensus(bytes32 requestId) internal {
        ComputationRequest storage request = requests[requestId];
        
        if (request.results.length < CONSENSUS_THRESHOLD) {
            return; // Wait for more results
        }
        
        // Check if results match (consensus)
        bytes32 firstHash = keccak256(request.results[0]);
        uint256 matchCount = 1;
        
        for (uint256 i = 1; i < request.results.length; i++) {
            if (keccak256(request.results[i]) == firstHash) {
                matchCount++;
            }
        }
        
        if (matchCount >= CONSENSUS_THRESHOLD) {
            // Consensus reached
            request.finalResult = request.results[0];
            request.completed = true;
            
            // Update staker stats
            for (uint256 i = 0; i < request.stakers.length; i++) {
                if (keccak256(request.results[i]) == firstHash) {
                    stakers[request.stakers[i]].successfulRequests++;
                }
            }
            
            // Distribute fees
            _distributeFees(requestId);
            
            emit ComputationCompleted(requestId, request.finalResult);
        }
    }
    
    function _distributeFees(bytes32 requestId) internal {
        ComputationRequest storage request = requests[requestId];
        
        uint256 feePerRecipient = request.fee / (request.stakers.length + (request.enclave != address(0) ? 1 : 0));
        
        // Distribute to stakers
        for (uint256 i = 0; i < request.stakers.length; i++) {
            stakers[request.stakers[i]].staked += feePerRecipient;
            payable(request.stakers[i]).transfer(feePerRecipient);
        }
        
        // Distribute to enclave (if used)
        if (request.enclave != address(0)) {
            payable(request.enclave).transfer(feePerRecipient);
        }
        
        totalFeesDistributed += request.fee;
    }
    
    // ============ View Functions ============
    
    function getRequestStatus(bytes32 requestId) external view returns (
        bool completed,
        bytes memory finalResult,
        uint256 resultCount
    ) {
        ComputationRequest storage request = requests[requestId];
        return (request.completed, request.finalResult, request.results.length);
    }
    
    function getStakerCount() external view returns (uint256) {
        return stakerList.length;
    }
    
    function getEnclaveCount() external view returns (uint256) {
        return enclaveList.length;
    }
}
