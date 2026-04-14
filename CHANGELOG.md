# Changelog

## 2026-04-14 — Module 6 (withdraw)

- **Withdraw fee policy:** Canonical rule is **`ShieldedPool.shieldedWithdraw`** (oracle-derived minimum protocol fee with ~1% tolerance). Proofs must include a `protocolFee` that satisfies that check while preserving `inputAmount = swapAmount + changeAmount + protocolFee + gasRefund`. See `phantom-relayer-dashboard/backend/MODULE6-WITHDRAW.md`.
- **Relayer:** `POST /withdraw/generate-proof`, stricter `publicInputs` validation, optional `CHAINALYSIS_ENABLED` recipient screen, clearer on-chain revert mapping, Module 3 change-note persistence via `noteHints` / `ownerAddress`.
- **Backend tests:** `npm test` runs Node’s test runner with `--test-force-exit` so Groth16/zk-kit runs do not leave the process hung on open handles.
