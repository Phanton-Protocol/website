const DEFAULT_SWAP_WASM_URL = "/circuits/joinsplit.wasm";
const DEFAULT_SWAP_ZKEY_URL = "/circuits/joinsplit_0001.zkey";

async function fileExists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

export async function canUseClientProver({ wasmUrl = DEFAULT_SWAP_WASM_URL, zkeyUrl = DEFAULT_SWAP_ZKEY_URL } = {}) {
  const [wasmOk, zkeyOk] = await Promise.all([fileExists(wasmUrl), fileExists(zkeyUrl)]);
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
