/**
 * M4 — bind signed swap intent to join-split public inputs (nullifier must match).
 */
const { ethers } = require("ethers");

/** Same value as frontend `nullifierToBytes32Hex`: hex bytes32 or decimal field element string. */
function canonicalNullifierHex(n) {
  if (n == null || n === "") return "";
  const s = String(n).trim();
  try {
    const bi = BigInt(s.startsWith("0x") || s.startsWith("0X") ? s : s);
    return ethers.zeroPadValue(ethers.toBeHex(bi), 32).toLowerCase();
  } catch {
    return "";
  }
}

function assertIntentNullifierMatchesSwapPublicInputs(intent, publicInputs) {
  const a = canonicalNullifierHex(intent?.nullifier);
  const b = canonicalNullifierHex(publicInputs?.nullifier);
  if (!b) {
    const err = new Error("swap publicInputs.nullifier is required");
    err.status = 400;
    throw err;
  }
  if (!a) {
    const err = new Error("Intent nullifier is required");
    err.status = 400;
    throw err;
  }
  if (a !== b) {
    const err = new Error("Intent nullifier must match swap publicInputs.nullifier");
    err.status = 400;
    throw err;
  }
}

module.exports = { assertIntentNullifierMatchesSwapPublicInputs, canonicalNullifierHex };
