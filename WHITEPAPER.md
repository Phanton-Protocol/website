Phantom Protocol  
Technical Whitepaper (Draft)

Last updated: 2026-04-02

This document is written as a protocol paper: it separates **what is specified** from **what is implemented today**. Where the repository currently contains mocked components (e.g., the current `/fhe` matching router), this is stated explicitly.

## Abstract

Phantom Protocol is a multi-asset shielded pool with a relayer-based transaction submission model. Users hold private “notes” that represent balances inside the pool; on-chain state consists of note commitments, a commitment-tree root, and spent-note nullifiers. User operations (deposit, swap, withdraw) are authorized by a zero-knowledge proof that enforces membership, nullifier uniqueness, and value conservation while hiding note plaintext. Relayers submit proofs and calldata, providing a separation between users and on-chain transaction senders. The system also includes operational modules used in deployments: (i) a typed-data intent format (EIP-712) used by the relayer backend, (ii) an enterprise API surface protected by an API key, and (iii) an optional “SEE” attestation gate for sensitive flows. This paper specifies the cryptographic model and transaction flows, and documents current implementation boundaries.

## Reader’s guide

This whitepaper is organized to support two audiences:

- **Protocol readers** (cryptography, smart contracts): start at §3–§7 and §11.
- **Builders and operators** (integrators, relayers): start at §7–§10.

Throughout, we use the following tags:

- **Specified**: normative behavior required for protocol correctness.
- **Implemented**: behavior present in this repository as of the last updated date.
- **Optional**: deployment-controlled or out-of-protocol module.

## Table of contents

1. Introduction
2. System model and goals
3. Preliminaries and notation
4. Architecture overview
5. Data model: notes, commitments, nullifiers
6. State: commitment tree and nullifier set
7. Proof system and join-split statement
8. Protocol flows
   - 8.1 Deposit
   - 8.2 Swap
   - 8.3 Withdraw
   - 8.4 Batch operations (payroll-style)
9. Relayers and transaction submission
10. Backend API surface (implemented)
11. Operational modules (enterprise API, SEE gate)
12. Economics and fees (parameterized)
13. Security considerations and threat model
14. Deployment and configuration
15. Glossary
16. References

## 1. Introduction

Public ledgers make value movement observable by default. Phantom Protocol is designed for cases where a user or organization wants:

- to move value without publishing per-user balances and transfer graphs, while
- still settling against a public execution environment.

The design follows the “note commitment + nullifier + Merkle membership proof” pattern used by shielded protocols (Zcash-style constructions) and private-execution systems (Aztec-style client-side proving with on-chain verification).

### 1.1 What observers learn

**Specified.** For transactions that update private state, on-chain observers learn:

- the current commitment-tree root before the state transition,
- the new commitments appended by the transition (as hashes),
- the nullifiers corresponding to consumed notes (as hashes),
- and any explicitly public outputs (e.g., a withdrawal recipient and amount).

They do **not** learn note owners, note plaintext amounts inside the pool, or which commitment corresponds to which user, beyond what is explicitly made public (notably: deposits from an EOA are public funding events).

### 1.2 State transitions

**Specified.** A shielded pool update is a single state transition: it consumes a set of input notes (by revealing their nullifiers), appends a set of output commitments to the accumulator, and advances the commitment-tree root. The pool contract accepts the transition only if the transaction carries a valid zero-knowledge proof \(\pi\) and public inputs \(x\) for the join-split statement (exact arity and public input layout are fixed by the deployed circuit).

The proof and on-chain checks together require:

