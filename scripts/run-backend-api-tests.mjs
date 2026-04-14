import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..");
const backendDir = path.join(repoRoot, "phantom-relayer-dashboard", "backend");
const port = process.env.VERIFY_BACKEND_PORT || "58888";
const base = `http://127.0.0.1:${port}`;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitJson(url, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  let lastErr;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return await res.json();
      lastErr = new Error(`${url} -> ${res.status}`);
    } catch (e) {
      lastErr = e;
    }
    await sleep(250);
  }
  throw lastErr || new Error(`timeout ${url}`);
}

async function assertJson(name, url, pred) {
  const j = await waitJson(url);
  if (!pred(j)) {
    console.error(name, "failed:", j);
    throw new Error(name);
  }
  console.log("OK:", name);
}

async function main() {
  const child = spawn(process.execPath, ["src/index.js"], {
    cwd: backendDir,
    env: {
      ...process.env,
      PORT: port,
      NODE_ENV: "development",
      RELAYER_DRY_RUN: "true",
      DEV_BYPASS_VALIDATORS: "true",
      DEV_BYPASS_PROOFS: "true",
      SHIELDED_POOL_ADDRESS: "0xC6bdf5858e8D4C2fad09d0CA3cE356B2ace0ec99",
      SWAP_ADAPTOR_ADDRESS: "0x341a5CA83566688fCf05725Ca7AA6Dc35671ae35",
      OFFCHAIN_ORACLE_ADDRESS: "0x89Ca5cda0cB774D5b5F80e92a72D62237E4E5e4d",
      RELAYER_STAKING_ADDRESS: "0xf68c0F35075c168289aF67E18698180b7F71a1e8",
      PHANTOM_CONFIG_DIR: path.join(repoRoot, "config"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  const onErr = (d) => {
    const s = d.toString();
    if (s.trim()) process.stderr.write(s);
  };
  child.stderr.on("data", onErr);
  child.stdout.on("data", onErr);

  try {
    await assertJson("health", `${base}/health`, (j) => j.ok === true && typeof j.configWarningCount === "number");
    await assertJson(
      "config",
      `${base}/config`,
      (j) =>
        Array.isArray(j.configWarnings) &&
        j.chainId != null &&
        j.configWarnings.length === 0
    );
    await assertJson("parameters", `${base}/parameters`, (j) => j.fees && j.profile);
    await assertJson("fhe health", `${base}/fhe/health`, (j) => j.status === "healthy");

    const matchRes = await fetch(`${base}/fhe/match`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        order1: {
          inputAssetID: 1,
          outputAssetID: 2,
          fheEncryptedInputAmount: "0xaa",
          fheEncryptedMinOutput: "0xbb",
        },
        order2: {
          inputAssetID: 2,
          outputAssetID: 1,
          fheEncryptedInputAmount: "0xcc",
          fheEncryptedMinOutput: "0xdd",
        },
      }),
      signal: AbortSignal.timeout(15000),
    });
    const matchBody = await matchRes.json();
    if (!matchRes.ok || typeof matchBody.matched !== "boolean") {
      throw new Error(`fhe/match: ${matchRes.status} ${JSON.stringify(matchBody)}`);
    }
    console.log("OK: fhe/match");

    const smoke = spawn(process.execPath, ["scripts/smoke-enterprise.mjs"], {
      cwd: repoRoot,
      env: { ...process.env, TEST_API_BASE: base },
      stdio: "inherit",
    });
    await new Promise((resolve, reject) => {
      smoke.on("error", reject);
      smoke.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`smoke-enterprise exit ${code}`))));
    });
    console.log("OK: smoke-enterprise");
  } finally {
    child.kill("SIGTERM");
    await sleep(300);
    if (!child.killed) child.kill("SIGKILL");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
