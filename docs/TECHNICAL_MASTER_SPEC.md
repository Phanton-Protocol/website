# Phantom Technical Master Spec

Last updated: 2026-04-02

This is the canonical technical reference for developers. It is intentionally strict: no claims beyond what is verifiable in code are marked as implemented. Planned architecture is included in separate sections with explicit status.

## 1. Purpose

This document defines:

- the current implementation baseline
- target architecture for full system completion
- hard requirements for correctness and security
- phased engineering execution criteria

Primary related documents:

- `docs/CANONICAL_ARCHITECTURE.md`
- `docs/PARAMETERS.md`
- `docs/BANKING_SAAS_SPEC.md`
- `docs/PAYROLL_SAAS_SPEC.md`
- `docs/SDK_SPEC.md`

## 2. Status Conventions

- `Implemented`: present in repository code paths
- `In Progress`: partially implemented or inconsistent across versions
- `Target`: required for final production-grade system

## 3. Repository Domains

- `phantom-relayer-dashboard/backend`: relayer/API/proof orchestration backend
- `contracts-recovered/contracts`: solidity contract families and libraries
- `src` and `frontend`: UI and client-side integration paths
- `circuits` and `phantom-relayer-dashboard/circuits`: proof artifacts and witnesses

## 4. Current Implemented Technical Baseline

### 4.1 Cryptography and proving

- Commitment/nullifier/merkle reference path uses MiMC7 over BN254 field.
- Join-split proving path uses Groth16 with 9 public signals.
- Backend proving fallback order:
  - rapidsnark (if configured)
  - `@zk-kit/groth16`
  - `snarkjs.groth16.fullProve`

### 4.2 Core state model

- Commitments stored in incremental Merkle structure.
- Nullifiers tracked in mapping/set style.
- Join-split conservation checks are enforced in backend input shaping and handler logic.

### 4.3 Operational backend controls

- environment-gated production readiness checks
- rate limiting
- enterprise key protection surfaces
- SEE-gated sensitive endpoint mode

### 4.4 Internal matching service status

- `/fhe` service currently provides deterministic/mock behavior for integration flow.
- It is not a production confidential matching cryptographic implementation.

## 5. Target Full-System Architecture

### 5.1 Protocol Core (Target)

- single canonical contract line and deployment profile
- normalized parameter management across all environments
- fully documented zk input/output schema and invariants
- consistent verifier and circuit provenance records

### 5.2 Banking SaaS (Target)

- tenant-isolated bank domains
- secure account mapping service (HSM-based derivation)
- policy-driven regulator disclosure
- inter-bank settlement orchestration

### 5.3 Payroll SaaS (Target)

- batch payroll with configurable approval thresholds
- multi-token payout and optional conversion rails
- failure reconciliation (retry/reclaim/unspent)
- employee self-service records portal

### 5.4 SDK Platform (Target)

- versioned public SDK with typed interfaces
- protocol/payroll/compliance modules
- signer abstraction for self-custody and managed custody

## 6. Non-Negotiable Engineering Constraints

1. No overclaims in docs or API metadata.
2. One canonical parameter source per environment.
3. No predictable account-number-to-address mapping.
4. All privileged actions must be auditable.
5. Every production claim must map to:
   - code path
   - configuration source
   - test coverage artifact

## 7. Protocol Invariants (Must Hold)

### 7.1 Nullifier uniqueness

Each spend nullifier can be accepted at most once.

### 7.2 Membership soundness

Input commitments must be members of the accepted Merkle root via valid path.

### 7.3 Conservation

\[
inputAmount = swapAmount + changeAmount + protocolFee + gasRefund
\]

for join-split swap path (and equivalent withdraw specialization).

### 7.4 Deterministic public input ordering

Verifier input ordering must remain aligned across:

- circuits
- backend proof generation
- contract verifier adapter

## 8. Parameter Management Rules

Canonical policy values are maintained in `docs/PARAMETERS.md`.

- DEX swap policy target: `0.1%`
- Internal matching policy target: `0.2%`
- Deposit baseline policy: `$2` equivalent

Implementation variants may exist in legacy/test paths but must not be treated as immutable policy.

## 9. Security Requirements for Full Completion

### 9.1 Key and signing

- HSM or equivalent secure signer support for institutional profiles
- threshold approvals for high-risk operations
- signer rotation procedure

### 9.2 Data and access

- tenant isolation guarantees
- role-based access controls
- immutable audit event stream

### 9.3 Confidential execution

- replace mock matching with production confidential execution architecture (chosen primitive documented and tested)

## 10. Testing and Verification Requirements

### 10.1 Protocol layer

- deterministic tests for commitment/nullifier derivation consistency
- verifier/public-input alignment tests
- conservation and nullifier reuse rejection tests

### 10.2 API layer

- auth/policy gate tests
- replay/rate-limit behavior tests
- error taxonomy consistency tests

### 10.3 Product layer

- banking tenant isolation tests
- payroll approval workflow tests
- payout reconciliation tests

## 11. Build Execution Plan (Engineering)

### Phase A: Canonicalization and hardening

- pin canonical contract/deployment path
- enforce parameter source normalization
- add invariant test suite
- publish config compatibility matrix

### Phase B: Banking SaaS foundations

- tenant service and secure account mapping
- policy and disclosure framework
- institutional operator console APIs

### Phase C: Payroll SaaS completion

- batch ingestion engine
- approvals orchestration
- disbursement + reconciliation
- employee records APIs

### Phase D: SDK and integration platform

- TypeScript SDK v1
- language expansion plan implementation
- integration guides and compatibility tests

### Phase E: Confidential matching upgrade

- replace mock execution path
- cryptographic architecture formalization
- performance/security validation

## 12. Definition of Done for “Full System”

The system is considered complete only when:

1. Protocol, Banking SaaS, Payroll SaaS, and SDK all have production-grade implementations.
2. Every critical claim is mapped to code + test + deployment configuration.
3. Security controls and audit trails are verified in runtime environments.
4. Documentation and parameter registry are consistent with deployed behavior.

