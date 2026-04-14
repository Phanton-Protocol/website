# Phantom BSC Launch Checklist

- Disable `DEV_BYPASS_VALIDATORS` and `DEV_BYPASS_PROOFS` in runtime config.
- Confirm `SHIELDED_POOL_ADDRESS`, `SWAP_ADAPTOR_ADDRESS`, `OFFCHAIN_ORACLE_ADDRESS`, `RELAYER_STAKING_ADDRESS` are non-empty and match deployment manifest.
- Run `node scripts/extract-contract-sources.cjs` and verify recovered sources are present in `contracts-recovered/`.
- Validate `/health`, `/config`, `/ready`, `/enterprise/health` return expected values.
- Execute smoke tests for deposit, swap, withdraw, payroll run create/approve/execute, compliance screen, ledger post, governance proposal/vote.
- Verify audit pipeline with `/audit/events` includes all critical actions.
- Verify tokenomics and governance endpoints: `/governance/overview`, `/tokenomics/metrics`.
- Build frontend with `npm run build` and ensure `/user` and `/enterprise` pages load.
- Ensure relayer key management and environment secrets are set via deployment environment, not source files.
