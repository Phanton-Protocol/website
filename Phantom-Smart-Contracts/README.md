# Phantom Smart Contracts

Hardhat project for the Phantom protocol: **`contracts/`**, **`test/`**, **`scripts/deploy/`**, **`deployments/`**, and **`config/`** (network defaults).

Run all commands **from this directory** (`core/Phantom-Smart-Contracts`) or via **`npm run <script> -w phantom-smart-contracts`** from **`core/`**.

## Commands

| Command | Description |
|--------|----------------|
| `npm run compile` | `contracts/stage1` (default) |
| `npm run compile:full` | `contracts/_full` (`HH_FULL=1`, Solidity 0.8.28 + `viaIR`) |
| `npm test` | Full-tree contract tests — libraries, handlers, `ShieldedPool` deposit / `shieldedSwapJoinSplit` / `shieldedWithdraw` (MockVerifier + `MockSwapAdaptor`) |
| `npm run deploy:all:local` | Local Hardhat one-shot deploy |
| `npm run circuit:build:joinsplit` | Rebuild `joinsplit_public9` → `circuit_final.zkey` + `JoinSplitVerifier.sol` (needs **Circom 2.x** on `PATH`) |

See **[DEPLOY.md](./DEPLOY.md)** for networks, **`DEPLOY_PROFILE`** (`dev` vs `staging`/`production`), Pancake router / WBNB env vars, and **`seed-assets.ts`**. Join-split Groth16 layout, artifacts, and pins: **[circuits/CIRCUITS.md](./circuits/CIRCUITS.md)** and **`circuits/joinsplit_public9/manifest.json`**. Environment variables: use **`../.env`** (parent `core/`) or a local **`.env`** here (see **`../.env.example`**).
