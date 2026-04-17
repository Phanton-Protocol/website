/**
 * Find which host:port answers GET /health (handles `npm run dev` falling back 5050→5051…).
 * Loads backend/.env for PORT when probing.
 */
const http = require("http");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

function getHealth(baseUrl) {
  const u = new URL(String(baseUrl).replace(/\/$/, ""));
  const port = u.port ? Number(u.port) : u.protocol === "https:" ? 443 : 80;
  return new Promise((resolve, reject) => {
    const lib = u.protocol === "https:" ? require("https") : http;
    const req = lib.request(
      {
        hostname: u.hostname,
        port,
        path: "/health",
        method: "GET",
        timeout: 4000,
      },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => resolve({ status: res.statusCode, raw: buf }));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("timeout"));
    });
    req.end();
  });
}

/**
 * @param {string} [explicitUrl] - from API_URL env; may be wrong port
 * @returns {Promise<{ url: string, hint: string | null, discovered: boolean }>}
 */
async function discoverRelayerApiUrl(explicitUrl) {
  const trimmed = String(explicitUrl || "").trim().replace(/\/$/, "");
  const tryBase = async (base) => {
    try {
      const r = await getHealth(base);
      if (r.status === 200) return base.replace(/\/$/, "");
    } catch {
      /* ignore */
    }
    return null;
  };

  if (trimmed) {
    const ok = await tryBase(trimmed);
    if (ok) return { url: ok, hint: null, discovered: false };
  }

  const startPort = Number(process.env.PORT || 5050);
  const host = "127.0.0.1";
  for (let i = 0; i <= 10; i += 1) {
    const base = `http://${host}:${startPort + i}`;
    const ok = await tryBase(base);
    if (ok) {
      const hint =
        trimmed && trimmed !== ok
          ? `Relayer lives at ${ok} (not ${trimmed}). Export: API_URL=${ok}`
          : trimmed
            ? null
            : `No API_URL set; using ${ok} (PORT scan from ${startPort}). Export API_URL for a fixed port.`;
      return { url: ok, hint, discovered: true };
    }
  }

  const fallback = trimmed || `http://${host}:${startPort}`;
  return {
    url: fallback,
    hint: `No GET /health on ${host} ports ${startPort}–${startPort + 10}. Start relayer in backend/ then retry. Last tried API_URL=${fallback}`,
    discovered: false,
  };
}

module.exports = { discoverRelayerApiUrl, getHealth };