- **Merkle membership**: for each consumed note, the corresponding commitment is included under the declared historical root \(\mathsf{root}\) (the witness recomputes membership along the tree’s compression function).
- **Nullifier correctness**: each published nullifier is derived from the spent note and owner secrets according to the domain-separated rule encoded in the circuit, and is bound to the same witness as the input commitments.
- **Output well-formedness**: each new note is represented by a commitment consistent with the circuit’s note encoding (asset identifier, amount, per-note randomness, and owner binding).
- **Value conservation**: for each asset (and any fee or public leg the statement exposes), inputs, outputs, and explicit public flows balance as required by the circuit; assets cannot be created inside the shielded transition.
- **Single-spend**: no nullifier in the transaction may already appear in the on-chain nullifier set; after execution, the contract records the new nullifiers so they cannot be reused.

On-chain enforcement is standard: the verifier contract checks \(\mathrm{Verify}(vk, \pi, x)\), validates auxiliary consistency rules (e.g. root progression, nullifier insertion), and reverts otherwise. Detailed constraints and witness layout are specified in §7 and the protocol flows in §8.

### 1.3 Design constraints (practical)

The protocol is built under practical constraints:

- EVM execution costs require succinct verification (pairing-based verification) and efficient state updates.
- Client UX motivates delegated submission via relayers and server-side synchronization APIs.
- Production deployments may enforce operational safeguards (rate limiting, API keys, attestation gates).

## 2. System model and goals

### 2.1 Parties

- **Users**: hold note secrets and request operations.
- **Relayers**: submit transactions on-chain and may charge a fee.
- **Pool contract(s)**: maintain a commitment-tree root and a nullifier set; verify proofs; move assets.
- **Backend services**: generate proofs (or coordinate proof generation), serve quotes, and provide operational APIs.

### 2.2 Goals

- **Correctness**: assets cannot be created; spent notes cannot be spent twice.
- **Ledger privacy**: observers learn only the public inputs (roots, nullifiers, and any explicitly public amounts).
- **Composable settlement**: swaps can route via public DEX adapters or via internal mechanisms.
- **Operational separation**: a relayer can submit without learning note secrets.

### 2.3 Non-goals

- **Perfect network-layer anonymity**: this paper does not claim protection against global network observers.
- **Censorship resistance guarantees**: a relayer can censor; multi-relayer designs mitigate this operationally.
- **Universal compliance**: optional screening/attestation modules are deployment choices, not cryptographic guarantees.

## 3. Preliminaries and notation

Let:

- \(H(\cdot)\) be a collision-resistant hash (instantiated in-circuit as needed).
- \(\mathrm{MerkleHash}(\cdot,\cdot)\) be the compression function used in the commitment tree.
- \(\mathrm{PRF}_k(\cdot)\) be a keyed pseudorandom function used to derive nullifiers.

For a zk system, we use the standard interface:

- \(\pi \leftarrow \mathrm{Prove}(pk, w, x)\)
- \(b \leftarrow \mathrm{Verify}(vk, \pi, x)\)

where \(x\) are public inputs and \(w\) are witness values.

### 3.1 Conventions

- Concatenation is written \(\|\).
- \(\mathbb{F}\) denotes the field used by the circuit.
- All integers are interpreted as field elements only when explicitly reduced modulo the field prime.
- “Collision resistance” and “PRF security” are understood in the standard cryptographic sense.

### 3.2 Hash/PRF instantiation notes

**Specified.** The protocol requires at least one hash that is efficient inside the circuit. Implementations commonly use algebraic hashes (MiMC, Poseidon, Rescue). The exact choice affects proving cost and on-chain verification assumptions.

**Implemented.** The backend codebase includes a MiMC implementation (`mimc7`) used in certain codepaths. The circuits referenced in `circuits/` determine the authoritative instantiation.

## 4. Architecture overview

### 4.1 Components

The Phantom system consists of:

- **Shielded pool contracts**: hold assets and enforce state transitions by verifying zk proofs and maintaining nullifiers and a commitment-tree root.
- **DEX adapter (optional)**: a contract that performs a public swap via an AMM router for the DEX route.
- **Relayer(s)**: submit pool transactions and pay gas, receiving reimbursement/fees depending on deployment policy.
- **Backend services**: provide proof generation, chain state synchronization, quotes, and operational endpoints.
- **Client application**: constructs requests, holds note secrets, and orchestrates proving/submission through relayers.

