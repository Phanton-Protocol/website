# Phantom Protocol Developer Handoff

Last updated: 2026-04-10

This document is a practical handoff for incoming developers. It explains what has been built, how the zk/FHE/relayer paths are wired, what is production-ready now, and what remains to reach full target architecture.

---

## 1) Repository map and ownership

Core domains:

- `src/`  
  Main React app (landing, user dapp, trade/internal matching UI, enterprise pages, e-paper).
- `phantom-relayer-dashboard/backend/src/`  
  Main backend and relayer runtime (proof generation, tx submission, validator quorum, FHE routes, enterprise APIs).
- `contracts-recovered/contracts/`  
  Solidity source set currently used as recovered/canonical-on-repo contract tree.
- `artifacts/contracts/` and `artifacts/build-info/`  
  Compiled artifacts and build metadata.
- `circuits/` and `phantom-relayer-dashboard/circuits/`  
  zk proving artifacts (`.r1cs`, `.zkey`, `.ptau`, `.wasm`, witness generators, circom libs).
- `config/` + `deployments/`  
  Network profiles and deployment manifests.
- `docs/`  
  Canonical architecture and technical status docs.

Primary references that should stay aligned:

- `docs/TECHNICAL_MASTER_SPEC.md`
- `docs/CANONICAL_ARCHITECTURE.md`
- `PRODUCTION-READY.md`
- `LAUNCH-CHECKLIST-BSC.md`

---

## 2) Current architecture (implemented baseline)

At runtime, the system is:

1. React frontend (`src`) calling backend API routes.
2. Backend (`phantom-relayer-dashboard/backend/src/index.js`) coordinating:
   - intent validation and replay checks
   - proof generation
   - optional validator quorum
   - optional threshold-verifier on-chain attestations
   - final contract transaction submission
3. Smart contracts enforcing commitment/nullifier/Merkle + verifier constraints.
4. zk prover artifacts loaded by backend (and optionally client-side helpers).

Conceptual flow:

- User signs operation intent (EIP-712 style checks in backend path).
- Backend shapes circuit inputs and generates Groth16 proof.
- Validators may verify proof and return stake-weighted signatures.
- Backend submits proof + public signals to pool contract handlers.
- Contract verifies proof, checks nullifier uniqueness, and applies state transition.

---

## 3) Smart contracts: what is implemented

### Core pool and handlers

- `contracts-recovered/contracts/core/ShieldedPool.sol`  
  Main pool state machine: commitments/nullifiers/Merkle root interactions and shielded operations.
- `contracts-recovered/contracts/core/DepositHandler.sol`  
  Deposit processing path and callback finalization pattern.
- `contracts-recovered/contracts/core/WithdrawHandler.sol`  
  Withdraw validation + execution helper path.
- `contracts-recovered/contracts/core/SwapHandler.sol`  
  Swap validation + execution helper path.

### Execution and policy dependencies

- `contracts-recovered/contracts/core/PancakeSwapAdaptor.sol`  
  DEX integration for swap route.
- `contracts-recovered/contracts/core/FeeOracle.sol`
- `contracts-recovered/contracts/core/OffchainPriceOracle.sol`  
  Fee and pricing interfaces (with off-chain signer model).
- `contracts-recovered/contracts/core/RelayerRegistry.sol`
- `contracts-recovered/contracts/core/RelayerStaking.sol`  
  Relayer participation and staking economics.
- `contracts-recovered/contracts/core/ComplianceModule.sol`  
  Compliance hooks (current chainalysis query path is not fully production-complete).

### zk verifiers and adapters

- `contracts-recovered/contracts/verifiers/JoinSplitVerifier.sol`
- `contracts-recovered/contracts/verifiers/PortfolioNoteVerifier.sol`
- `contracts-recovered/contracts/core/Groth16VerifierAdapter.sol`
- `contracts-recovered/contracts/core/ThresholdVerifier.sol`
- `contracts-recovered/contracts/core/DecentralizedVerifier.sol`

### FHE and confidential matching families

