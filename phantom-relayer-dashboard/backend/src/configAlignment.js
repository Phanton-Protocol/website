const { ethers } = require("ethers");

function normalizeAddressForCompare(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (!s) return null;
  try {
    return ethers.getAddress(s);
  } catch {
    return s.toLowerCase();
  }
}

function computeCanonicalAlignmentWarnings(cfg) {
  const warnings = [];
  const cp = cfg.canonicalProfile;
  if (cp?.chainId != null && Number.isFinite(Number(cp.chainId)) && Number(cp.chainId) !== Number(cfg.chainId)) {
    warnings.push(
      `CHAIN_ID ${cfg.chainId} does not match canonical profile "${cp.id}" (expected chainId ${cp.chainId})`
    );
  }
  if (cp?.addressHints && typeof cp.addressHints === "object") {
    const hints = cp.addressHints;
    const keys = [
      ["shieldedPool", "shieldedPool"],
      ["swapAdaptor", "swapAdaptor"],
      ["feeOracle", "feeOracle"],
      ["relayerStaking", "relayerStaking"],
    ];
    for (const [hintKey, runtimeKey] of keys) {
      const expected = hints[hintKey];
      const actual = cfg.addresses?.[runtimeKey];
      const e = normalizeAddressForCompare(expected);
      const a = normalizeAddressForCompare(actual);
      if (!e) continue;
      if (!a) {
        warnings.push(`canonical profile "${cp.id}" lists ${hintKey} but runtime ${runtimeKey} is unset`);
        continue;
      }
      if (e !== a) {
        warnings.push(`runtime ${runtimeKey} (${actual}) differs from canonical profile "${cp.id}" (${expected})`);
      }
    }
  }
  return warnings;
}

module.exports = {
  normalizeAddressForCompare,
  computeCanonicalAlignmentWarnings,
};
