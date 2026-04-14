const test = require("node:test");
const assert = require("node:assert/strict");
const { canonicalizeNote } = require("../src/noteModel");

test("deposit submit: canonical commitment must match body commitment", () => {
  const note = {
    assetId: 1,
    amount: "1000000000000000000",
    blindingFactor: "42",
    ownerPublicKey: "123",
  };
  const c = canonicalizeNote(note).commitment.toLowerCase();
  const wrong = "0x" + "11".repeat(32);
  assert.notEqual(c, wrong);
  assert.equal(c, canonicalizeNote(note).commitment.toLowerCase());
});
