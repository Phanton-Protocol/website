const DB_NAME = "phantom_note_vault";
const DB_VERSION = 1;
const STORE = "kv";
const KEY = "vault.v1";

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet(k) {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const store = tx.objectStore(STORE);
    const req = store.get(k);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(k, v) {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.put(v, k);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

async function idbDel(k) {
  const db = await openDb();
  return await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.delete(k);
    req.onsuccess = () => resolve(true);
    req.onerror = () => reject(req.error);
  });
}

function bytesToB64(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

async function sha256(bytes) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return new Uint8Array(digest);
}

async function deriveKeyFromWalletSignature(signature) {
  const sigBytes = new TextEncoder().encode(String(signature));
  const keyBytes = await sha256(sigBytes);
  return await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

export async function encryptJson(key, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(obj));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext));
  return { v: 1, iv: bytesToB64(iv), ct: bytesToB64(ct) };
}

export async function decryptJson(key, payload) {
  if (!payload || payload.v !== 1) throw new Error("Unsupported vault payload");
  const iv = b64ToBytes(payload.iv);
  const ct = b64ToBytes(payload.ct);
  const pt = new Uint8Array(await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct));
  return JSON.parse(new TextDecoder().decode(pt));
}

export async function loadVault({ signature }) {
  const key = await deriveKeyFromWalletSignature(signature);
  const encrypted = await idbGet(KEY);
  if (!encrypted) return { key, data: { notes: [], updatedAt: null } };
  try {
    const data = await decryptJson(key, encrypted);
    return { key, data };
  } catch {
    // Wrong key: e.g. unlock message used to include a timestamp so every signature differed.
    // Clear unreadable blob so a stable message can succeed; old notes were not decryptable anyway.
    try {
      await idbDel(KEY);
    } catch {
      /* ignore */
    }
    return { key, data: { notes: [], updatedAt: null } };
  }
}

export async function saveVault({ key, data }) {
  const encrypted = await encryptJson(key, data);
  await idbSet(KEY, encrypted);
  return true;
}

