# Phantom Engineering Execution Tracker

Last updated: 2026-04-02

This tracker converts the master spec into executable engineering work. Each item includes acceptance criteria so delivery can be verified.

## 1. Current Priority Order

1. Canonicalization and correctness hardening
2. Banking SaaS foundation
3. Payroll SaaS completion
4. SDK formalization
5. Confidential matching replacement

## 2. Workstreams

## WS-1: Canonical contract and config alignment

### Tasks

- [ ] Select canonical deployed contract family for active environments.
- [ ] Create environment profile matrix (`dev/test/staging/prod`) mapping contract addresses and features.
- [ ] Remove/mark legacy conflicting config paths in runtime selection flow.
- [ ] Add startup validation for parameter consistency (policy vs configured constants).

### Acceptance Criteria

- Single canonical deployment profile used by backend by default.
- Runtime `/config` output includes profile id and feature flags.
- No ambiguous address resolution in backend runtime config.

## WS-2: Parameter normalization

### Tasks

- [ ] Add structured parameter config object in backend (protocol/economic/policy groups).
- [ ] Expose read-only parameter endpoint.
- [ ] Validate DEX/internal fee policy target values at startup.
- [ ] Add tests for parameter parsing and fallback logic.

### Acceptance Criteria

- Policy values are centrally loaded and traceable.
- Test confirms no conflicting parameter source precedence.

## WS-3: Protocol invariants test suite

### Tasks

- [ ] Add tests for commitment/nullifier derivation consistency.
- [ ] Add tests for join-split conservation equation validation.
- [ ] Add tests ensuring public input ordering is contract-backend consistent.
- [ ] Add nullifier replay rejection tests.

### Acceptance Criteria

- Invariant suite passes in CI/local.
- Regression tests fail when invariant logic is mutated.

## WS-4: Banking SaaS foundation

### Tasks

- [ ] Define tenant schema and tenant isolation middleware.
- [ ] Implement secure account mapping interface (non-predictable derivation placeholder with strict interface).
- [ ] Implement role-based policy scaffolding and audit trail pipeline.
- [ ] Add regulator/export policy-gated endpoint skeletons.

### Acceptance Criteria

- Tenant-scoped data access is enforced in API layer.
- Audit entries are created for privileged actions.

## WS-5: Payroll SaaS execution engine

### Tasks

- [ ] Define payroll batch schema and validation.
- [ ] Implement configurable approval workflow (`N-of-M`).
- [ ] Implement payout execution states (`queued/running/partial/completed/failed`).
- [ ] Implement retry/reclaim/unspent logic.
- [ ] Implement employee record endpoints (payslip/proof/tax export metadata).

### Acceptance Criteria

- End-to-end payroll integration test passes from upload to completion.
- Partial failure scenario produces deterministic reconciliation.

## WS-6: SDK v1 baseline

### Tasks

- [ ] Define TypeScript SDK package structure and typed models.
- [ ] Implement core wrappers (deposit/swap/withdraw/proof job/status).
- [ ] Implement payroll and reporting modules.
- [ ] Publish versioning policy and changelog format.

### Acceptance Criteria

- SDK integration sample app executes core flows.
- API contract tests verify typed compatibility.

## WS-7: Confidential matching replacement

### Tasks

- [ ] Select target confidential execution architecture.
- [ ] Replace deterministic mock matching path.
- [ ] Add correctness + privacy boundary tests.
- [ ] Document operational assumptions and failure handling.

### Acceptance Criteria

- `/fhe` path no longer mock-only.
- Architecture and limits documented in technical docs.

## 3. Quality Gates

Before moving workstream states to complete:

- [ ] Tests added and passing
- [ ] Docs updated (`TECHNICAL_MASTER_SPEC` + relevant product spec)
- [ ] Runtime config behavior verified
- [ ] Security review checklist run

## 4. Change Log

- 2026-04-02: Initial tracker created.

