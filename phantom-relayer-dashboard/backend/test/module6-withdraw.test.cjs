const test = require("node:test");
const assert = require("node:assert/strict");
const { ethers } = require("ethers");
const { assertWithdrawJoinSplitPublicInputs } = require("../src/withdrawValidate");

function pi(overrides = {}) {
  return {
    outputCommitmentSwap: ethers.ZeroHash,
    outputAssetIDSwap: 0,
    outputAmountSwap: "0",
    minOutputAmountSwap: "0",
    inputAmount: "1000",
    swapAmount: "600",
    changeAmount: "300",
    protocolFee: "80",
    gasRefund: "20",
    ...overrides,
  };
}

test("withdraw public inputs: valid conservation and zero swap leg", () => {
  assert.doesNotThrow(() => assertWithdrawJoinSplitPublicInputs(pi()));
});

test("withdraw public inputs: rejects non-zero outputCommitmentSwap", () => {
  assert.throws(
    () => assertWithdrawJoinSplitPublicInputs(pi({ outputCommitmentSwap: ethers.hexlify(ethers.randomBytes(32)) })),
    /withdraw_outputCommitmentSwap_must_be_zero/
  );
});

test("withdraw public inputs: rejects non-zero swap amounts", () => {
  assert.throws(
    () => assertWithdrawJoinSplitPublicInputs(pi({ outputAmountSwap: "1" })),
    /withdraw_swap_public_amounts_must_be_zero/
  );
});

test("withdraw public inputs: rejects conservation mismatch", () => {
  assert.throws(
    () => assertWithdrawJoinSplitPublicInputs(pi({ changeAmount: "299" })),
    /withdraw_conservation_failed/
  );
});

test("withdraw public inputs: rejects zero change", () => {
  assert.throws(
    () =>
      assertWithdrawJoinSplitPublicInputs(
        pi({ changeAmount: "0", swapAmount: "900", inputAmount: "1000" })
      ),
    /withdraw_changeAmount_must_be_positive/
  );
});

test("withdraw public inputs: rejects zero withdraw leg (swapAmount)", () => {
  assert.throws(
    () =>
      assertWithdrawJoinSplitPublicInputs(
        pi({ swapAmount: "0", changeAmount: "900", inputAmount: "1000" })
      ),
    /withdraw_swapAmount_withdraw_leg_must_be_positive/
  );
});