### 4.2 Data and control flow (high level)

**Specified.**

1. User chooses an action (deposit/swap/withdraw).
2. User (or wallet software) selects input notes and constructs an action request.
3. A prover generates a proof \(\pi\) for the join-split statement with public inputs \(x\).
4. A relayer submits \((\pi, x, \text{calldata})\) to the pool contract.
5. The pool verifies \(\pi\), checks nullifiers are unused, updates root/commitments, and transfers any public outputs.

**Implemented.** The repository currently follows this model with an Express backend and a set of REST endpoints; proof generation uses `snarkjs` in codepaths and circuit artifacts in `circuits/`.

## 5. Data model: notes, commitments, nullifiers

### 5.1 Notes

A note represents a private claim on value inside the pool. At minimum, a note contains:

\[
n := (\text{assetId}, v, \rho, \mathsf{owner})
\]

where \(v\) is the amount, \(\rho\) is per-note randomness, and \(\mathsf{owner}\) is information that allows only the owner to spend (e.g., a public key binding or address binding, depending on the circuit design).

### 5.2 Commitments

Each note is represented on-chain by a commitment \(cm\). A generic form is:

\[
cm := H(\text{assetId} \,\|\, v \,\|\, \rho \,\|\, \mathsf{owner})
\]

The concrete instantiation must be compatible with the proving system (e.g., MiMC/Poseidon inside circuits).

### 5.3 Nullifiers

To prevent double-spends, spending a note publishes a nullifier \(nf\) that is deterministic for that note and spend context:

\[
nf := \mathrm{PRF}_{sk_\mathsf{nf}}(\rho \,\|\, \text{domain})
\]

where \(sk_\mathsf{nf}\) is a spending secret known to the note owner, and \(\text{domain}\) domain-separates nullifiers across contexts (e.g., pool instance, chain id, or action type).

The protocol requires that:

- a valid spend produces exactly one \(nf\) for the consumed note under the chosen domain, and
- the on-chain nullifier set rejects repeats.

## 6. State: commitment tree and nullifier set

### 6.1 Commitment tree

The pool maintains an append-only Merkle tree over commitments. Let the tree have fixed depth \(d\). Insertions append new leaves in order. A transaction proves membership of an input commitment \(cm_\text{in}\) by providing a Merkle path whose recomputed root equals the public input \(\mathsf{root}\).

**Specified (tree capacity and rollover).** For a fixed-depth tree, capacity is \(2^d\) leaves. If the active tree reaches capacity, new commitments MUST NOT be appended to that tree. Deployments MUST either:

- use a preconfigured larger fixed depth for the next deployment/circuit set, or
- open a new tree epoch (new tree identifier) and continue appends there.

Historical roots remain valid anchors for spends subject to the deployment's accepted-root policy. In multi-tree deployments, a spend references the corresponding root (and tree identifier if encoded by the circuit/public inputs).

### 6.2 Nullifier set

The pool maintains a set (or tree) of spent nullifiers. A transaction is valid only if its nullifier is not already present.

## 7. Proof system and join-split statement

Phantom’s core zk statement is a join-split style constraint system. The exact arity (number of inputs/outputs) is a circuit choice; the security properties require at least:

- membership for each input note,
- nullifier correctness for each input note,
- output commitment correctness, and
- value conservation up to explicit fees and public deltas.

### 7.1 Public inputs

At minimum:

\[
x := (\mathsf{root}, nf_1,\dots,nf_k, cm^\text{out}_1,\dots,cm^\text{out}_m, \Delta_\text{public})
\]

where \(\Delta_\text{public}\) captures any explicitly public value movement (e.g., an on-chain withdrawal amount).

### 7.2 Witness

\[
w := (\text{input notes}, \text{Merkle paths}, sk_\mathsf{nf}, \rho\text{’s}, \text{output note secrets}, \text{fee parameters})
\]

