const test = require("node:test");
const assert = require("node:assert/strict");
const { canonicalizeNote, computeCommitment } = require("../src/noteModel");
const { buildMerklePath, verifyMerklePath } = require("../src/merkle10");

test("canonical note schema computes deterministic MiMC commitment", () => {
  const note = canonicalizeNote({
    assetId: 1,
    amount: "7000000000000000000",
    blindingFactor: "123456789",
    ownerPublicKey: "999",
  });
  const expected = computeCommitment(1, "7000000000000000000", "123456789", "999");
  assert.equal(note.schema, "note.v1");
  assert.equal(note.commitment, `0x${expected.toString(16).padStart(64, "0")}`);
});

test("depth-10 Merkle path verifies for target leaf", () => {
  const commitments = [
    "0x01",
    "0x02",
    "0x03",
    "0x04",
    "0x05",
  ];
  const idx = 2;
  const { path, indices, root } = buildMerklePath(commitments, idx);
  assert.equal(path.length, 10);
  assert.equal(indices.length, 10);
  assert.equal(verifyMerklePath(commitments[idx], path, indices, root), true);
  assert.equal(verifyMerklePath(commitments[idx], path, indices, "0x" + "00".repeat(32)), false);
});