- `contracts-recovered/contracts/core/FHEEncryptedPool.sol`
- `contracts-recovered/contracts/core/FHECoprocessor.sol`
- `contracts-recovered/contracts/core/FHEValidator.sol`
- `contracts-recovered/contracts/core/FHEAVS.sol`
- `contracts-recovered/contracts/core/ThresholdEncryption.sol`
- `contracts-recovered/contracts/core/InternalMatchingPool.sol`
- `contracts-recovered/contracts/core/MatchingHandler.sol`
- plus adjacent variants (`AdvancedPrivacyPool.sol`, `HybridPrivacyPool.sol`, `AntiAnalysisPool.sol`).

Status note: these FHE/confidential matching contracts include multiple TODO/mock sections and should be treated as in-progress lines, not uniformly production-ready.

---

## 4) zk proofs: how they are currently built and verified

### Artifact locations

- Root-level artifacts:
  - `circuits/joinsplit.r1cs`
  - `circuits/portfolio_note.r1cs`
  - `circuits/joinsplit_0001.zkey`
  - `circuits/portfolio_note_0001.zkey`
  - `circuits/pot14_final.ptau`
  - `circuits/pot19_final.ptau`
- Backend runtime prover artifacts:
  - `phantom-relayer-dashboard/circuits/joinsplit_js/joinsplit.wasm`
  - `phantom-relayer-dashboard/circuits/portfolio_note_js/portfolio_note.wasm`
  - `phantom-relayer-dashboard/circuits/joinsplit_0001.zkey`
  - `phantom-relayer-dashboard/circuits/portfolio_note_0001.zkey`
  - `phantom-relayer-dashboard/circuits/verification_key.json`

### Proving pipeline

Implemented in `phantom-relayer-dashboard/backend/src/zkProofs.js`:

- `generateSwapProof(...)`
- `generateWithdrawProof(...)`
- `generatePortfolioProof(...)`

Prover fallback order:

1. Rapidsnark (if `RAPIDSNARK_PATH` is configured and valid)
2. `@zk-kit/groth16`
3. `snarkjs.groth16.fullProve`

The backend performs heavy input normalization and consistency checks (asset IDs, nullifier/commitment recomputation, conservation alignment, Merkle path formatting), then emits Solidity-formatted proof arrays.

### Verification pipeline

Off-chain verification:

- `phantom-relayer-dashboard/backend/src/validatorNetwork.js` (fan-out + retries)
- `phantom-relayer-dashboard/backend/src/validatorServer.js` (HTTP validator)
- `phantom-relayer-dashboard/backend/src/validatorClient.js` (worker mode)
- `phantom-relayer-dashboard/backend/src/validatorCoordinator.js` (stake-weighted WS coordinator)

On-chain verification:

- Groth16 verifier contracts + adapter contracts
- optional threshold attestation submission before swap/withdraw path

### Important gap

The repo has compiled and runtime artifacts, but canonical editable `.circom` source for main join-split/portfolio circuits is not clearly present in a single source-of-truth location. Regeneration provenance should be tightened before claiming full circuit reproducibility.

---

## 5) Relayer/backend runtime: how it works

Main entrypoint:

- `phantom-relayer-dashboard/backend/src/index.js`

Key behavior implemented:

- Quote, intent, deposit, swap, withdraw, portfolio, merkle, readiness, enterprise endpoints.
- Replay key consumption (in-memory TTL model).
- EIP-712 style signature validation for critical operations.
- Optional encrypted payload endpoints:
  - `/swap/encrypted`
  - `/withdraw/encrypted`
  - `/deposit/encrypted`
- Optional SEE middleware for sensitive routes (`seeGuard.js`).
- Optional validator quorum enforcement.
- Optional on-chain threshold validation relay.

Persistence:

- `phantom-relayer-dashboard/backend/src/db.js`  
  SQLite when available; JSON fallback paths where needed.

FHE route surface:

- `phantom-relayer-dashboard/backend/src/fheMatchingService.js`  
  Provides `/fhe` API surface; supports remote proxy mode (`FHE_SERVICE_URL`) and deterministic local fallback.

Operationally, this means API and relayer flows work end-to-end today, but distributed production hardening (durable queueing, shared replay cache, HA-safe limiter state) is not yet complete.

---

## 6) Frontend: what is implemented

Main routes in `src/App.jsx`:

- `/` landing sections and protocol narrative
- `/user` shielded user console
- `/trade` internal matching variant UX
- `/e-paper` interactive whitepaper page
- `/enterprise/*` enterprise pages (payroll/compliance/audit/governance surfaces)
- `/blog`, `/blog/:slug`, SEO routes

