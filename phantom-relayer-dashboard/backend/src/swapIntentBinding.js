/**
 * M4 — bind signed swap intent to join-split public inputs (nullifier must match).
 */
function assertIntentNullifierMatchesSwapPublicInputs(intent, publicInputs) {
  const a = String(intent?.nullifier ?? "").toLowerCase();
  const b = String(publicInputs?.nullifier ?? "").toLowerCase();
  if (!b) {
    const err = new Error("swap publicInputs.nullifier is required");
    err.status = 400;
    throw err;
  }
  if (a !== b) {
    const err = new Error("Intent nullifier must match swap publicInputs.nullifier");
    err.status = 400;
    throw err;
  }
}

module.exports = { assertIntentNullifierMatchesSwapPublicInputs };
