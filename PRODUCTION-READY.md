# Production Readiness Checklist

## Mandatory Environment Variables

- `NODE_ENV=production`
- `CORS_ORIGINS` (comma-separated allowlist)
- `RPC_URL`
- `SHIELDED_POOL_ADDRESS`
- `RELAYER_PRIVATE_KEY` (must not be placeholder)
- `ENTERPRISE_API_KEY` (recommended and now enforced when set)
- `SEE_MODE` (`disabled` | `mock` | `required`)
- `SEE_SHARED_SECRET` (required when SEE mode is enabled)
- `SEE_ALLOWED_MEASUREMENTS` (optional comma-separated allowlist)

## Security Gates Enforced in Backend

- Production startup fails if:
  - `DEV_BYPASS_VALIDATORS=true`
  - `DEV_BYPASS_PROOFS=true`
  - `CORS_ORIGINS` is unset
  - non-dry-run mode uses placeholder or missing relayer key
  - non-dry-run mode is missing RPC or pool address
  - SEE mode is enabled without `SEE_SHARED_SECRET`

## Enterprise API Protection

- When `ENTERPRISE_API_KEY` is set, protected routes require:
  - `X-Enterprise-API-Key: <key>`
- Protected areas:
  - payroll, ledger, governance, tokenomics, audit, and compliance decision listing

## SEE Protection for Sensitive User Flows

- Sensitive paths now require SEE attestation when `SEE_MODE=required`:
  - `POST /deposit`
  - `POST /swap`
  - `POST /withdraw`
- Verification endpoints:
  - `GET /see/config`
  - `POST /see/verify`
- Headers used:
  - `X-SEE-Attestation-Doc` (base64 JSON doc)
  - `X-SEE-Attestation-Sig` (HMAC-SHA256 hex signature)

## Deployment Steps

1. Set production environment variables in host/secrets manager.
2. Restart backend and verify startup does not abort.
3. Run smoke suite:
   - `node scripts/smoke-enterprise.mjs`
4. Build frontend:
   - `npm run build`
5. Set enterprise API key in UI from Enterprise Home page.

## Pre-Test Exit Criteria

- Smoke suite returns `failed: 0`.
- `/health`, `/ready`, `/enterprise/health` all return success.
- Frontend routes `/enterprise/*` load without runtime errors.
- Backend `npm test` (repo: `npm run test:backend`): includes **real Groth16 joinsplit proof** when `phantom-relayer-dashboard/circuits/joinsplit_js/joinsplit.wasm` and `joinsplit_0001.zkey` exist; otherwise that case is skipped. Set `DEV_BYPASS_PROOFS=false` in production; relayer encodes proofs from `swapData.proof` for on-chain submission.
