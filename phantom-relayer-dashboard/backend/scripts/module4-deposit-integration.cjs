#!/usr/bin/env node
/**
 * Client-style integration for Module 4 (requires running backend + chain + registered relayer).
 *
 * Usage:
 *   API_URL=http://localhost:5050 MODULE4_DEPOSIT_API_SECRET=... node scripts/module4-deposit-integration.cjs
 *
 * Env:
 *   API_URL — backend base (default http://127.0.0.1:5050)
 *   DEPOSITOR — user address (default: first anvil/hardhat account not used)
 *   TOKEN — ERC20 address (required for erc20 mode)
 *   AMOUNT — wei string
 *   ASSET_ID — number (default 1)
 *   MODE — erc20 | bnb (default erc20)
 *   NOTES_ENCRYPTION_KEY_HEX — must match server for note persist
 */
const crypto = require("crypto");
const http = require("http");
const https = require("https");

const API_URL = process.env.API_URL || "http://127.0.0.1:5050";
const MODE = (process.env.MODE || "erc20").toLowerCase();
const DEPOSITOR = process.env.DEPOSITOR || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const TOKEN = process.env.TOKEN || "";
const AMOUNT = process.env.AMOUNT || "1000000000000000000";
const ASSET_ID = process.env.ASSET_ID || "1";
const MODULE4_DEPOSIT_API_SECRET = process.env.MODULE4_DEPOSIT_API_SECRET || "";

function requestJson(method, urlStr, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === "https:" ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? 443 : 80),
        path: u.pathname + u.search,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(buf || "{}") });
          } catch (e) {
            resolve({ status: res.statusCode, text: buf });
          }
        });
      }
    );
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const idempotencyKey = `m4-${crypto.randomBytes(8).toString("hex")}`;
  const base = API_URL.replace(/\/$/, "");
  const authHeaders = MODULE4_DEPOSIT_API_SECRET
    ? { Authorization: `Bearer ${MODULE4_DEPOSIT_API_SECRET}` }
    : {};

  const sessionBody = {
    idempotencyKey,
    depositor: DEPOSITOR,
    mode: MODE === "bnb" ? "bnb" : "erc20",
    assetId: Number(ASSET_ID),
    ...(MODE === "bnb" ? { amount: AMOUNT } : { token: TOKEN, amount: AMOUNT }),
  };

  if (sessionBody.mode === "erc20" && !TOKEN) {
    console.error("Set TOKEN for erc20 mode.");
    process.exit(1);
  }

  const s = await requestJson("POST", `${base}/relayer/deposit/session`, sessionBody);
  console.log("session:", s.status, s.json || s.text);
  if (s.status !== 200 || !s.json?.sessionId) process.exit(1);

  const { sessionId, sessionToken } = s.json;
  const blindingFactor = String(BigInt("0x" + crypto.randomBytes(16).toString("hex")));
  const ownerPublicKey = String(BigInt("0x" + crypto.randomBytes(16).toString("hex")));

  const note = {
    assetId: Number(ASSET_ID),
    amount: AMOUNT,
    blindingFactor,
    ownerPublicKey,
  };

  const path = require("path");
  const { canonicalizeNote } = require(path.join(__dirname, "..", "src", "noteModel"));
  const commitment = canonicalizeNote(note).commitment;

  const sub = await requestJson(
    "POST",
    `${base}/relayer/deposit/submit`,
    {
      sessionId,
      sessionToken,
      idempotencyKey,
      commitment,
      note,
    },
    authHeaders
  );
  console.log("submit:", sub.status, sub.json || sub.text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
