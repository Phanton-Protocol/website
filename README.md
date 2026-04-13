# Phantom — `core/`

Application shell: **Vite + React** site, **`phantom-relayer-dashboard`**, and docs. **Solidity / Hardhat** live in **`Phantom-Smart-Contracts/`**.

## Smart contracts (canonical)

| | |
|--|--|
| **Package** | [`Phantom-Smart-Contracts/`](./Phantom-Smart-Contracts/README.md) |
| **Compile** | From repo root: `npm run compile` / `npm run compile:full` (delegates to the workspace) |
| **Tests** | `npm test` |
| **Deploy docs** | [`Phantom-Smart-Contracts/DEPLOY.md`](./Phantom-Smart-Contracts/DEPLOY.md) |

Env for deploy keys and RPC overrides: copy [`.env.example`](./.env.example) → **`.env`** in **`core/`** (Hardhat loads `../.env` from the contracts package).

## Website & tooling

| Command | Description |
|--------|-------------|
| `npm install` | Installs root + workspace deps (includes Hardhat in `Phantom-Smart-Contracts`) |
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test:backend` | Tests under `phantom-relayer-dashboard/backend` |
| `npm run verify` | Lint + build + backend tests |

Other docs: [`Phantom-Smart-Contracts/DEPLOY-SETUP.md`](./Phantom-Smart-Contracts/DEPLOY-SETUP.md) (deploy setup), [`DAPP-SETUP.md`](./DAPP-SETUP.md), [`DEVELOPER_SPEC.md`](./DEVELOPER_SPEC.md), [`WHITEPAPER.md`](./WHITEPAPER.md).
