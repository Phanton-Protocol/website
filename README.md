# Phantom Protocol

Multi-Asset ZK-Pool with Shielded Swaps on BSC.

## Quick checks (run from project root)

On **Windows PowerShell** use these (no `&&`):

```powershell
npm run test:fhe
npm run build:frontend
npm run swaps
```

Or: `npm run check:swaps` (same as `swaps`). For the swap check, start the backend first in another terminal: `npm run relayer:local`.

## Commands

| Command | Description |
|--------|-------------|
| `npm run test:fhe` | Backend FHE (Microsoft SEAL) test |
| `npm run build:frontend` | Build frontend (Vite) |
| `npm run swaps` / `npm run check:swaps` | Backend health + quote check (backend must be running) |
| `npm run relayer:local` | Start backend relayer (FHE + API) |
| `npm run frontend:dev` | Start frontend dev server |
| `npm run compile:no-typechain` | Compile contracts (skip TypeChain) |
| `npm run deploy:testnet-tokens:standalone` | Deploy USDT/WBNB/CAKE mocks (set `PRIVATE_KEY`, optional `RPC_URL`) |
