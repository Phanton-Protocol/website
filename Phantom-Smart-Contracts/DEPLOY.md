# Phantom — Hardhat deployment

## Architecture (this repo)

- **Primary deployable (non-upgradeable path):** `ShieldedPool` — holds commitments, nullifiers, Merkle state; constructor takes verifiers, `MockSwapAdaptor` / Pancake adaptor, `FeeOracle`, `RelayerRegistry`. See `DEVELOPER_SPEC.md` §6.
- **Upgradeable variant:** `ShieldedPoolUpgradeable` (UUPS) + governance/timelock is a separate track; scripts here target the **direct `ShieldedPool`** flow first.
- **Libraries** (`MerkleTree`, `IncrementalMerkleTree`, …) are compiled into `ShieldedPool`; no separate library deployment.

## Prerequisites

1. Copy **`core/.env.example`** → **`core/.env`** and set `DEPLOYER_PRIVATE_KEY` or `PRIVATE_KEY`.
2. Compile the **full** contract tree (deploy scripts use `contracts/_full`):

   ```bash
   cd core/Phantom-Smart-Contracts
   HH_FULL=1 npm run compile
   ```

   Or from **`core/`**: `HH_FULL=1 npm run compile:full`

## Scripts (incremental)

| Phase | Script | Purpose |
|-------|--------|---------|
| 1 | `scripts/deploy/deploy-core.ts` | Mocks + `FeeOracle` + `RelayerRegistry` + **`ShieldedPool`** |
| 2 | `scripts/deploy/deploy-handlers.ts` | `DepositHandler` + `TransactionHistory`, then `setDepositHandler` / `setTransactionHistory` on the pool |
| All-in-one | `scripts/deploy/deploy-all.ts` | Same as 1+2 in **one** `hardhat run` (use for **`--network hardhat`**; see below) |

Outputs are merged into **`deployments/<networkName>.json`** (e.g. `deployments/bscTestnet.json`).

**Important:** The in-memory **`hardhat`** chain resets on every `hardhat run`. Running `deploy-core.ts` and then `deploy-handlers.ts` as **two separate commands** on `hardhat` will point handlers at the wrong addresses. For local smoke tests use **`deploy-all.ts`**, or use a persistent network (`bscTestnet` / `bsc`) where two-step deploy is correct.

## Commands

**BSC Testnet (chain id 97):**

```bash
npx hardhat run scripts/deploy/deploy-core.ts --network bscTestnet
npx hardhat run scripts/deploy/deploy-handlers.ts --network bscTestnet
```

**BSC mainnet (56):**

```bash
npx hardhat run scripts/deploy/deploy-core.ts --network bsc
npx hardhat run scripts/deploy/deploy-handlers.ts --network bsc
```

**Local Hardhat (smoke test — single process):**

```bash
npx hardhat run scripts/deploy/deploy-all.ts --network hardhat
```

RPC defaults come from `config/bscTestnet.json` and `config/bscMainnet.json`; override with `BSC_TESTNET_RPC` / `BSC_MAINNET_RPC` in `.env`.

## Notes

- Phase 1 uses **`MockVerifier`** (always passes proofs) — **not for production**.
- **`SwapHandler` / `WithdrawHandler`** are used by **`ShieldedPoolUpgradeable`**, not by the base `ShieldedPool` in this tree; add a separate script when you deploy the upgradeable stack.