### 7.3 Constraints

For each input note:

- **Membership**: \(\mathrm{MerkleRoot}(cm_\text{in}, path) = \mathsf{root}\)
- **Nullifier**: \(nf = \mathrm{PRF}_{sk_\mathsf{nf}}(\rho \,\|\, \text{domain})\)

For outputs:

- **Commitment correctness**: \(cm^\text{out}_i = H(\cdots)\)

For value conservation (single-asset illustrative form):

\[
\sum v_\text{in} = \sum v_\text{out} + \mathsf{fee}_\text{protocol} + \mathsf{fee}_\text{relayer} + \Delta_\text{public}
\]

Multi-asset variants either restrict a join-split to a single asset per action, or enforce conservation per-asset inside the circuit.

### 7.4 Public inputs by action type

**Specified.** The join-split statement must include enough public inputs for the contract to update state deterministically:

- \(\mathsf{root}\): a recent commitment-tree root (anchor).
- \(nf_i\): nullifiers for each consumed note.
- \(cm^\text{out}_j\): commitments for newly-created notes appended to the tree.
- Any public transfer outputs (recipient, token, amount) for withdrawals.
- Any public DEX route parameters required by a swap adapter (depending on design).

**Implemented.** The exact public input ordering and calldata encoding are determined by the circuit and verifier contract deployed for a given network.

### 7.5 Verification on-chain

**Specified.**

On receiving a transaction, the pool contract must:

1. verify the zk proof for the given public inputs,
2. check each \(nf_i\) is not already spent,
3. mark each \(nf_i\) as spent, and
4. append each \(cm^\text{out}_j\) into the commitment tree, updating the root accordingly,
5. execute any public transfers (withdraw) and/or invoke adapters (DEX swap) only after proof verification.

## 8. Protocol flows

This section describes the high-level flows. Concrete calldata formats and endpoints are documented in code; the cryptographic requirements are as in §7.

### 8.1 Deposit

User deposits an asset into the pool and creates a new note commitment \(cm\) inserted into the tree. The user stores the corresponding note secret material locally (or in an encrypted wallet store).

If a relayer submits the deposit transaction on behalf of a user, the relayer learns the public deposit parameters visible on-chain, but does not learn the note secret material.

#### 8.1.1 Deposit (formalized)

**Specified.** A deposit creates one new note \(n_\text{out}\) and commitment \(cm_\text{out}\) with:

\[
cm_\text{out} = H(\text{assetId}, v, \rho, \mathsf{owner})
\]

and appends \(cm_\text{out}\) to the commitment tree. Deposits are public funding events and therefore do not provide anonymity with respect to the funding address; they serve to increase the anonymity set for subsequent private spends inside the pool.

### 8.2 Swap

Two swap modes are supported at the system level:

- **DEX route (public execution)**: a swap adapter performs a public swap (e.g., via an AMM router). The join-split proves the user’s spend and produces output commitments reflecting the swap result and change.
- **Internal matching (optional module)**: a matching service can pair opposite orders and settle inside the pool via proof-authorized state updates.

The repository currently includes a matching router under `/fhe` that accepts “encrypted” payloads for UX purposes; its current implementation is explicitly a deterministic/mock placeholder and should not be treated as a cryptographic FHE construction.

#### 8.2.1 DEX route (public execution)

**Specified.** A DEX-route swap consists of:

- consuming one or more input notes,
- invoking a public swap adapter to exchange assets held by the pool, and
- creating output notes that represent the swap result (and any change).

The join-split constraints must ensure that the user-authorized spend covers:

- the input asset amount routed to the adapter,
- any protocol fee deducted by the pool,
- and any relayer fee or gas reimbursement policy (if encoded in-circuit).

#### 8.2.2 Internal matching (optional module)

**Optional.** Internal matching can be modeled as a two-party join-split: two users each spend an input note in one asset and receive an output note in the other asset. The protocol can support this as a special case of the join-split statement, without invoking an external DEX.

