# Phantom Canonical Architecture

Last updated: 2026-04-02

This document is the canonical architecture reference for Phantom Phase 1 alignment. It defines the target system decomposition and marks each domain as Implemented, In Progress, or Target.

## 1. System Decomposition

Phantom is defined as four coordinated layers:

1. Protocol Core
2. Banking SaaS
3. Payroll SaaS
4. SDK Platform

These are separate product domains with shared infrastructure.

## 2. Protocol Core (Canonical)

### Scope

- Note-commitment privacy model
- Nullifier-based double-spend prevention
- Incremental commitment tree
- zk-proof verification for state transitions
- Relayer-assisted transaction submission

### Core formulas (reference path)

\[
h_1 = MiMC7(assetId, amount),\quad
h_2 = MiMC7(h_1, blindingFactor),\quad
cm = MiMC7(h_2, ownerPublicKey)
\]

\[
nf = MiMC7(cm, ownerPublicKey)
\]

\[
inputAmount = swapAmount + changeAmount + protocolFee + gasRefund
\]

### Status

- Implemented: commitment/nullifier/merkle/proof pipeline (reference deployment path)
- In Progress: parameter normalization and single-source config
- Target: production-grade confidential internal matching

## 3. Banking SaaS (Canonical)

### Scope

- Multi-tenant institutional platform
- Per-bank pool/ledger domains
- Internal account mapping to blockchain rails
- Intra-bank transfer updates and inter-bank settlement workflows
- Compliance, audit, and regulator disclosure interfaces

### Critical security rule

Account numbers must not map to predictable public addresses. Address derivation must use HSM-bound secret material and tenant isolation.

### Status

- Implemented: partial enterprise control-plane components in backend
- In Progress: canonical tenant/account/security model docs
- Target: full institutional deployment profile with HSM and policy engine

## 4. Payroll SaaS (Canonical)

### Scope

- Global payroll operations for organizations
- CSV/API batch ingestion
- Configurable approval thresholds
- Multi-token disbursement and optional conversion rails
- Failed payout retry/reclaim handling
- Employee portal for records and exports

### Status

- Implemented: partial enterprise API surface
- In Progress: full payroll domain model and execution lifecycle spec
- Target: end-to-end payroll orchestration product

## 5. SDK Platform (Canonical)

### Scope

- Programmatic access to protocol and SaaS features
- Note helpers, transaction wrappers, proof orchestration
- Payroll and compliance client APIs
- Event/webhook integration

### Status

- Implemented: frontend/backend internal APIs
- In Progress: formal SDK contract and typed surface
- Target: public versioned SDK with multi-language roadmap

## 6. Shared Infrastructure

- Identity, authN/authZ, policy engine
- Observability, audit logging, and incident controls
- Environment/profile management
- Deployment topology (public relayer and private enterprise profiles)

## 7. Non-Canonical Items

The repository contains legacy and experimental variants. They are useful for R&D but are non-canonical for primary architecture claims unless explicitly promoted by architecture decision updates.

## 8. Change Control

All architecture changes should update:

- `docs/CANONICAL_ARCHITECTURE.md`
- `docs/PARAMETERS.md`
- impacted product spec documents

