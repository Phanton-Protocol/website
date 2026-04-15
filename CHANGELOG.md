# Changelog

## 2026-04-15 — Module 8 (MVP+ polish)

- **Relayer dashboard:** new **Operations** tab — status, fees, rate limits, recent txs (in-memory since process start), recent errors; links to **RUNBOOK.md** and the main-site **Privacy & visibility** page.
- **API:** `GET /relayer/dashboard` aggregates activity buffer + fee/rate-limit snapshot for operators.
- **Website:** `/privacy-visibility` — short user doc on private vs AMM-visible flow; footer + nav link; **MVP security limitations** (relayer trust, rate limits, no implied audit).

## 2026-04-15 — Module 7 (hardening & no-mock gate)

- **Deploy:** `FORCE_MOCK_INFRASTRUCTURE=true` is rejected for `DEPLOY_PROFILE=staging|production`; deploy records must not include mock verifier addresses when using real profiles.
- **On-chain check:** `npm run assert:no-mock-pool -- --network bscTestnet` (contracts workspace) compares pool `verifier` / `swapAdaptor` bytecode to Mock fingerprints in `config/module7-mock-bytecode-hashes.json` (regenerate via `npm run fingerprints:mock-bytecode -w phantom-smart-contracts`).
- **Relayer:** Optional `PHANTOM_DEPLOYMENT_TIER=staging|production` enables startup gate against mock bytecode; structured logging for proof failures and on-chain reverts (`relayerLog.js`).
- **E2E:** `phantom-relayer-dashboard/backend/scripts/e2e-mvp-testnet.cjs` + root `npm run e2e:testnet`; **RUNBOOK.md** documents prerequisites and common failures.

## 2026-04-14 — Module 6 (withdraw)

- **Withdraw fee policy:** Canonical rule is **`ShieldedPool.shieldedWithdraw`** (oracle-derived minimum protocol fee with ~1% tolerance). Proofs must include a `protocolFee` that satisfies that check while preserving `inputAmount = swapAmount + changeAmount + protocolFee + gasRefund`. See `phantom-relayer-dashboard/backend/MODULE6-WITHDRAW.md`.
- **Relayer:** `POST /withdraw/generate-proof`, stricter `publicInputs` validation, optional `CHAINALYSIS_ENABLED` recipient screen, clearer on-chain revert mapping, Module 3 change-note persistence via `noteHints` / `ownerAddress`.
- **Backend tests:** `npm test` runs Node’s test runner with `--test-force-exit` so Groth16/zk-kit runs do not leave the process hung on open handles.
