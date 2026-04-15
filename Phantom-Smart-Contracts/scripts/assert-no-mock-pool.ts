/**
 * Module 7 — On-chain check: ShieldedPool verifier + swapAdaptor bytecode must not match Mock* fingerprints.
 *
 * Usage (from Phantom-Smart-Contracts):
 *   SHIELDED_POOL_ADDRESS=0x... HH_FULL=1 npx hardhat run scripts/assert-no-mock-pool.ts --network bscTestnet
 */
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

async function main() {
  const poolAddr = String(process.env.SHIELDED_POOL_ADDRESS || "").trim();
  if (!poolAddr) {
    throw new Error("Set SHIELDED_POOL_ADDRESS");
  }
  const fpPath = path.join(__dirname, "..", "..", "config", "module7-mock-bytecode-hashes.json");
  if (!fs.existsSync(fpPath)) {
    throw new Error(`Missing ${fpPath} — run: node scripts/compute-mock-bytecode-hashes.cjs`);
  }
  const fp = JSON.parse(fs.readFileSync(fpPath, "utf8"));
  const { ethers } = hre;
  const provider = ethers.provider;
  const pool = await ethers.getContractAt(
    [
      "function verifier() view returns (address)",
      "function swapAdaptor() view returns (address)",
    ],
    poolAddr
  );
  const [v, s] = await Promise.all([pool.verifier(), pool.swapAdaptor()]);
  const [codeV, codeS] = await Promise.all([provider.getCode(v), provider.getCode(s)]);
  if (!codeV || codeV === "0x" || !codeS || codeS === "0x") {
    throw new Error("Empty bytecode for verifier or swapAdaptor");
  }
  const hv = ethers.keccak256(codeV);
  const hs = ethers.keccak256(codeS);
  if (hv === fp.mockVerifierBytecodeHash) {
    throw new Error("verifier() is MockVerifier bytecode — forbidden for this check");
  }
  if (hs === fp.mockSwapAdaptorBytecodeHash) {
    throw new Error("swapAdaptor() is MockSwapAdaptor bytecode — forbidden for this check");
  }
  console.log("assert-no-mock-pool: OK (verifier + swapAdaptor are not Mock* bytecode)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
