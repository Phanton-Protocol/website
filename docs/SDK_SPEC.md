# Phantom SDK Specification (Phase 1 Foundation)

Last updated: 2026-04-02

## 1. Purpose

The Phantom SDK provides a stable developer interface for protocol and product-line features (core protocol, Banking SaaS integrations, and Payroll SaaS workflows).

## 2. Audience

- dApp developers
- enterprise backend teams
- banking integration teams
- payroll platform integrators

## 3. Design Principles

- typed APIs and deterministic behavior
- clear error taxonomy
- network/profile aware configuration
- secure key handling abstractions
- backward-compatible versioning policy

## 4. Core Feature Modules

### 4.1 Note and cryptography helpers

- note model construction helpers
- commitment/nullifier helpers
- serialization/deserialization utilities

### 4.2 Transaction orchestration

- deposit/swap/withdraw wrappers
- proof request orchestration
- relayer submission helpers
- receipt polling and event hooks

### 4.3 Payroll module

- batch upload helpers
- approval state tracking
- payout execution interface
- failed payout reconciliation helpers

### 4.4 Compliance/reporting module

- reporting key workflows
- export retrieval helpers
- policy/attestation support adapters

## 5. API Surface Expectations

- synchronous parameter validation
- async execution methods
- idempotency key support
- structured status objects (`pending`, `confirmed`, `failed`)

## 6. Versioning and Support Policy

- semantic versioning
- deprecation notices per release
- LTS release track for enterprise users

## 7. Language Roadmap

- Phase 1: TypeScript SDK
- Phase 2 target: Python, Java, Go

## 8. Custody and Signing Modes

- self-custody integrations
- managed-signing integrations (enterprise profile)
- signer abstraction interface for HSM/remote signer providers

## 9. Status Matrix

| Capability | Status |
|---|---|
| Internal API wrappers in app code | Implemented (partial) |
| Formal SDK contract | In Progress |
| Public TS package | Target |
| Multi-language SDKs | Target |
| Enterprise signer abstraction | Target |

## 10. Open Decisions

- package naming and namespace standard
- release cadence
- support SLA tiers for enterprise SDK users
- webhook/event delivery guarantees

