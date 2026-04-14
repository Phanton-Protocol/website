const fs = require("fs");
const crypto = require("crypto");

function loadRawKeyMaterial() {
  const direct = (process.env.NOTES_ENCRYPTION_KEY_HEX || "").trim();
  if (direct) return direct;

  const keyFile = (process.env.NOTES_ENCRYPTION_KEY_FILE || "").trim();
  if (keyFile && fs.existsSync(keyFile)) {
    return fs.readFileSync(keyFile, "utf8").trim();
  }
  return "";
}

function getNotesEncryptionKey() {
  const raw = loadRawKeyMaterial();
  if (!raw) {
    throw new Error(
      "Notes encryption key missing. Set NOTES_ENCRYPTION_KEY_HEX (32-byte hex) or NOTES_ENCRYPTION_KEY_FILE."
    );
  }

  const normalized = raw.startsWith("0x") ? raw.slice(2) : raw;
  if (!/^[0-9a-fA-F]{64}$/.test(normalized)) {
    throw new Error("Invalid notes encryption key. Expected 32-byte hex (64 chars).");
  }
  return Buffer.from(normalized, "hex");
}

function encryptJsonAtRest(obj) {
  const key = getNotesEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({
    v: 1,
    alg: "AES-256-GCM",
    iv: iv.toString("base64"),
    tag: tag.toString("base64"),
    ct: ciphertext.toString("base64"),
  });
}

function decryptJsonAtRest(payload) {
  const key = getNotesEncryptionKey();
  const parsed = typeof payload === "string" ? JSON.parse(payload) : payload;
  if (!parsed || parsed.v !== 1 || parsed.alg !== "AES-256-GCM") {
    throw new Error("Unsupported encrypted payload format");
  }
  const iv = Buffer.from(parsed.iv, "base64");
  const tag = Buffer.from(parsed.tag, "base64");
  const ct = Buffer.from(parsed.ct, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  return JSON.parse(plaintext);
}

module.exports = {
  getNotesEncryptionKey,
  encryptJsonAtRest,
  decryptJsonAtRest,
};
