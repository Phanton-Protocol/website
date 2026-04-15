/**
 * Module 6 — withdraw public input checks aligned with ShieldedPool.shieldedWithdraw.
 */
const { ethers } = require("ethers");
const { toBigInt } = require("./utils/bigint");

function isZeroBytes32(v) {
  try {
    const h = ethers.zeroPadValue(ethers.toBeHex(toBigInt(v ?? 0)), 32);
    return h === ethers.ZeroHash;
  } catch {
    return false;
  }
}

/**
 * Validates JoinSplit public inputs for a pure withdrawal (no swap leg).
 * Contract: outputCommitmentSwap == 0, outputAssetIDSwap == 0, changeAmount > 0, swapAmount > 0,
 * inputAmount == swapAmount + changeAmount + protocolFee + gasRefund.
 */
function assertWithdrawJoinSplitPublicInputs(pi) {
  if (!pi || typeof pi !== "object") {
    const e = new Error("withdraw_missing_publicInputs");
    e.code = "WITHDRAW_INVALID";
    throw e;
  }
  if (!isZeroBytes32(pi.outputCommitmentSwap)) {
    const e = new Error("withdraw_outputCommitmentSwap_must_be_zero");
    e.code = "WITHDRAW_INVALID";
    throw e;
  }
  if (Number(pi.outputAssetIDSwap || 0) !== 0) {
    const e = new Error("withdraw_outputAssetIDSwap_must_be_zero");
    e.code = "WITHDRAW_INVALID";
    throw e;
  }
  if (toBigInt(pi.outputAmountSwap || 0) !== 0n || toBigInt(pi.minOutputAmountSwap || 0) !== 0n) {
    const e = new Error("withdraw_swap_public_amounts_must_be_zero");
    e.code = "WITHDRAW_INVALID";
    throw e;
  }
  const inputAmount = toBigInt(pi.inputAmount);
  const swapAmount = toBigInt(pi.swapAmount);
  const changeAmount = toBigInt(pi.changeAmount);
  const protocolFee = toBigInt(pi.protocolFee);
  const gasRefund = toBigInt(pi.gasRefund);
  if (changeAmount <= 0n) {
    const e = new Error("withdraw_changeAmount_must_be_positive");
    e.code = "WITHDRAW_INVALID";
    throw e;
  }
  if (swapAmount <= 0n) {
    const e = new Error("withdraw_swapAmount_withdraw_leg_must_be_positive");
    e.code = "WITHDRAW_INVALID";
    throw e;
  }
  const sum = swapAmount + changeAmount + protocolFee + gasRefund;
  if (inputAmount !== sum) {
    const e = new Error(
      `withdraw_conservation_failed: inputAmount ${inputAmount} != swap+change+fee+gas ${sum}`
    );
    e.code = "WITHDRAW_INVALID";
    throw e;
  }
}

module.exports = {
  assertWithdrawJoinSplitPublicInputs,
  isZeroBytes32,
};