Notable files:

- `src/components/ProtocolUserDapp.jsx`
- `src/components/DAppSection.jsx`
- `src/components/FHEMatching.jsx`
- `src/components/WhitepaperPage.jsx`
- `src/components/WhitepaperDiagrams.jsx`
- `src/lib/clientProver.js`
- `src/config.js`

Current state:

- UI surfaces zk/FHE concepts and operational paths.
- Proof UX supports client/backend paths.
- Relayer status and enterprise panels are integrated.
- E-paper route and navbar/header behavior are production-deployed and recently fixed for heading overlap.

---

## 7) Deployment/config model

Configs and manifests:

- `config/bscTestnet.json`
- `config/bscMainnet.json`
- `config/canonicalProfiles.json`
- `deployments/*.json`

Readiness docs:

- `PRODUCTION-READY.md`
- `LAUNCH-CHECKLIST-BSC.md`

Recent frontend deployment:

- Vercel production alias points to `phantomproto.com`.
- Latest production deployment completed successfully from this repo after heading overlap fix.

---

## 8) What is done vs what is left

### Done (implemented and usable now)

- End-to-end relayer API runtime is functional.
- Groth16 proof generation is integrated with multi-prover fallback.
- Off-chain validator consensus modes exist (HTTP validators and WS coordinator).
- On-chain verifier integration exists for swap/withdraw style paths.
- Core commitment/nullifier/Merkle state machine exists in contract paths.
- Production env safety gates are implemented in backend startup checks.
- Enterprise API surface and health/checklist docs exist.

### Left / in progress (must be finished for full target system)

- FHE confidential matching path is still partially mock/deterministic in default integration.
- Several FHE/advanced contracts include TODO sections and placeholder logic.
- Canonical single contract/deployment profile needs stricter enforcement to avoid variant drift.
- Circuit source provenance/regeneration flow needs canonicalization (editable source + deterministic rebuild process).
- Invariant test suite needs expansion (nullifier replay, public input ordering, conservation edge cases).
- Durable queue/retry orchestration is needed for robust payroll and long-running workflows.
- Multi-instance-safe replay/rate limiting state is needed for HA deployment.

---

## 9) Suggested onboarding sequence for a new developer

1. Read architecture/status docs:
   - `docs/TECHNICAL_MASTER_SPEC.md`
   - `docs/CANONICAL_ARCHITECTURE.md`
   - `PRODUCTION-READY.md`
   - `LAUNCH-CHECKLIST-BSC.md`
2. Run backend tests:
   - from repo root: `npm run test:backend`
3. Run frontend quality gates:
   - `npm run lint`
   - `npm run build`
4. Trace swap and withdraw execution in code:
   - start at `phantom-relayer-dashboard/backend/src/index.js`
   - follow into `zkProofs.js`, `validatorNetwork.js`, and contract call wiring
5. Review deployed address alignment:
   - compare runtime env values with `deployments/*.json` and `config/*.json`
6. Prioritize remaining work:
   - pick one canonical production profile
   - lock FHE path requirements (real confidential execution vs explicit non-FHE mode)
   - complete invariant and regression tests before mainnet-critical claims

---

## 10) Risks and immediate action items

High-priority technical risks:

- Contract/circuit/profile fragmentation can cause drift between docs, backend assumptions, and deployed addresses.
- FHE marketing language can exceed implemented cryptographic guarantees if mock mode is active.
- HA safety is incomplete with in-memory replay/rate-limit state.

Immediate actions:

1. Define and publish one canonical deployable contract set (with exact addresses per environment).
2. Add/complete invariant regression tests and gate release on them.
3. Finalize FHE status policy in docs and UI copy so implementation claims remain accurate.
4. Move secret handling fully to managed secrets and rotate any exposed credentials.

---

## 11) Quick command reference

Repo root:

- `npm run lint`
- `npm run build`
- `npm run test:backend`
- `npm run test:api`
- `npm run verify`

Backend package:

- `cd phantom-relayer-dashboard/backend`
- `npm run dev`
- `npm run validator`
- `npm run validator:coordinator`
- `npm test`

---

This handoff is intended to be practical and code-first. If architecture decisions change, update this file together with `docs/TECHNICAL_MASTER_SPEC.md` and `docs/CANONICAL_ARCHITECTURE.md` in the same PR.
