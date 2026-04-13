#!/usr/bin/env bash
# Recompile joinsplit_public9, run Groth16 setup on committed pot8, export verifier + vk.
# Requires: circom 2.x on PATH (or CIRCOM=/path/to/circom), Node + npm deps (snarkjs).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
CIR="circuits/joinsplit_public9"
PTAU="circuits/trusted_setup/pot8_bn128_pow8_final.ptau"
CIRCOM_BIN="${CIRCOM:-circom}"
if ! command -v "$CIRCOM_BIN" >/dev/null 2>&1; then
  echo "ERROR: circom not found. Install from https://github.com/iden3/circom/releases or set CIRCOM=..." >&2
  exit 1
fi
if [[ ! -f "$PTAU" ]]; then
  echo "ERROR: missing $PTAU (powers of tau). See circuits/CIRCUITS.md" >&2
  exit 1
fi

mkdir -p "$CIR/build"
"$CIRCOM_BIN" "$CIR/joinsplit_public9.circom" --r1cs --wasm --sym -o "$CIR/build"

npx snarkjs groth16 setup "$CIR/build/joinsplit_public9.r1cs" "$PTAU" "$CIR/circuit_0000.zkey"
printf '%s\n' "rebuild-contribution-$(date -u +%s)" | npx snarkjs zkey contribute "$CIR/circuit_0000.zkey" "$CIR/circuit_final.zkey" --name=phantom-rebuild -v
npx snarkjs zkey verify "$CIR/build/joinsplit_public9.r1cs" "$PTAU" "$CIR/circuit_final.zkey"
npx snarkjs zkey export verificationkey "$CIR/circuit_final.zkey" "$CIR/verification_key.json"
npx snarkjs zkey export solidityverifier "$CIR/circuit_final.zkey" "contracts/_full/verifiers/JoinSplitVerifier.sol"

echo "OK. Update circuits/joinsplit_public9/manifest.json sha256 fields and run: HH_FULL=1 npm test"
