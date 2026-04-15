#!/usr/bin/env node
require("dotenv").config();
const { ethers } = require("ethers");
const { buildMerklePath, verifyMerklePath } = require("../src/merkle10");

async function main() {
  const rpc = process.env.RPC_URL;
  const pool = process.env.SHIELDED_POOL_ADDRESS;
  const commitmentArg = process.argv[2];
  if (!rpc || !pool) {
    throw new Error("Set RPC_URL and SHIELDED_POOL_ADDRESS in env");
  }
  if (!commitmentArg) {
    throw new Error("Usage: node scripts/module3-merkle-selfcheck.cjs <commitmentHex>");
  }

  const provider = new ethers.JsonRpcProvider(rpc);
  const abi = [
    "function commitmentCount() view returns (uint256)",
    "function commitments(uint256) view returns (bytes32)",
    "function merkleRoot() view returns (bytes32)"
  ];
  const contract = new ethers.Contract(pool, abi, provider);
  const count = Number(await contract.commitmentCount());
  const commitments = [];
  for (let i = 0; i < count; i += 1) commitments.push(await contract.commitments(i));
  const index = commitments.findIndex((c) => String(c).toLowerCase() === commitmentArg.toLowerCase());
  if (index < 0) {
    throw new Error(`Commitment not found on-chain: ${commitmentArg}`);
  }
  const onChainRoot = await contract.merkleRoot();
  const { path, indices, root } = buildMerklePath(commitments, index);
  const ok = verifyMerklePath(commitmentArg, path, indices, onChainRoot);

  console.log(JSON.stringify({
    commitment: commitmentArg,
    index,
    localRoot: root,
    onChainRoot,
    verified: ok,
    path,
    indices,
  }, null, 2));

  if (!ok) process.exit(2);
}

main().catch((err) => {
  console.error("[module3-merkle-selfcheck] ERROR:", err.message);
  process.exit(1);
});
