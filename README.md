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

## Module 5 note (Pancake quotes + relayer execution)

- We do **not** iframe `pancakeswap.finance` for execution because hosted Pancake UI submits user wallet transactions directly to router contracts.
- We still match Pancake-style pricing by reading official Pancake V3 quoter contracts in our backend and rendering expected output + min received in our own UI.
- Execution remains protocol-native: user signs EIP-712 intent, relayer submits `shieldedSwapJoinSplit` through pool/adaptor.
- Details: [`phantom-relayer-dashboard/backend/MODULE5-PANCAKE-QUOTES-RELAYER-SWAP.md`](./phantom-relayer-dashboard/backend/MODULE5-PANCAKE-QUOTES-RELAYER-SWAP.md)

### Staying in sync with `origin/main`

If GitHub auth works locally, pull the latest marketing site and any large circuit files (for example `circuits/pot19_final.ptau` referenced on `main`) with:

```bash
git fetch origin
git merge origin/main
```

Use SSH or a credential helper if `https://github.com` prompts for a username. After merging `main`, resolve conflicts if any, then continue feature work on your module branch.

### Trusted-setup file (`circuits/pot19_final.ptau`)

That path is the Powers of Tau artifact your team added on `main` for Groth16-related workflows. It is separate from the join-split prover defaults under `phantom-relayer-dashboard/backend` (`PROVER_WASM` / `PROVER_ZKEY`). Pull `main` to obtain the file; do not commit multi‑gigabyte binaries unless your repo policy allows it.
