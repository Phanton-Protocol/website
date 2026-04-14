# Module 6 — Shielded withdraw (MVP)

## Flow

1. User selects a spendable note (vault) or pastes full `withdrawData` JSON (Advanced).
2. `POST /withdraw/generate-proof` builds a **join-split** Groth16 proof with **withdraw semantics**:
   - `outputCommitmentSwap = 0`, `outputAssetIDSwap = 0`, `outputAmountSwap = 0`, `minOutputAmountSwap = 0`
   - `swapAmount` = amount sent to **recipient** (payout leg; same field name as swap path in the circuit)
   - **Conservation:** `inputAmount = swapAmount + changeAmount + protocolFee + gasRefund`
   - `changeAmount > 0` (ShieldedPool rejects zero change)
3. User sends encrypted envelope to `POST /withdraw/encrypted` (or plain `POST /withdraw`).
4. Relayer verifies public-input shape, optional Chainalysis screen, validator quorum (unless bypassed), then `shieldedWithdraw` on `ShieldedPool`.
5. On success, `CommitmentAdded` indexes the **change** note; optional Module 3 persistence when `noteHints` + `ownerAddress` are provided.

## Fee policy (single source of truth)

**On-chain `ShieldedPool.shieldedWithdraw`** recomputes a **minimum protocol fee** from `feeOracle` (~2% of USD value or **$2 USD floor**, same spirit as deposit). The proof’s `protocolFee` must satisfy `inputs.protocolFee >= onChainMin - 1%` tolerance (`PoolErr(5)` otherwise).

**Relayer/backend** does not replace that policy: clients must choose `protocolFee` (and `gasRefund`) in the proof such that:

- The **circuit** conservation holds, and  
- The **contract** oracle check passes on testnet/mainnet.

Documented here and in `CHANGELOG.md` at repo root so whitepaper/marketing lines can defer to this file if wording drifts.

## Optional Chainalysis

- `CHAINALYSIS_ENABLED` (default `false`): when `true`, relayer calls `CHAINALYSIS_API_URL` (POST JSON `{ "address": "<recipient>" }`) before submitting.
- Non-2xx or `{ blocked: true }` / `{ risk: "severe" }` → HTTP 403.
- If enabled but URL missing, screening is skipped with a warning log (MVP dev ergonomics).

## Env

| Variable | Purpose |
|----------|---------|
| `CHAINALYSIS_ENABLED` | `true` to enable recipient screening |
| `CHAINALYSIS_API_URL` | HTTPS endpoint for screening POST |

## Errors (selected)

| Message | Meaning |
|---------|---------|
| `withdraw_nullifier_already_spent` | Nullifier already on-chain |
| `withdraw_proof_rejected` | Verifier / proof mismatch |
| `withdraw_protocol_fee_insufficient_for_on_chain_policy` | `protocolFee` in proof below oracle-derived floor |
| `withdraw_amount_conservation_or_change_invalid` | Conservation or zero-change |
