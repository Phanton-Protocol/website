// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../interfaces/IPancakeSwapAdaptor.sol";
import "../types/Types.sol";

/**
 * @title FixedRateSwapAdaptor
 * @notice Internal swap contract with configurable fixed rates - no external DEX dependency
 * @dev For testnet: set rates, fund with tokens, swap without PancakeSwap liquidity
 * @dev Implements same interface as PancakeSwapAdaptor - drop-in replacement
 */
contract FixedRateSwapAdaptor is IPancakeSwapAdaptor, ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public owner;
    address public wbnb;

    // (tokenIn, tokenOut) => rate: output amount per 1e18 input
    // e.g. BNB->BUSD: 600e18 means 1 BNB = 600 BUSD
    mapping(address => mapping(address => uint256)) public rates;

    // tokenIn = address(0) for BNB
    mapping(address => mapping(address => bool)) public rateConfigured;

    event RateSet(address indexed tokenIn, address indexed tokenOut, uint256 rate);
    event SwapExecuted(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event Withdrawn(address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "FixedRateSwapAdaptor: not owner");
        _;
    }

    constructor(address _wbnb) {
        owner = msg.sender;
        wbnb = _wbnb;
    }

    /**
     * @notice Set fixed rate for a token pair
     * @param tokenIn Input token (address(0) for BNB)
     * @param tokenOut Output token (address(0) for BNB output - contract must hold BNB)
     * @param rate Output amount per 1e18 input (e.g. 600e18 = 600 BUSD per 1 BNB)
     */
    function setRate(address tokenIn, address tokenOut, uint256 rate) external onlyOwner {
        rates[tokenIn][tokenOut] = rate;
        rateConfigured[tokenIn][tokenOut] = true;
        emit RateSet(tokenIn, tokenOut, rate);
    }

    /**
     * @notice Set multiple rates at once
     */
    function setRates(
        address[] calldata tokensIn,
        address[] calldata tokensOut,
        uint256[] calldata rates_
    ) external onlyOwner {
        require(tokensIn.length == tokensOut.length && tokensOut.length == rates_.length, "FixedRateSwapAdaptor: length mismatch");
        for (uint256 i = 0; i < tokensIn.length; i++) {
            rates[tokensIn[i]][tokensOut[i]] = rates_[i];
            rateConfigured[tokensIn[i]][tokensOut[i]] = true;
            emit RateSet(tokensIn[i], tokensOut[i], rates_[i]);
        }
    }

    /**
     * @notice Execute swap at fixed rate
     * @dev Pool sends tokenIn (or BNB), receives tokenOut (or BNB via WBNB)
     * @dev For BNB output: use tokenOut = wbnb (pool receives WBNB)
     */
    function executeSwap(SwapParams calldata swapParams) external payable override nonReentrant returns (uint256 amountOut) {
        require(swapParams.amountIn > 0, "FixedRateSwapAdaptor: zero amount");
        uint256 rate = rates[swapParams.tokenIn][swapParams.tokenOut];
        require(rateConfigured[swapParams.tokenIn][swapParams.tokenOut], "FixedRateSwapAdaptor: rate not set");

        // amountOut = amountIn * rate / 1e18
        amountOut = (swapParams.amountIn * rate) / 1e18;
        require(amountOut >= swapParams.minAmountOut, "FixedRateSwapAdaptor: slippage");

        // Pull input
        if (swapParams.tokenIn == address(0)) {
            require(msg.value >= swapParams.amountIn, "FixedRateSwapAdaptor: insufficient BNB");
            if (msg.value > swapParams.amountIn) {
                (bool ok,) = msg.sender.call{value: msg.value - swapParams.amountIn}("");
                require(ok, "FixedRateSwapAdaptor: BNB refund failed");
            }
        } else {
            IERC20(swapParams.tokenIn).safeTransferFrom(msg.sender, address(this), swapParams.amountIn);
        }

        // Send output to pool (msg.sender)
        if (swapParams.tokenOut == address(0)) {
            require(address(this).balance >= amountOut, "FixedRateSwapAdaptor: insufficient BNB balance");
            (bool ok,) = msg.sender.call{value: amountOut}("");
            require(ok, "FixedRateSwapAdaptor: BNB send failed");
        } else {
            IERC20(swapParams.tokenOut).safeTransfer(msg.sender, amountOut);
        }

        emit SwapExecuted(swapParams.tokenIn, swapParams.tokenOut, swapParams.amountIn, amountOut);
    }

    /**
     * @notice Get expected output for a swap
     */
    function getExpectedOutput(SwapParams calldata swapParams) external view override returns (uint256) {
        uint256 rate = rates[swapParams.tokenIn][swapParams.tokenOut];
        if (!rateConfigured[swapParams.tokenIn][swapParams.tokenOut]) return 0;
        return (swapParams.amountIn * rate) / 1e18;
    }

    /**
     * @notice Fund the adaptor with tokens (owner or anyone can fund)
     */
    function fund(address token, uint256 amount) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice Withdraw tokens (owner only)
     */
    function withdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool ok,) = msg.sender.call{value: amount}("");
            require(ok, "FixedRateSwapAdaptor: BNB withdraw failed");
        } else {
            IERC20(token).safeTransfer(msg.sender, amount);
        }
        emit Withdrawn(token, amount);
    }

    receive() external payable {}
}
