/**
 * Compares runtime config vs canonical profile hints — warnings only, non-blocking.
 */
function computeCanonicalAlignmentWarnings(base) {
  const warnings = [];
  try {
    const hints = base?.canonicalProfile?.addressHints;
    if (!hints || typeof hints !== "object") return warnings;
    const a = base?.addresses || {};
    const pick = (k) => (a[k] || "").toString().toLowerCase();
    for (const [name, expected] of Object.entries(hints)) {
      const exp = (expected && String(expected).toLowerCase()) || "";
      if (!exp) continue;
      const got = pick(name) || pick(name.replace(/Address$/, "")) || "";
      if (got && exp !== got) {
        warnings.push(`${name}: runtime ${got} vs canonical hint ${exp}`);
      }
    }
  } catch (_) {
    /* ignore */
  }
  return warnings;
}

module.exports = { computeCanonicalAlignmentWarnings };
