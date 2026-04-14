# Phantom Payroll SaaS Specification (Phase 1 Foundation)

Last updated: 2026-04-02

## 1. Purpose

Phantom Payroll SaaS is a global payroll orchestration product for organizations of any size. It is independent from Banking SaaS and focuses on private, policy-driven salary disbursement workflows.

## 2. Product Boundary

Payroll SaaS covers:

- payroll batch ingestion (CSV/API)
- approval workflows
- payout execution to wallets and integrated rails
- exception handling (retry/reclaim/unspent withdrawal)
- employee-facing records and exports

It does not include bank-core tenant management responsibilities from Banking SaaS.

## 3. Core Actors

- HR operator (prepares payroll)
- Finance approver(s)
- Payroll executor service
- Employee recipients
- Auditor/compliance reviewer

## 4. Functional Workflow

1. HR uploads payroll batch.
2. System validates schema, recipients, and policy limits.
3. Required approvers sign according to configured threshold.
4. Funding check and payout plan generation.
5. Execution engine disburses payouts.
6. Failed payouts enter retry/reclaim queue.
7. Employee records and organization exports are produced.

## 5. Approval Model

Approval threshold is tenant-configurable:

- 2-of-3
- N-of-M
- unlimited approver sets by policy

## 6. Asset and Currency Model

- multi-token payouts supported
- optional pre-payout conversion/swap path
- optional fiat off-ramp integrations where configured

## 7. Payroll Formulas

Batch gross payroll:

\[
B = \sum_{i=1}^{n} payout_i
\]

Funding requirement:

\[
FundingRequired = B + Fees_{protocol} + Fees_{rail} + Reserve_{retry}
\]

Unspent after run:

\[
Unspent = FundingRequired - \sum SuccessPayouts - ConsumedFees
\]

## 8. Privacy and Visibility Model

Recipient-level data is visible only to authorized enterprise roles and recipient-specific access paths. All privileged access events are logged for audit.

## 9. Employee Portal Requirements

- payslip view and export
- payment status and proof-of-payment
- transaction history
- tax export artifacts

## 10. Status Matrix

| Capability | Status |
|---|---|
| Enterprise control-plane primitives | Implemented (partial) |
| Full payroll batch domain model | In Progress |
| Approval policy engine | Target |
| Employee portal | Target |
| Retry/reclaim orchestration | Target |
| Multi-rail payout adapters | Target |

## 11. Open Decisions

- payout finality policy (instant vs scheduled windows)
- default failure retry strategy
- reclaim authority model
- off-ramp partner routing policy

