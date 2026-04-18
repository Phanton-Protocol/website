# M6 — End-to-end verification gate (reviewer runbook)

**Scope:** Automated checks only — **no maintainer testnet tBNB** until explicit **SIGN-OFF OK**.  
**Chain:** M6 on-chain tests use **Hardhat local** + **MockVerifier** + **MockSwapAdaptor** (+ deployed `FeeOracle`).

## Commands (copy-paste)

| Step | Command |
|------|---------|
| Smart contracts (full suite) | `cd core/Phantom-Smart-Contracts && npm test` |
| M6 E2E file only | `cd core/Phantom-Smart-Contracts && npm run test:m6` |
| Relayer backend | `cd core/phantom-relayer-dashboard/backend && npm test` |
| Website build (optional) | `cd core && npm run build` |

## E-paper acceptance → automated evidence

| Acceptance row (summary) | Evidence |
|----------------------------|----------|
| Shielded **deposit** + Merkle membership + **join-split swap** on local mock stack | Hardhat: `M6-E2E-01` in `test/m6-e2e-local-gate.test.cjs` |
| **Withdraw** after swap (spends **change** leaf; multi-leaf Merkle path) | Same test (`M6-E2E-01`) |
| **Conservation** enforced on swap | `M6-NEG-01` → `PoolErr(43)`; withdraw conservation: `shieldedPool.integration.test.cjs` (“reverts when conservation breaks”) |
| **DEX / minOutput** vs actual adaptor output | `M6-NEG-02` → `PoolErr(15)` (MockAdaptor returns `amountIn`; min set higher) |
| **Intent nullifier** = proof `publicInputs.nullifier` (relayer API) | Node: `test/m4-swap-intent-binding.test.cjs` + `src/swapIntentBinding.js` (backend) |
| Staging / production **tier** bypass policy (relayer) | Covered by backend startup tests / config; manual env review |

## Human sign-off

Do **not** spend or allocate **tBNB** for maintainer wallets until the owner sends: **`SIGN-OFF OK`**.

## MVP implementation pass status

**Complete pending human sign-off** — automated gates above are the required pre-merge verification.
