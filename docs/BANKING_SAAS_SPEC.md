# Phantom Banking SaaS Specification (Phase 1 Foundation)

Last updated: 2026-04-02

## 1. Purpose

Phantom Banking SaaS is a separate product line for banks, neobanks, custodians, and government/central-bank-connected financial networks. It provides tenant-isolated private settlement and policy-controlled disclosure over Phantom protocol rails.

## 2. Product Boundary

This system is not Payroll SaaS. Banking SaaS covers:

- customer account-linked crypto rails
- internal bank transfer updates
- inter-bank settlement workflows
- compliance and regulator reporting operations

## 3. Core Actors

- Bank tenant administrators
- Treasury operators
- Compliance officers
- Auditors
- Regulator/reporting authorities (policy-gated access)
- End customers (deposit/withdraw users)

## 4. Functional Model

### 4.1 Tenant isolation

Each bank is a tenant with isolated policy, key, and account domains.

### 4.2 Account-linked deposit flow

1. Customer sends funds to bank-linked intake address.
2. Ingestion service validates source and policy.
3. Customer ledger/note state updates in real time.
4. Settlement pool state remains verifiable on protocol rails.

### 4.3 Internal transfer model

Intra-bank transfers update private ledger state and note ownership/value attribution according to bank policy. This is modeled as internal state transition rather than always requiring visible bilateral public transfers.

### 4.4 Inter-bank settlement model

Inter-bank value movement is executed through explicit settlement workflows (gross or net), with policy, reconciliation, and audit controls.

## 5. Security and Key Management

### 5.1 Mandatory rule

Do not derive public addresses directly from customer account numbers.

### 5.2 Required derivation model

\[
addr = Derive(HSM\_secret,\ tenantSalt,\ accountInternalId,\ rotationNonce)
\]

### 5.3 Access model

- role-based access control
- maker-checker workflow
- threshold approvals for sensitive actions
- immutable audit trail for privileged actions

## 6. Compliance and Disclosure

- sanctions and risk policy integration
- case management for flagged flows
- policy-driven selective disclosure
- regulator export packs with audit trail references

## 7. Data Model (High Level)

- tenant
- customer account
- virtual deposit endpoint mapping
- internal balance state
- note references
- settlement instructions
- disclosure records

## 8. Deployment Profiles

- Hosted SaaS profile
- Dedicated enterprise deployment profile
- Bank-managed infrastructure profile (future)

## 9. Status Matrix

| Capability | Status |
|---|---|
| Tenant isolation concept | In Progress |
| Enterprise API controls | Implemented (partial) |
| Full banking account mapping service | Target |
| HSM-enforced derivation and signing | Target |
| Regulator disclosure workspace | Target |
| Inter-bank settlement orchestrator | Target |

## 10. Open Decisions

- gross vs net settlement default
- settlement cycle policy
- jurisdiction-specific data residency controls
- mandatory vs optional HSM profile at launch

