const test = require("node:test");
const assert = require("node:assert/strict");
const { ethers } = require("ethers");
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

test("M4 intent hex nullifier matches publicInputs decimal string (Groth16 public signal)", () => {
  const decimal =
    "700427445343598766604440790781851861374983566845719548140737867306945057016";
  const hex = ethers.zeroPadValue(ethers.toBeHex(BigInt(decimal)), 32);
  const intent = { nullifier: hex };
  const pi = { nullifier: decimal };
  assert.doesNotThrow(() => assertIntentNullifierMatchesSwapPublicInputs(intent, pi));
});
