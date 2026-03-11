# DApp setup (Phantom Protocol)

One place to get the full DApp running: frontend + backend on the same config.

## 1. Backend

```bash
cd backend
npm install
```

**Config:** Backend reads `backend/config.json` (or env). Ensure these match your deployed contracts:

- `RPC_URL`, `CHAIN_ID` (e.g. BSC Testnet: `97`, RPC from [deployment-config.json](../deployment-config.json))
- `SHIELDED_POOL_ADDRESS`, `NOTE_STORAGE_ADDRESS`, `SWAP_ADAPTOR_ADDRESS`, `RELAYER_STAKING_ADDRESS`
- `RELAYER_PRIVATE_KEY` (wallet that will submit relay txs)

Optional for local/solo testing:

- `DEV_BYPASS_VALIDATORS=true` — relayer runs without validator set
- `RELAYER_DRY_RUN=true` — no real txs

Start:

```bash
node src/index.js
```

Default port: **5050** (or `PORT` in config).

## 2. Frontend

```bash
cd frontend
npm install
npm run build
```

**Config:** At build time the app uses:

- `VITE_API_URL` — backend API base (e.g. `http://localhost:5050` for local, or your Render URL).
- At runtime it also loads `/config.json` (from `frontend/public/config.json`) for contract addresses.

Keep **frontend/public/config.json** in sync with your backend/chain:

- `shieldedPoolAddress`, `noteStorageAddress`, `swapAdaptorAddress`, `relayerStakingAddress`, `feeOracleAddress`, `depositHandlerAddress`, `verifierAddress`, `protocolTokenAddress`

Dev server:

```bash
VITE_API_URL=http://localhost:5050 npm run dev
```

Production: set `VITE_API_URL` in your host (e.g. Vercel/Render env) and serve the `frontend/dist` output.

## 3. Quick check

1. **Backend:** `GET /health` returns 200.
2. **Frontend:** Connect wallet (e.g. BSC Testnet 97), then: Deposit → Swap → Withdraw.
3. **Relayer:** Backend must have `RELAYER_PRIVATE_KEY` and the relayer wallet must have gas; then deposit/withdraw/swap relay txs will be submitted.

## 4. Two config sources

- **backend/config.json** — used by this repo’s backend by default.
- **deployment-config.json** — reference for a different testnet deployment (addresses may differ). If you deploy from that, copy the contract addresses into `backend/config.json` (or env) and into **frontend/public/config.json** so frontend and backend use the same chain and contracts.

Once backend and frontend point at the same RPC and contract set, the full flow (connect wallet → deposit → swap → withdraw) should work without problems.
