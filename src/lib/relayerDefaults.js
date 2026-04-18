import { ethers } from "ethers";

/**
 * Default shadow sweep gas buffer — must match
 * `phantom-relayer-dashboard/backend/src/index.js` when `SHADOW_SWEEP_GAS_BUFFER_WEI` env is unset.
 */
export const SHADOW_SWEEP_GAS_BUFFER_WEI_DEFAULT = 2000000000000000n;

/** Normalize circuit/JSON nullifier (decimal string or 0x hex) to canonical lowercase bytes32 hex for EIP-712. */
export function nullifierToBytes32Hex(n) {
  if (n == null || n === "") throw new Error("nullifier is required");
  const s = String(n).trim();
  if (s.startsWith("0x") && s.length === 66) return s.toLowerCase();
  try {
    return ethers.zeroPadValue(ethers.toBeHex(BigInt(s)), 32);
  } catch {
    throw new Error("Invalid nullifier format (expected hex bytes32 or decimal string)");
  }
}
