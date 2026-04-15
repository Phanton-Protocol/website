// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "../interfaces/IShieldedPool.sol";
import "../interfaces/IVerifier.sol";
import "../interfaces/IPancakeSwapAdaptor.sol";
import "../interfaces/IFeeOracle.sol";
import "../interfaces/IRelayerRegistry.sol";
import "../interfaces/IFeeDistributor.sol";
import "../interfaces/IDepositHandler.sol";
import "../interfaces/ISwapHandler.sol";
import "../interfaces/IWithdrawHandler.sol";
import "../types/Types.sol";
import "../libraries/MerkleTree.sol";
import "../libraries/IncrementalMerkleTree.sol";

/**
 * @title ShieldedPoolUpgradeableReduced
 * @notice Reduced-size version with core functionality only
 * @dev Removed: TransactionHistory, TimelockController, ComplianceModule, FHE, ThresholdEncryption, MEV protection
 * CRITICAL FIX: Uses tree.insert() for deposits (MiMC7) - matches swaps/withdraws
 */
contract ShieldedPoolUpgradeableReduced is IShieldedPool, UUPSUpgradeable, OwnableUpgradeable, ReentrancyGuardUpgradeable {
    using IncrementalMerkleTree for IncrementalMerkleTree.Tree;

    // ============ Constants ============
    uint256 public constant MAX_TREE_DEPTH = 10; // Reduced from 20 to save space
    uint256 public constant MAX_ASSETS = 256;

    // ============ Core State Variables ============
    IVerifier public verifier;
    IVerifier public thresholdVerifier;
    IPancakeSwapAdaptor public swapAdaptor;
    IFeeOracle public feeOracle;
    IRelayerRegistry public relayerRegistry;
    address public depositHandler;
    address public swapHandler;
    address public withdrawHandler;
    
    // Merkle Tree State
    IncrementalMerkleTree.Tree private tree;
    bytes32 public merkleRoot;
    uint256 public commitmentCount;
    mapping(uint256 => bytes32) public commitments;
    
    // Nullifier Tracking
    mapping(bytes32 => bool) public nullifiers;
    
    // Asset Registry
    mapping(uint256 => address) public assetRegistry;
    mapping(address => uint256) public assetIDMap;
    uint256 public nextAssetID;
    
    // User Notes
    mapping(address => bytes32) public userNotes;
    mapping(address => uint256) public userNoteAssetID;
    
    // Gas Reserve
    uint256 public gasReserve;
    
    // Relayer Blacklisting
    mapping(address => bool) public blacklistedRelayers;
    
    // Compliance (optional - can be set later)
    address internal complianceModuleAddress;
    address internal poolOwner;
    
    uint256 public constant SWAP_FEE_NUMERATOR = 5;
    uint256 public constant SWAP_FEE_DENOMINATOR = 100000;

    // Deposit fee model: $2 fee, 0.5¢ to relayer, 80% to stakers
    uint256 public constant DEPOSIT_FEE_USD = 2 * 1e8;       // $2 (8 decimals)
    uint256 public constant RELAYER_CUT_USD = 5 * 1e5;       // $0.005 = 0.5 cents
    uint256 public constant STAKER_SHARE_BPS = 8000;         // 80%

    // ============ Events ============
    event Deposit(
        address indexed depositor,
        address indexed token,
        uint256 assetID,
        uint256 amount,
        bytes32 commitment,
        uint256 commitmentIndex
    );
    event ShieldedSwap(
        bytes32 indexed nullifier,
        bytes32 indexed inputCommitment,
        bytes32 indexed outputCommitment,
        uint256 inputAssetID,
        uint256 outputAssetID,
        uint256 inputAmount,
        uint256 outputAmount,
        address relayer
    );
    event ShieldedSwapJoinSplit(
        bytes32 indexed nullifier,
        bytes32 indexed inputCommitment,
        bytes32 indexed outputCommitmentSwap,
        bytes32 outputCommitmentChange,
        uint256 inputAssetID,
        uint256 outputAssetIDSwap,
        uint256 outputAssetIDChange,
        uint256 inputAmount,
        uint256 swapAmount,
        uint256 changeAmount,
        uint256 outputAmountSwap,
        address relayer
    );
    event ShieldedWithdraw(
        bytes32 indexed nullifier,
        bytes32 indexed inputCommitment,
        bytes32 indexed outputCommitmentChange,
        uint256 inputAssetID,
        uint256 inputAmount,
        uint256 withdrawAmount,
        uint256 changeAmount,
        address recipient,
        address relayer
    );
    event CommitmentAdded(bytes32 indexed commitment, uint256 index);
    event NullifierMarked(bytes32 indexed nullifier);
    event GasRefunded(address indexed relayer, uint256 amount);

    // ============ Modifiers ============
    modifier onlyRelayer() {
        require(relayerRegistry.isRelayer(msg.sender), "ShieldedPool: not a relayer");
        require(!blacklistedRelayers[msg.sender], "ShieldedPool: blacklisted relayer");
        _;
    }

    // ============ Initialization ============
    function initialize(
        address _verifier,
        address _thresholdVerifier,
        address _swapAdaptor,
        address _feeOracle,
        address _relayerRegistry
    ) public initializer {
        require(_verifier != address(0), "ShieldedPool: zero verifier");
        require(_thresholdVerifier != address(0), "ShieldedPool: zero threshold verifier");
        require(_swapAdaptor != address(0), "ShieldedPool: zero adaptor");
        require(_feeOracle != address(0), "ShieldedPool: zero oracle");
        require(_relayerRegistry != address(0), "ShieldedPool: zero registry");

        __Ownable_init();
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();

        verifier = IVerifier(_verifier);
        thresholdVerifier = IVerifier(_thresholdVerifier);
        swapAdaptor = IPancakeSwapAdaptor(_swapAdaptor);
        feeOracle = IFeeOracle(_feeOracle);
        relayerRegistry = IRelayerRegistry(_relayerRegistry);
        
        complianceModuleAddress = address(0);
        poolOwner = msg.sender;

        tree.init(10); // Standard depth
        merkleRoot = tree.getRoot();
        nextAssetID = 1;
        gasReserve = 0;
    }

    // ============ UUPS Authorization ============
    function _authorizeUpgrade(address newImplementation) internal override onlyOwner {}

    // ============ Setters ============
    function setDepositHandler(address _depositHandler) external onlyOwner {
        require(_depositHandler != address(0), "ShieldedPool: zero handler");
        depositHandler = _depositHandler;
    }

    function setSwapHandler(address _swapHandler) external onlyOwner {
        require(_swapHandler != address(0), "ShieldedPool: zero handler");
        swapHandler = _swapHandler;
    }

    function setWithdrawHandler(address _withdrawHandler) external onlyOwner {
        require(_withdrawHandler != address(0), "ShieldedPool: zero handler");
        withdrawHandler = _withdrawHandler;
    }

    function setComplianceModule(address _complianceModule) external onlyOwner {
        complianceModuleAddress = _complianceModule;
    }

    function getComplianceModule() external view returns (address) {
        return complianceModuleAddress;
    }

    function setSwapAdaptor(address _swapAdaptor) external onlyOwner {
        require(_swapAdaptor != address(0), "ShieldedPool: zero adaptor");
        swapAdaptor = IPancakeSwapAdaptor(_swapAdaptor);
    }

    // ============ Deposit Functions ============
    function deposit(
        address token,
        uint256 amount,
        bytes32 commitment,
        uint256 assetID
    ) external payable override {
        _depositInternal(msg.sender, token, amount, commitment, assetID, msg.value, address(0));
    }

    function depositFor(
        address depositor,
        address token,
        uint256 amount,
        bytes32 commitment,
        uint256 assetID
    ) external override {
        require(depositor != address(0), "ShieldedPool: zero depositor");
        require(token != address(0), "ShieldedPool: relayed deposit ERC20 only");
        _depositInternal(depositor, token, amount, commitment, assetID, 0, msg.sender);
    }

    function depositForBNB(
        address depositor,
        bytes32 commitment,
        uint256 assetID
    ) external payable override {
        require(depositor != address(0), "ShieldedPool: zero depositor");
        require(msg.value > 0, "ShieldedPool: zero value");
        _depositInternal(depositor, address(0), msg.value, commitment, assetID, msg.value, msg.sender);
    }

    function _depositInternal(
        address depositor,
        address token,
        uint256 amount,
        bytes32 commitment,
        uint256 assetID,
        uint256 value,
        address relayer
    ) internal {
        require(amount > 0 && commitment != bytes32(0) && depositor != address(0), "ShieldedPool: invalid input");

        // For BNB deposits, handle directly
        if (token == address(0)) {
            require(value >= amount, "ShieldedPool: insufficient value for BNB deposit");
            uint256 depositFeeBNB = value - amount;
            _finalizeDepositLogic(depositor, token, amount, commitment, assetID, depositFeeBNB, relayer);
        } else {
            // For ERC20 deposits, use handler
            require(depositHandler != address(0), "ShieldedPool: deposit handler not set");
            IDepositHandler(depositHandler).processDeposit(
                depositor,
                token,
                amount,
                commitment,
                assetID,
                value,
                complianceModuleAddress,
                relayer
            );
        }
    }

    function finalizeDeposit(
        address depositor,
        address token,
        uint256 amount,
        bytes32 commitment,
        uint256 assetID,
        uint256 depositFeeBNB,
        address relayer
    ) external override {
        require(msg.sender == depositHandler || msg.sender == address(this), "ShieldedPool: only deposit handler or self");
        _finalizeDepositLogic(depositor, token, amount, commitment, assetID, depositFeeBNB, relayer);
    }

    // ============ CRITICAL FIX: Use tree.insert() for deposits ============
    // Fee model: $2 deposit fee. 0.5¢ to relayer, 80% to stakers, rest to gasReserve (relayer gas coverage)
    function _finalizeDepositLogic(
        address depositor,
        address token,
        uint256 amount,
        bytes32 commitment,
        uint256 assetID,
        uint256 depositFeeBNB,
        address relayer
    ) internal {
        _registerAsset(assetID, token);
        _updateUserNoteOnDeposit(depositor, commitment, assetID);

        // CRITICAL: Use tree.insert() (MiMC7) - same as swaps/withdraws
        (uint256 index, bytes32 newRoot) = tree.insert(commitment);
        commitments[index] = commitment;
        merkleRoot = newRoot;
        commitmentCount = tree.nextIndex;

        // Split deposit fee: $2 min, 0.5¢ to relayer, 80% to stakers, rest to gasReserve
        address feeToken = token == address(0) ? address(0) : token;
        uint256 feeAmount = depositFeeBNB;
        if (feeAmount > 0 && address(feeOracle) != address(0) && address(relayerRegistry) != address(0)) {
            uint256 feeUsd = feeOracle.getUSDValue(feeToken, feeAmount);
            require(feeUsd >= DEPOSIT_FEE_USD, "ShieldedPool: deposit fee below $2");
            uint256 relayerCut = feeOracle.getTokenAmountForUSD(feeToken, RELAYER_CUT_USD);
            if (relayerCut > feeAmount) relayerCut = feeAmount;
            uint256 stakerAmount = (feeAmount * STAKER_SHARE_BPS) / 10000;
            if (stakerAmount > feeAmount - relayerCut) stakerAmount = feeAmount - relayerCut;
            uint256 gasReserveAmount = feeAmount - relayerCut - stakerAmount;

            if (relayerCut > 0) {
                if (relayer != address(0)) {
                    if (feeToken == address(0)) {
                        (bool ok,) = payable(relayer).call{value: relayerCut}("");
                        require(ok, "ShieldedPool: relayer transfer failed");
                    } else {
                        (bool ok,) = feeToken.call(abi.encodeWithSignature("transfer(address,uint256)", relayer, relayerCut));
                        require(ok, "ShieldedPool: relayer transfer failed");
                    }
                } else {
                    gasReserve += relayerCut; // Self-deposit: relayer cut goes to gas reserve
                }
            }
            if (stakerAmount > 0) {
                if (feeToken == address(0)) {
                    IFeeDistributor(address(relayerRegistry)).distributeFee{value: stakerAmount}(address(0), stakerAmount);
                } else {
                    (bool ok,) = feeToken.call(abi.encodeWithSignature("approve(address,uint256)", address(relayerRegistry), stakerAmount));
                    require(ok, "ShieldedPool: approve failed");
                    IFeeDistributor(address(relayerRegistry)).distributeFee(feeToken, stakerAmount);
                }
            }
            gasReserve += gasReserveAmount;
        } else {
            gasReserve += feeAmount;
        }

        emit Deposit(depositor, token, assetID, amount, commitment, index);
        emit CommitmentAdded(commitment, index);
    }

    // ============ Swap Functions ============
    function shieldedSwap(ShieldedSwapData calldata swapData) external override nonReentrant {
        require(swapHandler != address(0), "ShieldedPool: swap handler not set");
        PublicInputs memory inputs = swapData.publicInputs;

        require(!nullifiers[inputs.nullifier], "ShieldedPool: nullifier already used");
        require(inputs.merkleRoot == merkleRoot, "ShieldedPool: merkle root mismatch");
        
        require(
            MerkleTree.verifyProof(
                inputs.inputCommitment,
                inputs.merkleRoot,
                _convertToBytes32Array(inputs.merklePath),
                inputs.merklePathIndices,
                MAX_TREE_DEPTH
            ),
            "ShieldedPool: invalid merkle proof"
        );

        address inputToken = assetRegistry[inputs.inputAssetID];
        uint256 swapInputAmount = inputs.inputAmount - inputs.protocolFee - inputs.gasRefund;
        
        if (inputToken != address(0)) {
            IERC20(inputToken).approve(address(swapAdaptor), swapInputAmount);
        }
        
        (uint256 swapOutput, ) = ISwapHandler(swapHandler).processSwap{value: inputToken == address(0) ? swapInputAmount : 0}(swapData);
        
        require(swapOutput == inputs.outputAmount, "ShieldedPool: output mismatch");

        (uint256 newIndex, bytes32 newRoot) = tree.insert(inputs.outputCommitment);
        commitments[newIndex] = inputs.outputCommitment;
        merkleRoot = newRoot;
        commitmentCount = tree.nextIndex;

        nullifiers[inputs.nullifier] = true;
        
        address relayer = swapData.relayer != address(0) ? swapData.relayer : msg.sender;
        if (inputs.gasRefund > 0 && gasReserve >= inputs.gasRefund && inputToken == address(0)) {
            gasReserve -= inputs.gasRefund;
            payable(relayer).transfer(inputs.gasRefund);
            emit GasRefunded(relayer, inputs.gasRefund);
        }

        emit ShieldedSwap(
            inputs.nullifier,
            inputs.inputCommitment,
            inputs.outputCommitment,
            inputs.inputAssetID,
            inputs.outputAssetID,
            inputs.inputAmount,
            inputs.outputAmount,
            relayer
        );
        emit NullifierMarked(inputs.nullifier);
        emit CommitmentAdded(inputs.outputCommitment, newIndex);
    }

    function shieldedSwapJoinSplit(JoinSplitSwapData calldata swapData) external override nonReentrant {
        JoinSplitPublicInputs memory inputs = swapData.publicInputs;

        require(!nullifiers[inputs.nullifier], "ShieldedPool: nullifier already used");
        require(inputs.merkleRoot == merkleRoot, "ShieldedPool: merkle root mismatch");
        
        require(
            MerkleTree.verifyProof(
                inputs.inputCommitment,
                inputs.merkleRoot,
                _convertToBytes32Array(inputs.merklePath),
                inputs.merklePathIndices,
                MAX_TREE_DEPTH
            ),
            "ShieldedPool: invalid merkle proof"
        );

        require(
            thresholdVerifier.verifyProof(swapData.proof, _joinSplitInputsToArray(inputs)),
            "ShieldedPool: insufficient validator consensus"
        );
        require(verifier.verifyProof(swapData.proof, _joinSplitInputsToArray(inputs)), "ShieldedPool: invalid proof");

        address inputToken = assetRegistry[inputs.inputAssetID];
        // Ensure output asset IDs are registered for later withdrawals
        _registerAsset(inputs.outputAssetIDSwap, swapData.swapParams.tokenOut);
        _registerAsset(inputs.outputAssetIDChange, inputToken);
        uint256 swapAmount = inputs.swapAmount;
        
        if (inputToken != address(0)) {
            IERC20(inputToken).approve(address(swapAdaptor), swapAmount);
        }

        uint256 outputAmountSwap = IPancakeSwapAdaptor(swapAdaptor).executeSwap{value: inputToken == address(0) ? swapAmount : 0}(
            swapData.swapParams
        );

        require(outputAmountSwap >= inputs.minOutputAmountSwap, "ShieldedPool: insufficient output");

        (uint256 swapIndex, bytes32 swapRoot) = tree.insert(inputs.outputCommitmentSwap);
        commitments[swapIndex] = inputs.outputCommitmentSwap;
        merkleRoot = swapRoot;

        (uint256 changeIndex, bytes32 changeRoot) = tree.insert(inputs.outputCommitmentChange);
        commitments[changeIndex] = inputs.outputCommitmentChange;
        merkleRoot = changeRoot;
        commitmentCount = tree.nextIndex;

        nullifiers[inputs.nullifier] = true;

        address relayer = swapData.relayer != address(0) ? swapData.relayer : msg.sender;
        if (inputs.gasRefund > 0 && gasReserve >= inputs.gasRefund && inputToken == address(0)) {
            gasReserve -= inputs.gasRefund;
            payable(relayer).transfer(inputs.gasRefund);
            emit GasRefunded(relayer, inputs.gasRefund);
        }

        emit ShieldedSwapJoinSplit(
            inputs.nullifier,
            inputs.inputCommitment,
            inputs.outputCommitmentSwap,
            inputs.outputCommitmentChange,
            inputs.inputAssetID,
            inputs.outputAssetIDSwap,
            inputs.outputAssetIDChange,
            inputs.inputAmount,
            inputs.swapAmount,
            inputs.changeAmount,
            inputs.outputAmountSwap,
            relayer
        );
        emit NullifierMarked(inputs.nullifier);
        emit CommitmentAdded(inputs.outputCommitmentSwap, swapIndex);
        emit CommitmentAdded(inputs.outputCommitmentChange, changeIndex);
    }

    // ============ Withdraw Functions ============
    function shieldedWithdraw(ShieldedWithdrawData calldata withdrawData) external override nonReentrant {
        require(withdrawHandler != address(0), "ShieldedPool: withdraw handler not set");
        
        JoinSplitPublicInputs memory inputs = withdrawData.publicInputs;

        require(!nullifiers[inputs.nullifier], "ShieldedPool: nullifier already used");
        require(inputs.merkleRoot == merkleRoot, "ShieldedPool: merkle root mismatch");
        
        require(
            MerkleTree.verifyProof(
                inputs.inputCommitment,
                inputs.merkleRoot,
                _convertToBytes32Array(inputs.merklePath),
                inputs.merklePathIndices,
                MAX_TREE_DEPTH
            ),
            "ShieldedPool: invalid merkle proof"
        );

        require(
            thresholdVerifier.verifyProof(withdrawData.proof, _joinSplitInputsToArray(inputs)),
            "ShieldedPool: insufficient validator consensus"
        );
        require(verifier.verifyProof(withdrawData.proof, _joinSplitInputsToArray(inputs)), "ShieldedPool: invalid proof");

        IWithdrawHandler(withdrawHandler).processWithdraw(withdrawData);

        // Insert change commitment (withdrawal creates change note)
        (uint256 newIndex, bytes32 newRoot) = tree.insert(inputs.outputCommitmentChange);
        commitments[newIndex] = inputs.outputCommitmentChange;
        merkleRoot = newRoot;
        commitmentCount = tree.nextIndex;

        nullifiers[inputs.nullifier] = true;

        address relayer = withdrawData.relayer != address(0) ? withdrawData.relayer : msg.sender;
        if (inputs.gasRefund > 0 && gasReserve >= inputs.gasRefund) {
            gasReserve -= inputs.gasRefund;
            payable(relayer).transfer(inputs.gasRefund);
            emit GasRefunded(relayer, inputs.gasRefund);
        }

        emit ShieldedWithdraw(
            inputs.nullifier,
            inputs.inputCommitment,
            inputs.outputCommitmentChange,
            inputs.inputAssetID,
            inputs.inputAmount,
            inputs.changeAmount,
            inputs.changeAmount,
            withdrawData.recipient,
            relayer
        );
        emit NullifierMarked(inputs.nullifier);
        emit CommitmentAdded(inputs.outputCommitmentChange, newIndex);
    }

    // ============ Portfolio Note (Not Supported in Reduced Pool) ============
    function portfolioDeposit(
        address,
        uint256,
        PortfolioSwapData calldata
    ) external payable override {
        revert("ShieldedPool: portfolio not supported");
    }

    function portfolioSwap(
        PortfolioSwapData calldata
    ) external pure override {
        revert("ShieldedPool: portfolio not supported");
    }

    function portfolioWithdraw(
        PortfolioWithdrawData calldata
    ) external pure override {
        revert("ShieldedPool: portfolio not supported");
    }

    // ============ Multi-Output Withdraw (Required by Interface) ============
    function multiOutputWithdraw(MultiOutputWithdrawData calldata withdrawData) external override nonReentrant {
        // Simplified implementation - delegate to withdraw handler if available
        // Otherwise, treat as single withdrawal
        require(withdrawHandler != address(0), "ShieldedPool: withdraw handler not set");
        
        JoinSplitPublicInputs memory inputs = withdrawData.publicInputs;
        require(!nullifiers[inputs.nullifier], "ShieldedPool: nullifier already used");
        require(inputs.merkleRoot == merkleRoot, "ShieldedPool: merkle root mismatch");
        
        require(
            MerkleTree.verifyProof(
                inputs.inputCommitment,
                inputs.merkleRoot,
                _convertToBytes32Array(inputs.merklePath),
                inputs.merklePathIndices,
                MAX_TREE_DEPTH
            ),
            "ShieldedPool: invalid merkle proof"
        );

        require(verifier.verifyProof(withdrawData.proof, _joinSplitInputsToArray(inputs)), "ShieldedPool: invalid proof");

        // Process withdrawal (handler will distribute to multiple recipients)
        IWithdrawHandler(withdrawHandler).processWithdraw(ShieldedWithdrawData({
            proof: withdrawData.proof,
            publicInputs: inputs,
            recipient: withdrawData.recipients[0].recipient, // Use first recipient
            relayer: withdrawData.relayer,
            encryptedPayload: withdrawData.encryptedPayload
        }));

        // Insert change commitment
        (uint256 newIndex, bytes32 newRoot) = tree.insert(inputs.outputCommitmentChange);
        commitments[newIndex] = inputs.outputCommitmentChange;
        merkleRoot = newRoot;
        commitmentCount = tree.nextIndex;

        nullifiers[inputs.nullifier] = true;

        address relayer = withdrawData.relayer != address(0) ? withdrawData.relayer : msg.sender;
        if (inputs.gasRefund > 0 && gasReserve >= inputs.gasRefund) {
            gasReserve -= inputs.gasRefund;
            payable(relayer).transfer(inputs.gasRefund);
            emit GasRefunded(relayer, inputs.gasRefund);
        }

        emit ShieldedWithdraw(
            inputs.nullifier,
            inputs.inputCommitment,
            inputs.outputCommitmentChange,
            inputs.inputAssetID,
            inputs.inputAmount,
            inputs.changeAmount,
            inputs.changeAmount,
            withdrawData.recipients[0].recipient,
            relayer
        );
        emit NullifierMarked(inputs.nullifier);
        emit CommitmentAdded(inputs.outputCommitmentChange, newIndex);
    }

    // ============ View Functions ============
    function getMerkleRoot() external view override returns (bytes32) {
        return merkleRoot;
    }

    function isNullifierUsed(bytes32 nullifier) external view override returns (bool) {
        return nullifiers[nullifier];
    }

    function getCommitmentCount() external view override returns (uint256) {
        return commitmentCount;
    }

    // ============ Internal Functions ============
    function _registerAsset(uint256 assetID, address token) internal {
        if (assetID == 0) {
            require(token == address(0), "ShieldedPool: assetID 0 reserved for BNB");
            return;
        }
        if (assetRegistry[assetID] == address(0)) {
            require(token != address(0), "ShieldedPool: invalid token");
            assetRegistry[assetID] = token;
            assetIDMap[token] = assetID;
        } else {
            require(assetRegistry[assetID] == token, "ShieldedPool: assetID mismatch");
        }
    }

    function _updateUserNoteOnDeposit(address depositor, bytes32 commitment, uint256 assetID) internal {
        bytes32 existing = userNotes[depositor];
        if (existing == bytes32(0)) {
            userNotes[depositor] = commitment;
            userNoteAssetID[depositor] = assetID;
        } else {
            userNotes[depositor] = commitment;
            require(userNoteAssetID[depositor] == assetID, "ShieldedPool: asset mismatch");
        }
    }

    function _checkCompliance(address depositor) internal virtual {
        if (complianceModuleAddress == address(0)) return;
        (bool success, bytes memory data) = complianceModuleAddress.staticcall(
            abi.encodeWithSignature("isSanctioned(address)", depositor)
        );
        if (success && data.length > 0) {
            require(!abi.decode(data, (bool)), "ShieldedPool: sanctioned address");
        }
    }

    function _convertToBytes32Array(uint256[10] memory arr) internal pure returns (bytes32[10] memory) {
        bytes32[10] memory result;
        for (uint256 i = 0; i < 10; i++) {
            result[i] = bytes32(arr[i]);
        }
        return result;
    }

    function _joinSplitInputsToArray(JoinSplitPublicInputs memory inputs) internal pure returns (uint256[] memory) {
        // Must match the circuit public input order:
        // [nullifier, inputCommitment, outputCommitmentSwap, outputCommitmentChange, merkleRoot,
        //  outputAmountSwapPublic, minOutputAmountSwap, protocolFee, gasRefund]
        uint256[] memory arr = new uint256[](9);
        arr[0] = uint256(inputs.nullifier);
        arr[1] = uint256(inputs.inputCommitment);
        arr[2] = uint256(inputs.outputCommitmentSwap);
        arr[3] = uint256(inputs.outputCommitmentChange);
        arr[4] = uint256(inputs.merkleRoot);
        arr[5] = inputs.outputAmountSwap;
        arr[6] = inputs.minOutputAmountSwap;
        arr[7] = inputs.protocolFee;
        arr[8] = inputs.gasRefund;
        return arr;
    }
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}
