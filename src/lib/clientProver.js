const DEFAULT_SWAP_WASM_URL = "/circuits/joinsplit.wasm";
const DEFAULT_SWAP_ZKEY_URL = "/circuits/joinsplit_0001.zkey";

/** WebAssembly binary magic: \0asm */
const WASM_MAGIC = [0x00, 0x61, 0x73, 0x6d];

/**
 * Vite (and many SPAs) return index.html with 200 for unknown paths, so HEAD/GET "ok"
 * is not enough — snarkjs then does WebAssembly.compile() on HTML and throws
 * "expected magic word 00 61 73 6d, found 3c 21 64 6f" (<!do).
 */
async function responseLooksLikeWasm(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-7" },
    });
    if (!res.ok) return false;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("text/html")) return false;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length < 4) return false;
    for (let i = 0; i < 4; i += 1) {
      if (buf[i] !== WASM_MAGIC[i]) return false;
    }
    return true;
  } catch {
    return false;
  }
}

async function responseLooksLikeZkeyNotHtml(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-31" },
    });
    if (!res.ok) return false;
    const ct = (res.headers.get("content-type") || "").toLowerCase();
    if (ct.includes("text/html")) return false;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length < 16) return false;
    if (buf[0] === 0x3c && buf[1] === 0x21) return false;
    return true;
  } catch {
    return false;
  }
}

export async function canUseClientProver({ wasmUrl = DEFAULT_SWAP_WASM_URL, zkeyUrl = DEFAULT_SWAP_ZKEY_URL } = {}) {
  const [wasmOk, zkeyOk] = await Promise.all([responseLooksLikeWasm(wasmUrl), responseLooksLikeZkeyNotHtml(zkeyUrl)]);
  return wasmOk && zkeyOk;
}

export async function generateSwapProofClient(circuitInputs, { wasmUrl = DEFAULT_SWAP_WASM_URL, zkeyUrl = DEFAULT_SWAP_ZKEY_URL } = {}) {
  const snarkjs = await import("snarkjs");
  const result = await snarkjs.groth16.fullProve(circuitInputs, wasmUrl, zkeyUrl);
  return {
    proof: result.proof,
    publicInputs: result.publicSignals,
  };
}
