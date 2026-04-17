const fs = require("fs");
const path = require("path");
const os = require("os");
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mimc7, FIELD } = require("../src/mimc7");

const coreRoot = path.join(__dirname, "..", "..", "..");
const wasmPath = path.join(
  coreRoot,
  "Phantom-Smart-Contracts",
  "circuits",
  "joinsplit_public9",
  "build",
  "joinsplit_public9_js",
  "joinsplit_public9.wasm"
);
const zkeyPath = path.join(coreRoot, "Phantom-Smart-Contracts", "circuits", "joinsplit_public9", "circuit_final.zkey");

function loadZkProofs(bypassTrue) {
  process.env.DEV_BYPASS_PROOFS = bypassTrue ? "true" : "false";
  const resolved = require.resolve("../src/zkProofs.js");
  delete require.cache[resolved];
  return require("../src/zkProofs.js");
}

function noteCommitment(assetID, amount, blinding, ownerPk) {
  const h1 = mimc7(BigInt(assetID), BigInt(amount));
  const h2 = mimc7(h1, BigInt(blinding));
  return mimc7(h2, BigInt(ownerPk));
}

function noteNullifier(commitment, ownerPk) {
  return mimc7(BigInt(commitment), BigInt(ownerPk));
}

function rollupJoinSplitMerkleRoot(leafStr, pathVals, pathIdx) {
  const fieldAdd = (a, b) => (a + b) % FIELD;
  const fieldSub = (a, b) => {
    const r = (a - b) % FIELD;
    return r < 0n ? r + FIELD : r;
  };
  const fieldMul = (a, b) => (a * b) % FIELD;
  let computedRoot = BigInt(leafStr);
  for (let i = 0; i < 10; i++) {
    const pathValue = BigInt(pathVals[i]);
    const idx = BigInt(pathIdx[i]);
    const leftDiff = fieldSub(pathValue, computedRoot);
    const left = fieldAdd(computedRoot, fieldMul(idx, leftDiff));
    const rightDiff = fieldSub(computedRoot, pathValue);
    const right = fieldAdd(pathValue, fieldMul(idx, rightDiff));
    computedRoot = mimc7(left, right);
  }
  return computedRoot.toString();
}

function consistentSwapFixture() {
  const ownerPk = "67890";
  const inputCommitment = noteCommitment(1, "1000", "12345", ownerPk);
  const nullifier = noteNullifier(inputCommitment, ownerPk);
  const outputCommitmentSwap = noteCommitment(2, "500", "111", ownerPk);
  const outputCommitmentChange = noteCommitment(1, "500", "222", ownerPk);
  const merklePath = Array(10).fill("0");
  const merklePathIndices = Array(10).fill("0");
  const merkleRoot = rollupJoinSplitMerkleRoot(inputCommitment.toString(), merklePath, merklePathIndices);
  return {
    inputNote: {
      assetID: 1,
      amount: "1000",
      blindingFactor: "12345",
      ownerPublicKey: ownerPk,
      nullifier: nullifier.toString(),
      commitment: inputCommitment.toString(),
    },
    outputNoteSwap: {
      assetID: 2,
      amount: "500",
      blindingFactor: "111",
      commitment: outputCommitmentSwap.toString(),
    },
    outputNoteChange: {
      assetID: 1,
      amount: "500",
      blindingFactor: "222",
      commitment: outputCommitmentChange.toString(),
    },
    merkleRoot,
    merklePath,
    merklePathIndices,
    swapAmount: "500",
    minOutputAmount: "1",
    protocolFee: "0",
    gasRefund: "0",
  };
}

test("Groth16 swap proof: full prove when joinsplit.wasm and .zkey exist", async (t) => {
  if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
    t.skip(`Build circuits into phantom-relayer-dashboard/circuits/ (missing wasm or zkey)`);
    return;
  }
  process.env.PROVER_WASM = wasmPath;
  process.env.PROVER_ZKEY = zkeyPath;
  const { generateSwapProof } = loadZkProofs(false);
  const out = await generateSwapProof(consistentSwapFixture());
  assert.ok(out.proof?.a?.[0] !== undefined && out.proof?.a?.[0] !== "0");
  assert.ok(Number(out.generationTime) >= 0);
  assert.ok(Array.isArray(out.publicSignals) && out.publicSignals.length > 0);
});

test("swap proof with bypass off and missing wasm fails fast", async () => {
  const prevW = process.env.PROVER_WASM;
  const prevZ = process.env.PROVER_ZKEY;
  const ghost = path.join(os.tmpdir(), `no-joinsplit-${Date.now()}.wasm`);
  try {
    process.env.PROVER_WASM = ghost;
    process.env.PROVER_ZKEY = ghost;
    const { generateSwapProof } = loadZkProofs(false);
    await assert.rejects(async () => generateSwapProof(consistentSwapFixture()), (err) => {
      const msg = String(err?.message || err || "");
      return /ENOENT|no such file|Cannot|not found|Failed|wasm|zkey/i.test(msg);
    });
  } finally {
    if (prevW !== undefined) process.env.PROVER_WASM = prevW;
    else delete process.env.PROVER_WASM;
    if (prevZ !== undefined) process.env.PROVER_ZKEY = prevZ;
    else delete process.env.PROVER_ZKEY;
  }
});
