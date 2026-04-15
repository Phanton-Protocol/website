/**
 * Module 7 — refuse staging/production tier if ShieldedPool points at mock verifier/adaptor bytecode.
 */
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

function loadFingerprints() {
  const fpPath = path.join(__dirname, "..", "..", "..", "config", "module7-mock-bytecode-hashes.json");
  if (!fs.existsSync(fpPath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(fpPath, "utf8"));
  } catch (_) {
    return null;
  }
}

function tierRequiresNoMocks() {
  const t = String(process.env.PHANTOM_DEPLOYMENT_TIER || "").toLowerCase().trim();
  return t === "staging" || t === "production";
}

/**
 * When PHANTOM_DEPLOYMENT_TIER is staging|production, compares on-chain bytecode
 * of pool.verifier() and pool.swapAdaptor() against known Mock* fingerprints.
 */
async function assertNoMockRuntimeGate() {
  if (!tierRequiresNoMocks()) return;
  if (process.env.PHANTOM_SKIP_NO_MOCK_GATE === "true") {
    console.warn("[module7] PHANTOM_SKIP_NO_MOCK_GATE=true — skipping mock bytecode gate (not for production hosts)");
    return;
  }
  const rpc = String(process.env.RPC_URL || "").trim();
  const poolAddr = String(process.env.SHIELDED_POOL_ADDRESS || "").trim();
  if (!rpc || !poolAddr) {
    throw new Error(
      "PHANTOM_DEPLOYMENT_TIER=staging|production requires RPC_URL and SHIELDED_POOL_ADDRESS for mock gate"
    );
  }
  const fp = loadFingerprints();
  if (!fp?.mockVerifierBytecodeHash || !fp?.mockSwapAdaptorBytecodeHash) {
    throw new Error(
      "Missing config/module7-mock-bytecode-hashes.json — run: node Phantom-Smart-Contracts/scripts/compute-mock-bytecode-hashes.cjs"
    );
  }
  const provider = new ethers.JsonRpcProvider(rpc);
  const poolAbi = [
    "function verifier() view returns (address)",
    "function swapAdaptor() view returns (address)",
  ];
  const pool = new ethers.Contract(poolAddr, poolAbi, provider);
  const [verifierAddr, adaptorAddr] = await Promise.all([
    pool.verifier(),
    pool.swapAdaptor(),
  ]);
  const [codeV, codeS] = await Promise.all([
    provider.getCode(verifierAddr),
    provider.getCode(adaptorAddr),
  ]);
  if (!codeV || codeV === "0x" || !codeS || codeS === "0x") {
    throw new Error("[module7] verifier or swapAdaptor has empty bytecode");
  }
  const hv = ethers.keccak256(codeV);
  const hs = ethers.keccak256(codeS);
  if (hv === fp.mockVerifierBytecodeHash) {
    throw new Error(
      "[module7] ShieldedPool.verifier() bytecode matches MockVerifier — not allowed for PHANTOM_DEPLOYMENT_TIER=staging|production"
    );
  }
  if (hs === fp.mockSwapAdaptorBytecodeHash) {
    throw new Error(
      "[module7] ShieldedPool.swapAdaptor() bytecode matches MockSwapAdaptor — not allowed for PHANTOM_DEPLOYMENT_TIER=staging|production"
    );
  }
  console.log("[module7] No-mock runtime gate OK (verifier + swapAdaptor bytecode differs from Mock* fingerprints)");
}

module.exports = {
  assertNoMockRuntimeGate,
  tierRequiresNoMocks,
};
