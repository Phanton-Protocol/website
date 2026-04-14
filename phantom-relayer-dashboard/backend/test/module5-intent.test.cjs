const test = require("node:test");
const assert = require("node:assert/strict");
const { ethers } = require("ethers");

const INTENT_TYPES = {
  SwapIntent: [
    { name: "user", type: "address" },
    { name: "inputAssetID", type: "uint256" },
    { name: "outputAssetID", type: "uint256" },
    { name: "amountIn", type: "uint256" },
    { name: "minAmountOut", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
    { name: "nullifier", type: "bytes32" },
  ],
};

test("module5 typed intent signs and verifies expected fields", async () => {
  const wallet = ethers.Wallet.createRandom();
  const domain = {
    name: "ShadowDeFiRelayer",
    version: "1",
    chainId: 97,
    verifyingContract: "0x0000000000000000000000000000000000000001",
  };
  const intent = {
    user: wallet.address,
    inputAssetID: 1n,
    outputAssetID: 2n,
    amountIn: 1000n,
    minAmountOut: 900n,
    deadline: 1234567890n,
    nonce: 7n,
    nullifier: "0x" + "11".repeat(32),
  };
  const sig = await wallet.signTypedData(domain, INTENT_TYPES, intent);
  const recovered = ethers.verifyTypedData(domain, INTENT_TYPES, intent, sig);
  assert.equal(recovered.toLowerCase(), wallet.address.toLowerCase());
});

test("module5 minOut formula applies slippage bps", () => {
  const out = 2500000000000000000n;
  const slippageBps = 100; // 1%
  const minOut = (out * BigInt(10000 - slippageBps)) / 10000n;
  assert.equal(minOut.toString(), "2475000000000000000");
});

