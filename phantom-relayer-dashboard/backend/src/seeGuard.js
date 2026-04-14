const crypto = require("crypto");

const SEE_MODE = String(process.env.SEE_MODE || "disabled").toLowerCase();
const SEE_SHARED_SECRET = String(process.env.SEE_SHARED_SECRET || "");
const SEE_ALLOWED_MEASUREMENTS = String(process.env.SEE_ALLOWED_MEASUREMENTS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const SEE_MAX_CLOCK_SKEW_SEC = Number(process.env.SEE_MAX_CLOCK_SKEW_SEC || 60);

function timingSafeEqualHex(a, b) {
  try {
    const ab = Buffer.from(String(a || "").replace(/^0x/, ""), "hex");
    const bb = Buffer.from(String(b || "").replace(/^0x/, ""), "hex");
    if (ab.length === 0 || bb.length === 0 || ab.length !== bb.length) return false;
    return crypto.timingSafeEqual(ab, bb);
  } catch (_) {
    return false;
  }
}

function signAttestationPayload(payload) {
  if (!SEE_SHARED_SECRET) throw new Error("SEE_SHARED_SECRET not configured");
  const h = crypto.createHmac("sha256", SEE_SHARED_SECRET);
  h.update(payload);
  return h.digest("hex");
}

function parseAttestation(req) {
  const doc = String(req.headers["x-see-attestation-doc"] || "");
  const sig = String(req.headers["x-see-attestation-sig"] || "");
  if (!doc || !sig) {
    return { ok: false, error: "missing_attestation_headers" };
  }
  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(doc, "base64").toString("utf8"));
  } catch (_) {
    return { ok: false, error: "invalid_attestation_doc_encoding" };
  }
  return { ok: true, doc: parsed, sig, rawDoc: doc };
}

function verifyAttestation(req) {
  if (SEE_MODE === "disabled") return { ok: true, mode: SEE_MODE };
  if (SEE_MODE === "mock") return { ok: true, mode: SEE_MODE };

  const parsed = parseAttestation(req);
  if (!parsed.ok) return parsed;

  const expectedSig = signAttestationPayload(parsed.rawDoc);
  if (!timingSafeEqualHex(parsed.sig, expectedSig)) {
    return { ok: false, error: "invalid_attestation_signature" };
  }

  const ts = Number(parsed.doc?.timestamp || 0);
  if (!Number.isFinite(ts) || ts <= 0) {
    return { ok: false, error: "invalid_attestation_timestamp" };
  }
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > SEE_MAX_CLOCK_SKEW_SEC) {
    return { ok: false, error: "attestation_timestamp_out_of_window" };
  }

  const measurement = String(parsed.doc?.measurement || "").trim();
  if (!measurement) return { ok: false, error: "missing_attestation_measurement" };
  if (SEE_ALLOWED_MEASUREMENTS.length && !SEE_ALLOWED_MEASUREMENTS.includes(measurement)) {
    return { ok: false, error: "attestation_measurement_not_allowed" };
  }

  return { ok: true, mode: SEE_MODE, measurement };
}

function requireSeeForSensitiveFlow(req, res, next) {
  const out = verifyAttestation(req);
  if (!out.ok) {
    return res.status(401).json({ error: "see_attestation_required", detail: out.error });
  }
  req.see = out;
  return next();
}

function getSeeConfig() {
  return {
    mode: SEE_MODE,
    measurementAllowlistSize: SEE_ALLOWED_MEASUREMENTS.length,
    maxClockSkewSec: SEE_MAX_CLOCK_SKEW_SEC,
    configured: SEE_MODE === "disabled" ? true : !!SEE_SHARED_SECRET,
  };
}

module.exports = {
  getSeeConfig,
  verifyAttestation,
  requireSeeForSensitiveFlow,
};
