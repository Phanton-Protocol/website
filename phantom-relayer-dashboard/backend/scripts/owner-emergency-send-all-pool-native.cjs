#!/usr/bin/env node
/**
 * Calls ShieldedPoolUpgradeableReduced.emergencySendAllNativeBalance(to)
 * after the implementation has been upgraded to include that function.
 *
 * Env: RPC_URL, SHIELDED_POOL_ADDRESS, OWNER_PRIVATE_KEY (must match on-chain owner())
 */
const { ethers } = require("ethers");
require("dotenv").config();

const RPC_URL = String(process.env.RPC_URL || "").trim();
const POOL = String(process.env.SHIELDED_POOL_ADDRESS || "").trim();
const OWNER_PK = String(process.env.OWNER_PRIVATE_KEY || "").trim();
const TO = String(process.env.RECIPIENT || process.argv[2] || "").trim();

async function main() {
  if (!RPC_URL) throw new Error("RPC_URL");
  if (!POOL) throw new Error("SHIELDED_POOL_ADDRESS");
  if (!OWNER_PK) throw new Error("OWNER_PRIVATE_KEY");
  if (!TO || !ethers.isAddress(TO)) throw new Error("RECIPIENT or argv[1] must be a valid address");
  let pk = OWNER_PK;
  if (!pk.startsWith("0x") && /^[0-9a-fA-F]{64}$/i.test(pk)) pk = `0x${pk}`;

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(pk, provider);
  const pool = new ethers.Contract(
    POOL,
    [
      "function owner() view returns (address)",
      "function emergencySendAllNativeBalance(address payable to) external",
    ],
    signer
  );
  const o = await pool.owner();
  if (String(o).toLowerCase() !== signer.address.toLowerCase()) {
    throw new Error(`Signer ${signer.address} is not owner ${o}`);
  }
  const balBefore = await provider.getBalance(POOL);
  console.log("[drain] pool balance wei", balBefore.toString());
  const tx = await pool.emergencySendAllNativeBalance(ethers.getAddress(TO));
  console.log("[drain] tx", tx.hash);
  const rec = await tx.wait();
  console.log("[drain] block", rec?.blockNumber);
  const balAfter = await provider.getBalance(POOL);
  console.log("[drain] pool balance after wei", balAfter.toString());
}

main().catch((e) => {
  console.error("[drain] FAILED:", e?.reason || e?.shortMessage || e?.message || e);
  process.exit(1);
});