**Implemented (current repo state).** The `/fhe` routes implement:

- `POST /fhe/encrypt`: returns an opaque payload for UI purposes,
- `POST /fhe/order`: registers an “encrypted” order and may match it against a reverse pair in memory,

but do not implement homomorphic encryption or any cryptographic confidentiality guarantees.

### 8.3 Withdraw

A withdraw consumes a note and produces:

- a nullifier \(nf\) recorded on-chain, and
- a public asset transfer from the pool to a recipient.

The proof enforces that the withdrawn value is covered by the note(s) and fees.

#### 8.3.1 Withdraw (formalized)

**Specified.** A withdrawal makes a public transfer from pool custody to a recipient, while keeping the provenance of funds private inside the pool. The public output includes at least:

- recipient address \(r\),
- token/asset identifier,
- amount \(a\).

The proof must ensure \(a\) is covered by the spent notes under the protocol’s fee rules.

### 8.4 Batch operations (payroll-style)

**Optional.** A “payroll run” is a batch of withdrawals executed over time. It is not a distinct cryptographic primitive: each payout is a normal withdraw proof, and batching is an application-layer orchestration.

**Implemented.** The repository contains enterprise and ledger-related API surfaces; the exact payroll endpoints and storage semantics depend on the enterprise router implementation.

## 9. Relayers and transaction submission

### 9.1 Motivation for relayers

Relayers provide a consistent transaction submission layer:

- users avoid managing per-operation gas funding in the same address that funds deposits,
- applications can route through multiple relayers for uptime,
- operators can apply policy controls (rate limits, allowlists, attestation gates).

### 9.2 Relayer trust model

**Specified.** Relayers must not be able to forge spends: they do not hold note secrets and cannot create valid proofs without the witness. They can, however:

- censor or delay user requests,
- selectively include/exclude transactions,
- observe public metadata (timing, recipient for withdrawals, DEX calldata for public swaps).

### 9.3 Replay protection (backend layer)

**Implemented.** The backend maintains a replay cache with TTL to prevent repeated submission of identical requests within a window.

## 10. Backend API surface (implemented)

This section documents the backend as implemented in `phantom-relayer-dashboard/backend`. It is an integration interface, not a consensus-critical component.

### 10.1 Environment and production gates

**Implemented.** Production startup can be configured to fail if unsafe development bypasses are enabled and if required environment variables are missing. See `PRODUCTION-READY.md` for the enforced gates and required variables.

### 10.2 Key endpoint families (overview)

**Implemented (non-exhaustive).**

- **Health/readiness**: `/health`, `/ready`
- **Relayer metadata**: `/relayer`, staking/status endpoints
- **FHE mock router**: `/fhe/public-key`, `/fhe/encrypt`, `/fhe/order`, `/fhe/health`
- **Enterprise routes**: `/enterprise/*` (also mounted at `/` in the current backend)
- **SEE**: `/see/config`, `/see/verify` and sensitive-flow requirements when enabled

## 11. Operational modules (enterprise API, SEE gate)

The relayer backend uses typed structured data signatures to authenticate user requests and reduce parameter malleability.

### 11.1 Swap intent type (current backend implementation)

In the backend implementation, a swap intent includes fields:

- `nullifier: bytes32`
- `minOutputAmount: uint256`
- `protocolFee: uint256`
- `gasRefund: uint256`
- `deadline: uint256`

These are signed under an EIP-712 domain (name `"ShadowDeFiRelayer"`, version `"1"`, chain id, and verifying contract set to the shielded pool address).

The intent signature is an authentication and anti-tampering mechanism for relayer coordination; it is not, by itself, a privacy mechanism.

### 11.2 Enterprise API key protection

The backend supports an enterprise API surface that can require an `X-Enterprise-API-Key` header when configured.

### 11.3 SEE attestation gate

