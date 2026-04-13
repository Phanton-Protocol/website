/**
 * SEE (Secure Execution Environment) attestation gate — local dev default: disabled.
 * When SEE_MODE=disabled, sensitive routes proceed without attestation checks.
 */
function getSeeConfig() {
  const mode = String(process.env.SEE_MODE || "disabled").toLowerCase();
  return {
    mode,
    enabled: mode !== "disabled",
    requiresAttestation: mode !== "disabled",
  };
}

function verifyAttestation(req) {
  const mode = String(process.env.SEE_MODE || "disabled").toLowerCase();
  if (mode === "disabled") {
    return { ok: true, skipped: true, message: "SEE_MODE disabled" };
  }
  const header = req.headers["x-see-attestation"] || req.body?.seeAttestation;
  if (!header) {
    return { ok: false, error: "missing_attestation" };
  }
  return { ok: true, message: "attestation_present_stub" };
}

function requireSeeForSensitiveFlow(req, res, next) {
  const mode = String(process.env.SEE_MODE || "disabled").toLowerCase();
  if (mode === "disabled") return next();
  const result = verifyAttestation(req);
  if (!result.ok) {
    return res.status(401).json({ error: "see_attestation_required", detail: result });
  }
  return next();
}

module.exports = {
  getSeeConfig,
  verifyAttestation,
  requireSeeForSensitiveFlow,
};
