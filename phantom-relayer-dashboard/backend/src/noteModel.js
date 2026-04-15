const crypto = require("crypto");
const { mimc7 } = require("./mimc7");
const { toBigInt } = require("./utils/bigint");

const NOTE_SCHEMA_VERSION = "note.v1";

function computeCommitment(assetId, amount, blindingFactor, ownerPublicKey) {
  const h1 = mimc7(toBigInt(assetId), toBigInt(amount));
  const h2 = mimc7(h1, toBigInt(blindingFactor));
  return mimc7(h2, toBigInt(ownerPublicKey));
}

function computeNullifier(commitment, ownerPublicKey) {
  return mimc7(toBigInt(commitment), toBigInt(ownerPublicKey));
}

function normalizeHex32(value) {
  const bi = toBigInt(value);
  return `0x${bi.toString(16).padStart(64, "0")}`;
}

function canonicalizeNote(input) {
  const assetId = toBigInt(input.assetId ?? input.assetID);
  const amount = toBigInt(input.amount);
  const blindingFactor = toBigInt(input.blindingFactor);
  const ownerPublicKey = toBigInt(input.ownerPublicKey);
  const commitment = computeCommitment(assetId, amount, blindingFactor, ownerPublicKey);
  const nullifier = computeNullifier(commitment, ownerPublicKey);

  return {
    schema: NOTE_SCHEMA_VERSION,
    assetId: assetId.toString(),
    amount: amount.toString(),
    blindingFactor: blindingFactor.toString(),
    ownerPublicKey: ownerPublicKey.toString(),
    commitment: normalizeHex32(commitment),
    nullifier: normalizeHex32(nullifier),
  };
}

function stableNoteString(noteObj) {
  // Stable field order for deterministic note ID hashing.
  const stable = {
    schema: noteObj.schema,
    assetId: String(noteObj.assetId),
    amount: String(noteObj.amount),
    blindingFactor: String(noteObj.blindingFactor),
    ownerPublicKey: String(noteObj.ownerPublicKey),
    commitment: String(noteObj.commitment).toLowerCase(),
    nullifier: String(noteObj.nullifier).toLowerCase(),
  };
  return JSON.stringify(stable);
}

function noteIdFromCanonical(noteObj, salt = "") {
  return crypto.createHash("sha256").update(stableNoteString(noteObj)).update(String(salt)).digest("hex");
}

module.exports = {
  NOTE_SCHEMA_VERSION,
  computeCommitment,
  computeNullifier,
  canonicalizeNote,
  noteIdFromCanonical,
  normalizeHex32,
};
