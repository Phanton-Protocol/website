#!/usr/bin/env bash
# Recompile joinsplit_public9, run Groth16 setup, export verifier + vk.
#
# Trusted setup (MVP): single local `snarkjs zkey contribute` pass on dev PTAU — NOT production MPC.
# Production requires a proper multi-party ceremony and pinned artifacts.
#
# Requires: circom 2.x on PATH (or CIRCOM=/path/to/circom), Node + npm deps (snarkjs).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
CIR="circuits/joinsplit_public9"
mkdir -p circuits/trusted_setup
# Real join-split circuit needs >2^13 constraints; pot8 is too small. Default to Hermez bn128 final_14.
PTAU="${PTAU:-circuits/trusted_setup/powersOfTau28_hez_final_14.ptau}"
HERMEZ_PT14_URL="https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_14.ptau"
CIRCOM_BIN="${CIRCOM:-circom}"
if ! command -v "$CIRCOM_BIN" >/dev/null 2>&1; then
  echo "ERROR: circom not found. Install from https://github.com/iden3/circom/releases or set CIRCOM=..." >&2
  exit 1
fi
if [[ ! -f "$PTAU" ]]; then
  echo "Downloading Hermez PTAU (dev, ~73MB) to $PTAU ..."
  curl -fL --retry 3 -o "$PTAU" "$HERMEZ_PT14_URL"
fi

mkdir -p "$CIR/build"
# circomlib includes (bitify, comparators, …) — pass -l from package root
LIB_CIRCOM="$(cd "$ROOT" && node -p "require('path').join(require.resolve('circomlib/package.json'),'..','circuits')")"
"$CIRCOM_BIN" "$CIR/joinsplit_public9.circom" --r1cs --wasm --sym -o "$CIR/build" -l "$LIB_CIRCOM"

npx snarkjs groth16 setup "$CIR/build/joinsplit_public9.r1cs" "$PTAU" "$CIR/circuit_0000.zkey"
printf '%s\n' "rebuild-contribution-$(date -u +%s)" | npx snarkjs zkey contribute "$CIR/circuit_0000.zkey" "$CIR/circuit_final.zkey" --name=phantom-rebuild -v
npx snarkjs zkey verify "$CIR/build/joinsplit_public9.r1cs" "$PTAU" "$CIR/circuit_final.zkey"
npx snarkjs zkey export verificationkey "$CIR/circuit_final.zkey" "$CIR/verification_key.json"
npx snarkjs zkey export solidityverifier "$CIR/circuit_final.zkey" "contracts/_full/verifiers/JoinSplitVerifier.sol"

echo "OK. Update circuits/joinsplit_public9/manifest.json sha256 fields and run: HH_FULL=1 npm test"
