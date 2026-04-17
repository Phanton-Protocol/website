#!/usr/bin/env node
/**
 * Phantom testnet MVP — on-chain + HTTP checks before `npm run e2e:testnet` / `e2e:shadow-diagram`.
 *
 * Run from backend/: `node scripts/preflight-mvp.cjs`
 * Uses `.env` (dotenv). Optional: API_URL=http://127.0.0.1:5050
 */
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const http = require("http");
const https = require("https");
const { ethers } = require("ethers");
const { discoverRelayerApiUrl } = require("./lib/relayerApiDiscover.cjs");
const RPC_URL = String(process.env.RPC_URL || "").trim();
const POOL = String(process.env.SHIELDED_POOL_ADDRESS || "").trim();
const RELAYER_PK = String(process.env.RELAYER_PRIVATE_KEY || "").trim();

function requestJson(method, urlStr) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === "https:" ? https : http;
    const req = lib.request(
      { hostname: u.hostname, port: u.port || (u.protocol === "https:" ? 443 : 80), path: u.pathname, method },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(buf || "{}"), raw: buf });
          } catch {
            resolve({ status: res.statusCode, text: buf, raw: buf });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });
}

async function main() {
  const issues = [];
  const warnings = [];
  const ok = [];

  const { url: relayerHttpUrl, hint: relayerHint, discovered } = await discoverRelayerApiUrl(process.env.API_URL);
  if (relayerHint) warnings.push(relayerHint);
  if (discovered) ok.push(`Relayer HTTP discovered at ${relayerHttpUrl} (PORT busy fallback or unset API_URL)`);

  if (!RPC_URL) issues.push("RPC_URL missing in .env");
  else ok.push("RPC_URL set");

  if (!POOL) issues.push("SHIELDED_POOL_ADDRESS missing");
  else ok.push("SHIELDED_POOL_ADDRESS set");

  let relayerAddr = "";
  if (!RELAYER_PK) issues.push("RELAYER_PRIVATE_KEY missing");
  else {
    try {
      let pk = RELAYER_PK;
      if (!pk.startsWith("0x") && /^[0-9a-fA-F]{64}$/i.test(pk)) pk = `0x${pk}`;
      relayerAddr = new ethers.Wallet(pk).address;
      ok.push(`relayer EOA ${relayerAddr}`);
    } catch (e) {
      issues.push(`RELAYER_PRIVATE_KEY invalid: ${e.message}`);
    }
  }

  if (RPC_URL && POOL) {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    const pool = new ethers.Contract(
      POOL,
      [
        "function withdrawHandler() view returns (address)",
        "function relayerRegistry() view returns (address)",
        "function DEPOSIT_FEE_USD() view returns (uint256)",
      ],
      provider
    );
    try {
      const wh = await pool.withdrawHandler();
      if (!wh || String(wh).toLowerCase() === ethers.ZeroAddress.toLowerCase()) {
        issues.push("pool.withdrawHandler() is zero — withdraw will revert (deploy + set-pathb-withdraw-handler)");
      } else ok.push(`withdrawHandler ${wh}`);

      const reg = await pool.relayerRegistry();
      if (relayerAddr && reg && String(reg).toLowerCase() !== ethers.ZeroAddress.toLowerCase()) {
        const r = new ethers.Contract(reg, ["function isRelayer(address) view returns (bool)"], provider);
        const isR = await r.isRelayer(relayerAddr);
        if (!isR) {
          issues.push(
            "RelayerRegistry.isRelayer(relayer)=false — Module4 /relayer/deposit/submit returns 503 until registered"
          );
        } else ok.push("RelayerRegistry.isRelayer(relayer)=true");
      }
      const feeUsd = await pool.DEPOSIT_FEE_USD();
      ok.push(`on-chain DEPOSIT_FEE_USD (1e8) = ${feeUsd.toString()}`);
    } catch (e) {
      issues.push(`RPC pool read failed: ${e.shortMessage || e.message}`);
    }
  }

  try {
    const h = await requestJson("GET", `${relayerHttpUrl}/health`);
    if (h.status !== 200) warnings.push(`GET /health → ${h.status} (start \`npm run dev\` in backend/)`);
    else ok.push(`GET /health OK (${relayerHttpUrl})`);
  } catch (e) {
    warnings.push(`GET /health failed: ${e.message} — relayer not listening on ${relayerHttpUrl}`);
  }

  try {
    const c = await requestJson("GET", `${relayerHttpUrl}/config`);
    if (c.status !== 200) warnings.push(`GET /config → ${c.status}`);
    else {
      const p = c.json?.addresses?.shieldedPool;
      if (p && POOL && String(p).toLowerCase() !== String(POOL).toLowerCase()) {
        issues.push(`GET /config pool ${p} != SHIELDED_POOL_ADDRESS in .env ${POOL}`);
      } else ok.push("GET /config OK");
      const see = c.json?.see?.mode ?? "";
      if (String(see).toLowerCase() !== "disabled" && String(see).toLowerCase() !== "mock") {
        warnings.push(`SEE_MODE=${see} — set SEE_MODE=disabled for local E2E unless you send attestation headers`);
      } else ok.push(`SEE_MODE=${see || "disabled"}`);
    }
  } catch (e) {
    warnings.push(`GET /config failed: ${e.message}`);
  }

  console.log("--- Phantom MVP preflight ---\n");
  ok.forEach((x) => console.log(`  [ok] ${x}`));
  if (warnings.length) {
    console.log("\n  [warn]");
    warnings.forEach((x) => console.log(`    - ${x}`));
  }
  if (issues.length) {
    console.log("\n  [BLOCKING]");
    issues.forEach((x) => console.log(`    - ${x}`));
    console.log(
      "\nFix BLOCKING items, then:\n  npm run dev\n  npm run e2e:testnet   # E2E_USER_PRIVATE_KEY + funded wallet (+ token approve for erc20)\n  npm run e2e:shadow-diagram   # shadow BNB deposit → BUSD swap → shadow withdraw\n"
    );
    process.exit(1);
  }
  console.log("\nOn-chain preflight OK." + (warnings.length ? " Fix warnings before E2E if applicable." : "") + "\n");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
