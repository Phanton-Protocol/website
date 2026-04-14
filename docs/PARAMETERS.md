# Phantom Parameter Registry

Last updated: 2026-04-02

This document is the canonical parameter registry for whitepaper and implementation alignment. Values are grouped by policy status.

## 1. Parameter Status Categories

- `active_reference`: currently used as canonical policy value
- `implementation_variant`: observed in code paths or legacy deployments
- `target_policy`: intended production policy for upcoming releases
- `tbd`: not finalized yet

## 2. Protocol Economics Parameters

| Parameter | Value | Status | Notes |
|---|---:|---|---|
| DEX swap fee rate | 0.1% | target_policy | Production policy value for whitepaper |
| Internal matching fee rate | 0.2% | target_policy | Production policy value for whitepaper |
| Deposit baseline fee | USD 2 equivalent | active_reference | Treated as deployment-configurable |
| Swap fee (legacy constant path) | 0.005% | implementation_variant | Observed in reduced contract path; test/deployment variant |

## 3. Join-Split Accounting Parameters

Core conservation formula:

\[
inputAmount = swapAmount + changeAmount + protocolFee + gasRefund
\]

Public input vector order (join-split path):

\[
[nullifier,\ inputCommitment,\ outputCommitmentSwap,\ outputCommitmentChange,\ merkleRoot,\ outputAmountSwapPublic,\ minOutputAmountSwap,\ protocolFee,\ gasRefund]
\]

Status: `active_reference`

## 4. Cryptographic Parameters

| Parameter | Value | Status | Notes |
|---|---:|---|---|
| Field modulus | 21888242871839275222246405745257275088548364400416034343698204186575808495617 | active_reference | BN254 scalar field |
| Merkle depth (reduced reference path) | 10 | implementation_variant | Canonical for reduced path |
| Hash function (reference path) | MiMC7 | active_reference | Commitment/nullifier/merkle internal hash path |
| Proving system | Groth16 | active_reference | bn128 verifier path |
| nPublic (join-split vk) | 9 | active_reference | Matches verifier and vk |

## 5. Banking SaaS Parameters

| Parameter | Value | Status | Notes |
|---|---:|---|---|
| Tenant model | Per-bank tenant isolation | target_policy | Canonical architecture |
| Account-to-address derivation mode | HSM + tenant salt + internal account mapping | target_policy | Must avoid predictable mapping from account numbers |
| Regulatory disclosure mode | Policy-gated selective disclosure | target_policy | Not blanket visibility |

## 6. Payroll SaaS Parameters

| Parameter | Value | Status | Notes |
|---|---:|---|---|
| Approval threshold | Configurable N-of-M | target_policy | Per company policy |
| Pay cycle | Configurable | target_policy | Monthly/biweekly/ad hoc |
| Asset support | Multi-token | target_policy | Optional conversion rails |
| Failed payout policy | Retry/reclaim/withdraw unspent | target_policy | Company policy controlled |

## 7. SDK Parameters

| Parameter | Value | Status | Notes |
|---|---:|---|---|
| Versioning scheme | Semantic versioning | target_policy | Industry standard |
| Support policy | LTS release track | target_policy | Industry standard |
| Languages | TS first, then Python/Java/Go | target_policy | Expansion roadmap |

## 8. Commercial Parameters

All commercial pricing is `tbd`:

- Banking SaaS pricing model
- Payroll SaaS pricing model
- SDK pricing model
- enterprise support tiers

These must not be hardcoded in whitepaper claims until finalized.