Deployments can require a “SEE” attestation for sensitive endpoints (deposit/swap/withdraw). The current backend verifies an attestation document and signature (HMAC-based) under shared-secret configuration.

These modules affect **who is allowed to request a transaction via the backend**; they do not change the on-chain zk statement.

## 12. Economics and fees (parameterized)

This section defines a fee model in a parameterized way. Deployments should publish their current parameters as configuration and/or on-chain constants.

### 12.1 Fee parameters

Let:

- \(\phi_\text{deposit}\): a deposit fee (could be flat or proportional).
- \(\phi_\text{swap}\): a swap fee rate (basis points).
- \(\phi_\text{relayer}\): a relayer fee (flat or proportional).

### 12.2 Where fees are charged

**Specified.**

- Deposit fees are public at deposit time.
- Swap fees may be accounted inside the join-split constraints (deducted from outputs) or via explicit on-chain accounting.
- Withdrawal fees may be charged similarly.

**Implemented.** The repo contains configuration and enterprise surfaces related to fees and operational accounting; the authoritative economic parameters for a given deployment must be defined by the deployed contracts and backend config.

## 13. Security considerations and threat model

### 13.1 Adversaries

- **Chain observer**: sees all calldata, events, and state roots.
- **Malicious relayer**: can censor, reorder, and front-run within the limits of public information.
- **Compromised backend**: can exfiltrate user-provided secrets if the client submits them; can deny service; can lie in API responses.
- **Smart contract attacker**: attempts to exploit state update bugs, verifier bugs, or reentrancy.

### 13.2 Core security claims (conditional)

**Specified.** Assuming:

- zk soundness,
- correct circuit constraints,
- binding commitments and collision-resistant hashes,
- correct contract verification and state updates,

then:

- double-spending is prevented by nullifier uniqueness,
- value cannot be created from nothing (conservation),
- note owners and internal transfer graphs remain private except for explicitly public outputs.

### 13.3 Privacy limits

- Deposits are public funding events.
- Withdrawals are public recipient/amount events.
- Timing, gas usage, and public swap adapter calls leak metadata.

## 14. Deployment and configuration

This section is a checklist-style summary of operational configuration surfaces.

**Implemented.**

- `RPC_URL`, `CHAIN_ID`, `SHIELDED_POOL_ADDRESS`, `RELAYER_PRIVATE_KEY`
- `CORS_ORIGINS`
- `DEV_BYPASS_VALIDATORS`, `DEV_BYPASS_PROOFS` (blocked in production per the production readiness gates)
- `SEE_MODE`, `SEE_SHARED_SECRET` (when SEE enabled)
- `ENTERPRISE_API_KEY` (to protect enterprise endpoints when set)

## 15. Glossary

- **Note**: private record representing value inside the pool.
- **Commitment (cm)**: hash committed on-chain representing a note.
- **Nullifier (nf)**: hash committed on-chain when a note is spent, preventing double spend.
- **Anchor / root**: commitment-tree root used as a membership reference point.
- **Join-split**: circuit pattern that consumes notes and creates new notes under conservation constraints.
- **Relayer**: third party that submits transactions; does not have note secrets.
- **SEE**: deployment module that can gate sensitive requests behind an attestation check.

## 16. References

This repository includes:

- A relayer backend (`phantom-relayer-dashboard/backend`) implementing:
  - EIP-712 typed-data domains and intent types
  - proof generation plumbing (using `snarkjs` in codepaths; circuits and keys are referenced from `circuits/`)
  - validator-network coordination (optional)
  - enterprise routes and SEE gating
  - a `/fhe` router containing mocked “encryption” and order matching for development UX
- A frontend that calls backend endpoints (e.g., `src/api/phantomApi.js`) including `/fhe/public-key`, `/fhe/encrypt`, `/fhe/order`.

Any claim of “FHE-secured intent privacy” requires a concrete, audited cryptographic instantiation. The present `/fhe` router is not such an instantiation.

