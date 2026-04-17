// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @notice Minimal Chainlink-style feed for Hardhat tests (BNB/USD, etc.).
 */
contract MockChainlinkAggregator {
    int256 public answer;
    uint8 public constant decimals = 8;
    uint256 public constant updatedAt = type(uint256).max;

    constructor(int256 _answer) {
        answer = _answer;
    }

    function setAnswer(int256 _answer) external {
        answer = _answer;
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 ans, uint256 startedAt, uint256 upd, uint80 answeredInRound)
    {
        return (1, answer, 0, block.timestamp, 1);
    }
}
