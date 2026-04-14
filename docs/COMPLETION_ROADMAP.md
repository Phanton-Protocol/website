# Phantom — Completion Roadmap (Step-by-Step)

Last updated: 2026-04-02

Work in order. Each phase has a clear “done” check.

## Phase 0 — Already started

- [x] Canonical architecture docs (`docs/CANONICAL_ARCHITECTURE.md`, `TECHNICAL_MASTER_SPEC.md`)
- [x] Parameter registry + backend `/parameters` + `config/canonicalProfiles.json`
- [x] Config mismatch warnings: startup log + `configWarnings` on `GET /config`, `configWarningCount` on `GET /health`
- [ ] Profile selection docs for operators (runbook)

**Done when:** one profile per env, `/config` + `/parameters` match deployed contracts.

---

## Phase 1 — Protocol correctness hardening

- [ ] Invariant tests: commitment/nullifier, public input order, conservation
- [ ] Align fee math everywhere with `RUNTIME_PARAMS` / on-chain policy
- [ ] Single canonical contract line documented; deprecate stray addresses in README

**Done when:** `npm test` or `node scripts/...` green for crypto invariants.

---

## Phase 2 — Relayer & enterprise hardening

- [ ] Rate limits, SEE, enterprise keys: document + integration tests
- [ ] Validator path smoke tests (optional validators)

**Done when:** production checklist passes + smoke script covers critical paths.

---

## Phase 3 — Payroll product (no HRIS yet)

- [ ] Harden `enterpriseRoutes` payroll: idempotency, states, reconciliation fields
- [ ] Employee portal API stubs (payslip metadata, export) — schema first
- [ ] HRIS connectors: **later phase** (Workday/ADP/etc. need OAuth apps per vendor)

**Done when:** payroll run lifecycle is testable end-to-end via API without HRIS.

---

## Phase 4 — Banking SaaS skeleton

- [ ] Tenant middleware + tenant id on enterprise routes
- [ ] Audit event schema unified
- [ ] Account-mapping interface (HSM stub for local dev)

**Done when:** multi-tenant requests are isolated in code paths.

---

## Phase 5 — Confidential matching / FHE (local testing, no AWS node purchase)

See `docs/FHE_LOCAL_TESTING.md`. Summary:

- **No AWS required:** run FHE or “crypto real” service on your laptop via Docker or WSL2.
- **Order:** wire API contract first → plug real library behind `FHE_SERVICE_URL` → then optimize.

**Done when:** encrypt → match → result round-trip works in CI or local script against the service.

---

## Phase 6 — SDK package

- [ ] Extract typed client from `phantomApi.js` patterns into `packages/sdk` (or `sdk/`)
- [ ] Version + changelog

**Done when:** external sample app can call deposit/swap/payroll flows.

---

## Phase 7 — Polish

- [ ] Deployment runbooks per profile (public vs bank-private)
- [ ] External audit prep checklist (artifacts, commit hash, scope)

---

## How we work “1 by 1”

1. Pick the next unchecked item in the current phase.
2. Implement + test.
3. Update this file checkbox + `ENGINEERING_EXECUTION_TRACKER.md`.
4. Only then move to the next item.
