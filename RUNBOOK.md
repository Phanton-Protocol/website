# Phantom MVP — operator runbook (Module 7)

This document is for an engineer bringing up **relayer + frontend** against **BSC testnet** (or similar) with **non-mock** verifiers/adaptors for staging-style environments.

## 1. Prerequisites

- **Node.js** 20+ recommended.
- **Contracts** compiled with full tree: `cd Phantom-Smart-Contracts && HH_FULL=1 npx hardhat compile`.
- **Bytecode fingerprints** for mock detection: from repo `core/` root run  
  `node Phantom-Smart-Contracts/scripts/compute-mock-bytecode-hashes.cjs`  
  (updates `config/module7-mock-bytecode-hashes.json` if mocks were recompiled).
- **Deploy profile** for real infra: `DEPLOY_PROFILE=staging` or `production` (never rely on default `dev` for shared testnets you treat as “staging”).  
  Requires `PANCAKE_ROUTER`, `WBNB_ADDRESS` (see root `.env.example`).
- **Post-deploy check** (on-chain):  
  `cd Phantom-Smart-Contracts && SHIELDED_POOL_ADDRESS=0x... npm run assert:no-mock-pool -- --network bscTestnet`
- **Relayer wallet** with BNB for gas, registered on `RelayerRegistry`.
- **User test wallet** (`E2E_USER_PRIVATE_KEY`) with testnet BNB + ERC20 used in E2E (e.g. BUSD test token) for approvals.

## 2. Contract addresses

- Prefer **`deployment-config.json`** / your saved Hardhat deployment JSON at `core/deployments/*.json` (or team vault).
- Copy **`shieldedPool`**, **`swapAdaptor`**, **`feeOracle`**, **`relayerRegistry`**, etc. into **`phantom-relayer-dashboard/backend/config.json`** (or set equivalent `*_ADDRESS` env vars).  
- Keep **frontend** `public/config.json` (or `VITE_*`) aligned with the same chain and pool.

## 3. Relayer backend

```bash
cd phantom-relayer-dashboard/backend
cp .env.example .env   # if you do not already have one
# Edit .env: RPC_URL, CHAIN_ID, SHIELDED_POOL_ADDRESS, RELAYER_PRIVATE_KEY, …
npm install
node src/index.js
```

**Staging / production tier (no mocks on-chain):**

- Set `PHANTOM_DEPLOYMENT_TIER=staging` or `production`.  
  On startup the backend compares `ShieldedPool.verifier()` and `.swapAdaptor()` bytecode to **MockVerifier / MockSwapAdaptor** fingerprints and **exits** if they match.
- Emergency escape hatch (not for real prod): `PHANTOM_SKIP_NO_MOCK_GATE=true`.

**Production Node (`NODE_ENV=production`):**

- Existing gate: `DEV_BYPASS_PROOFS` / `DEV_BYPASS_VALIDATORS` must be **false**, `CORS_ORIGINS` set, valid `RELAYER_PRIVATE_KEY`, etc. (see startup errors in `index.js`).

## 4. Frontend

```bash
cd core   # website root
npm install
VITE_API_URL=http://127.0.0.1:5050 npm run build   # or dev
```

Point `VITE_API_URL` at the relayer you started.

## 5. E2E script (deposit → swap → withdraw)

Requires a **running** relayer (`API_URL`), same chain/config as the pool, and a funded user key.

```bash
cd phantom-relayer-dashboard/backend
API_URL=http://127.0.0.1:5050 \
E2E_USER_PRIVATE_KEY=0x... \
E2E_TOKEN=0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7 \
E2E_OUTPUT_TOKEN=0x7EF95A0Fe8A5F4f9C1824fBf6656e2f95fA6Bf13 \
node scripts/e2e-mvp-testnet.cjs
```

Optional: `MODULE4_DEPOSIT_API_SECRET`, `E2E_DEPOSIT_WEI`, `E2E_WITHDRAW_PAYOUT_WEI`, `E2E_PROTOCOL_FEE_WEI`, `E2E_GAS_REFUND_WEI`, `MERKLE_POLL_MS`, `MERKLE_POLL_MAX`.

**Proofs:** For a quick wiring check without full Groth16 latency, relayer may use `DEV_BYPASS_PROOFS=true` **only on private dev stacks** — never with `NODE_ENV=production` or real mainnet economics.

**Common failures**

| Symptom | Likely cause |
|--------|----------------|
| `[FATAL] no-mock runtime gate` | Pool on chain still uses Mock* contracts while `PHANTOM_DEPLOYMENT_TIER=staging\|production`. Redeploy with `DEPLOY_PROFILE=staging` or unset tier for pure dev. |
| `assert-no-mock-pool` fails | Same — or fingerprints JSON out of date after recompile; regenerate hashes script. |
| `401 see_attestation_required` | `SEE_MODE` not `disabled` for local E2E; set `SEE_MODE=disabled` or send attestation headers. |
| `deposit submit` 403 / 401 | `MODULE4_DEPOSIT_API_SECRET` required by server. |
| Merkle poll timeout | Indexer/RPC slow; increase `MERKLE_POLL_MAX` or confirm deposit tx mined. |
| `withdraw_protocol_fee_insufficient` | Raise `E2E_PROTOCOL_FEE_WEI` to satisfy on-chain fee oracle floor. |
| Swap proof / intent mismatch | Quote stale or token pair has no liquidity — check `/quote` and Pancake env vars. |

## 6. Logging (Module 7)

Server logs use structured prefixes:

- `[relayer:onchain]` — tx submit / wait failures with **PoolErr** / `Error(string)` decoding when calldata is present.
- `[relayer:proof]` — Groth16 / witness failures from `zkProofs` (`generateSwapProof` / `generateWithdrawProof`).
- `[relayer:rpc]` — reserved for RPC helpers (extend as needed).

## 7. NPM shortcuts (repo root)

- `npm run test:backend` — relayer unit tests.
- `npm run e2e:testnet` — runs `e2e-mvp-testnet.cjs` (same env requirements as above).

## 8. Operator dashboard (Module 8)

The **Phantom Relayer Dashboard** (Vite app under `phantom-relayer-dashboard/`) has an **Operations** tab that polls:

- `GET /health` — process / config snapshot.
- `GET /relayer/dashboard` — uptime, **fee parameters** (`RUNTIME_PARAMS`), **default + Module 4 rate limits**, and **in-memory recent shielded swap / withdraw txs** plus **recent proof/on-chain errors** (resets on restart).

End users: **Privacy & visibility** page on the main site at `/privacy-visibility` (what the shielded pool hides vs what the AMM leg exposes on-chain).
