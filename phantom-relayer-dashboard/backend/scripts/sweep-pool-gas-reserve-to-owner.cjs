#!/usr/bin/env node
/**
 * Owner-only: moves native BNB equal to `gasReserve()` (accounting bucket), not the full contract balance.
 *
 * Deposit fee split (Reduced pool): relayer cut → relayer; ~80% → FeeDistributor/stakers; remainder
 * increments `gasReserve`. The $2 fee is not a single lump "left in the pool for owner" — most legs
 * leave the pool immediately. This script only sweeps what was booked into `gasReserve` (e.g. relayer
 * gas coverage). If `gasReserve` is 0, the sweep moves nothing even if `address(this).balance` is high
 * (that balance backs shielded notes).
 *
 * Requires `ShieldedPoolUpgradeableReduced.sweepGasReserveNative` on the deployed bytecode.
 *
 * Env:
 *   RPC_URL                 — BSC testnet/mainnet JSON-RPC
 *   SHIELDED_POOL_ADDRESS   — proxy address
 *   OWNER_PRIVATE_KEY       — pool owner (Ownable)
 *   SWEEP_TO_ADDRESS         — optional; defaults to owner EOA
 *   SWEEP_MAX_WEI           — optional cap; default 0 = sweep entire gasReserve
 *
 *   node scripts/sweep-pool-gas-reserve-to-owner.cjs
 */
const { ethers } = require("ethers");

const RPC_URL = String(process.env.RPC_URL || "").trim();
const POOL = String(process.env.SHIELDED_POOL_ADDRESS || "").trim();
const OWNER_PK = String(process.env.OWNER_PRIVATE_KEY || "").trim();
const SWEEP_TO = String(process.env.SWEEP_TO_ADDRESS || "").trim();
const MAX_WEI_RAW = process.env.SWEEP_MAX_WEI;

async function main() {
  if (!RPC_URL) throw new Error("RPC_URL required");
  if (!POOL) throw new Error("SHIELDED_POOL_ADDRESS required");
  if (!OWNER_PK) throw new Error("OWNER_PRIVATE_KEY required");
  let pk = OWNER_PK;
  if (!pk.startsWith("0x") && /^[0-9a-fA-F]{64}$/i.test(pk)) pk = `0x${pk}`;

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const owner = new ethers.Wallet(pk, provider);
  const to = SWEEP_TO ? ethers.getAddress(SWEEP_TO) : owner.address;

  const pool = new ethers.Contract(
    POOL,
    [
      "function gasReserve() view returns (uint256)",
      "function owner() view returns (address)",
      "function sweepGasReserveNative(address payable to, uint256 maxWei) external",
    ],
    owner
  );

  const [gr, o] = await Promise.all([pool.gasReserve(), pool.owner()]);
  console.log("[sweep] pool gasReserve (wei)", gr.toString());
  console.log("[sweep] on-chain owner", o);
  if (String(o).toLowerCase() !== owner.address.toLowerCase()) {
    throw new Error("OWNER_PRIVATE_KEY does not match pool owner()");
  }

  const maxWei =
    MAX_WEI_RAW != null && String(MAX_WEI_RAW).trim() !== "" ? BigInt(String(MAX_WEI_RAW).trim()) : 0n;
  const bal = await provider.getBalance(POOL);
  console.log("[sweep] pool native balance (wei)", bal.toString());

  const tx = await pool.sweepGasReserveNative(to, maxWei);
  console.log("[sweep] tx", tx.hash);
  const receipt = await tx.wait();
  console.log("[sweep] confirmed block", receipt?.blockNumber, "to", to);
}

main().catch((e) => {
  console.error("[sweep] FAILED:", e?.reason || e?.shortMessage || e?.message || e);
  process.exit(1);
});
