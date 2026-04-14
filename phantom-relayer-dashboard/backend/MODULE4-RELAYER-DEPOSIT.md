# Module 4 — Relayer sheltered deposit (MVP)

## Primary flow (chosen): **A — user approves pool, relayer `depositFor`**

- User **never** builds ZK proofs for deposit.
- User **approves** `ShieldedPool` as ERC20 spender for the exact amount.
- **Registered relayer** wallet (backend `RELAYER_PRIVATE_KEY`) calls `depositFor(depositor, token, amount, commitment, assetID)`.
- Tokens are pulled from the **user** (`depositor`) via `safeTransferFrom`; the relayer pays **gas** only.

### Tradeoff vs flow B (escrow to relayer)

| | Flow A (approve pool) | Flow B (send funds to relayer) |
|--|------------------------|--------------------------------|
| Trust | User trusts **contract + allowance**, not relayer custody | User trusts relayer with funds until deposit |
| Custody risk | Lower | Higher (MVP needs escrow limits, abuse monitoring) |
| UX | Standard ERC20 approve pattern | Extra transfer step |

This MVP implements **Flow A** for ERC20. **BNB** uses `depositForBNB` with relayer-paid `msg.value` (capped by `MODULE4_MAX_BNB_WEI`); user must reimburse relayer off-chain or via separate payment — document honestly for testnet.

## Solidity fix (DepositHandler)

`depositFor` passes `msg.value = 0` into `DepositHandler`. The handler previously required `value > 0` for ERC20, which broke relayer deposits. **Fix:** allow **zero BNB fee** when `relayer != address(0)` (relayer path). Direct `deposit()` from users still requires a BNB fee component for ERC20.

## Backend

### Endpoints

- `POST /relayer/deposit/session` — idempotency key, depositor, `mode` (`erc20` | `bnb`), `assetId`, and for `erc20` also `token` + `amount` (wei). Returns `sessionId`, `sessionToken`, `expiresAt`, instructions.
- `POST /relayer/deposit/submit` — `sessionId`, `sessionToken`, `idempotencyKey`, `commitment`, `note` (same shape as Module 3). Submits on-chain tx, then persists Module 3 encrypted note + commitment index.
- `GET /relayer/deposit/status?sessionId=` or `?idempotencyKey=` — session status.

### Relayer registry

Before sending a tx, the backend calls `RelayerRegistry.isRelayer(relayerWallet)` (via `pool.relayerRegistry()`). If `false`, submit returns **503** with `RELAYER_NOT_REGISTERED`.

### Auth (HTTP)

- `sessionToken` proves the client completed the **session** step (mitigates blind gas-spend on random ids).
- **Production:** set `MODULE4_DEPOSIT_API_SECRET` and **do not** set `MODULE4_PUBLIC_SUBMIT=true`. Submit then requires `Authorization: Bearer <secret>` or `X-Module4-Secret`.
- **Dev default:** `MODULE4_PUBLIC_SUBMIT` is effectively on when `NODE_ENV !== production` and `MODULE4_PUBLIC_SUBMIT` is not `false` — so local tests work without a secret.

### Rate limits / idempotency

- Stricter limiter on `/relayer/deposit/*` (`MODULE4_RATE_WINDOW_MS`, `MODULE4_RATE_MAX`).
- `idempotencyKey` is unique per completed session; repeats return **409** with prior `txHash` / `noteId` when present.

### Persistence

- `deposit_sessions`, `deposit_tx_receipts` tables (SQLite).
- Structured logs: `JSON` lines with `"module":"module4"`.

### Env

| Variable | Purpose |
|----------|---------|
| `RELAYER_PRIVATE_KEY` | Relayer signer (must be registered on registry) |
| `SHIELDED_POOL_ADDRESS` | Pool |
| `RPC_URL` | JSON-RPC |
| `NOTES_ENCRYPTION_KEY_HEX` or `NOTES_ENCRYPTION_KEY_FILE` | Module 3 note encryption |
| `MODULE4_SESSION_TTL_MS` | Session TTL (default 15 min) |
| `MODULE4_MAX_BNB_WEI` | Cap for `depositForBNB` value (default 0.05 BNB) |
| `MODULE4_DEPOSIT_API_SECRET` | Bearer secret for submit (when not public) |
| `MODULE4_PUBLIC_SUBMIT` | `true` to allow submit without Bearer (unsafe for public prod) |
| `RELAYER_DRY_RUN` | If `true`, Module 4 submit returns **503** (no real tx) |

## Tests

### Contracts (Hardhat)

```bash
cd Phantom-Smart-Contracts
HH_FULL=1 npx hardhat test test/depositFor.erc20.relayer.test.cjs
```

### Backend

```bash
cd phantom-relayer-dashboard/backend
node --test test/*.test.cjs
```

### Integration (live backend + chain)

1. Deploy pool + register relayer; set env on backend.
2. User approves pool for token.
3. Run `node scripts/module4-deposit-integration.cjs` (adjust `API_URL`, `TOKEN`, `AMOUNT`, optional `MODULE4_DEPOSIT_API_SECRET`).

## Security caveats (MVP)

- `sessionToken` + rate limits are **not** wallet-level auth; add signed challenges for production.
- BNB path implies relayer **pre-funds** on-chain value; cap and monitor.
- `ownerAddress` gate on `/notes` remains weak (Module 3 threat model).
