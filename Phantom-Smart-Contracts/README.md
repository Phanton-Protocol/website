# Phantom Smart Contracts

Hardhat project for the Phantom protocol: **`contracts/`**, **`test/`**, **`scripts/deploy/`**, **`deployments/`**, and **`config/`** (network defaults).

Run all commands **from this directory** (`core/Phantom-Smart-Contracts`) or via **`npm run <script> -w phantom-smart-contracts`** from **`core/`**.

## Commands

| Command | Description |
|--------|----------------|
| `npm run compile` | `contracts/stage1` (default) |
| `npm run compile:full` | `contracts/_full` (`HH_FULL=1`, Solidity 0.8.28 + `viaIR`) |
| `npm test` | Full-tree contract tests (Mocha + Chai) |
| `npm run deploy:all:local` | Local Hardhat one-shot deploy |

See **[DEPLOY.md](./DEPLOY.md)** for networks and script order. Environment variables: use **`../.env`** (parent `core/`) or a local **`.env`** here (see **`../.env.example`**).
