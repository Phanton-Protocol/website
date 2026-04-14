const { test } = require("node:test");
const assert = require("node:assert/strict");
const {
  normalizeAddressForCompare,
  computeCanonicalAlignmentWarnings,
} = require("../src/configAlignment");

test("normalizeAddressForCompare checksums valid address", () => {
  const a = "0x6ea27b17d99b6c6d201afe3f85d08d84093c0d6d";
  const n = normalizeAddressForCompare(a);
  assert.ok(n && n.startsWith("0x"));
  assert.match(n, /^0x[0-9a-fA-F]{40}$/);
});

test("computeCanonicalAlignmentWarnings empty when aligned", () => {
  const pool = "0x6ea27B17D99B6c6D201aFE3F85D08d84093C0D6D";
  const w = computeCanonicalAlignmentWarnings({
    chainId: 97,
    canonicalProfile: {
      id: "bscTestnet",
      chainId: 97,
      addressHints: { shieldedPool: pool },
    },
    addresses: { shieldedPool: pool },
  });
  assert.deepEqual(w, []);
});

test("computeCanonicalAlignmentWarnings detects pool mismatch", () => {
  const w = computeCanonicalAlignmentWarnings({
    chainId: 97,
    canonicalProfile: {
      id: "bscTestnet",
      chainId: 97,
      addressHints: { shieldedPool: "0xC6bdf5858e8D4C2fad09d0CA3cE356B2ace0ec99" },
    },
    addresses: { shieldedPool: "0x6ea27B17D99B6c6D201aFE3F85D08d84093C0D6D" },
  });
  assert.ok(w.some((x) => x.includes("shieldedPool")));
});

test("computeCanonicalAlignmentWarnings detects chainId mismatch", () => {
  const w = computeCanonicalAlignmentWarnings({
    chainId: 56,
    canonicalProfile: { id: "bscTestnet", chainId: 97, addressHints: {} },
    addresses: {},
  });
  assert.ok(w.some((x) => x.includes("CHAIN_ID")));
});

test("computeCanonicalAlignmentWarnings missing runtime address", () => {
  const w = computeCanonicalAlignmentWarnings({
    chainId: 97,
    canonicalProfile: {
      id: "bscTestnet",
      chainId: 97,
      addressHints: { shieldedPool: "0xC6bdf5858e8D4C2fad09d0CA3cE356B2ace0ec99" },
    },
    addresses: { shieldedPool: null },
  });
  assert.ok(w.some((x) => x.includes("unset")));
});
