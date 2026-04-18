const test = require("node:test");
const assert = require("node:assert/strict");
const { assertIntentNullifierMatchesSwapPublicInputs } = require("../src/swapIntentBinding");

test("M4 intent nullifier must match publicInputs.nullifier (400 on mismatch)", () => {
  const intent = { nullifier: "0x" + "aa".repeat(32) };
  const okPi = { nullifier: "0x" + "aa".repeat(32) };
  assert.doesNotThrow(() => assertIntentNullifierMatchesSwapPublicInputs(intent, okPi));

  const badPi = { nullifier: "0x" + "bb".repeat(32) };
  assert.throws(
    () => assertIntentNullifierMatchesSwapPublicInputs(intent, badPi),
    (e) => e.status === 400 && String(e.message).includes("nullifier")
  );

  assert.throws(
    () => assertIntentNullifierMatchesSwapPublicInputs(intent, {}),
    (e) => e.status === 400 && String(e.message).includes("required")
  );
});

test("M4 nullifier comparison is case-insensitive for hex", () => {
  const intent = { nullifier: "0x" + "aa".repeat(32) };
  const pi = { nullifier: ("0x" + "aa".repeat(32)).toUpperCase() };
  assert.doesNotThrow(() => assertIntentNullifierMatchesSwapPublicInputs(intent, pi));
});
