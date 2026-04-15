# Module 5 — Pancake quotes + relayer execution (MVP)

## Why we do NOT iframe pancakeswap.finance

- Pancake hosted UI signs and submits transactions from the connected wallet to router contracts.
- Our architecture requires: user signs an intent only, and relayer submits `shieldedSwapJoinSplit` through `ShieldedPool`.
- Without forking Pancake frontend and replacing tx submission plumbing, iframe/embed cannot redirect execution to our relayer.

## How we still match Pancake pricing

- Backend quote endpoint first attempts **Pancake V3 QuoterV2** read calls.
- On BSC testnet/mainnet we pin official quoter addresses from Pancake developer docs:
  - BSC testnet QuoterV2: `0xbC203d7f83677c7ed3F7acEc959963E7F4ECC5C2`
  - BSC mainnet QuoterV2: `0xB048Bbc1Ee6b733FFfCFb9e9CeF7375518e25997`
- Input quote params: `tokenIn`, `tokenOut`, `amountIn`, `slippageBps`, `feeTier`, `sqrtPriceLimitX96`, `deadlineSec`.
- Output includes:
  - `amountOut` (expected)
  - `minAmountOut` (slippage-protected)
  - `routeParams` (`feeTier`, `path`, `sqrtPriceLimitX96`, `deadlineSec`) for relayer payload.

Fallback order if V3 quoter read fails:
1. `SwapAdaptor.getExpectedOutput` (on-chain call against current deployed adaptor)
2. Pancake V2 router read
3. oracle estimate

## Execution path (required)

1. User sees quote/min received in our custom Swap page.
2. User signs EIP-712 intent (`SwapIntent`) only.
3. Backend verifies intent signature and binds intent fields to proof public inputs.
4. Backend proves using Module 2 join-split artifacts.
5. Relayer submits `shieldedSwapJoinSplit` to pool.
6. Pool executes adaptor swap and enforces `minOutputAmountSwap` slippage check.
7. Backend persists swap output/change notes into Module 3 encrypted note storage when note hints are provided.

No direct user wallet tx to Pancake router is used for swap execution in this flow.

## EIP-712 intent fields

`SwapIntent` (bound fields):
- `user` (address)
- `inputAssetID` (uint256)
- `outputAssetID` (uint256)
- `amountIn` (uint256)
- `minAmountOut` (uint256)
- `deadline` (uint256)
- `nonce` (uint256)
- `nullifier` (bytes32)

Domain:
- `name`: `ShadowDeFiRelayer`
- `version`: `1`
- `chainId`: runtime chain
- `verifyingContract`: `SHIELDED_POOL_ADDRESS`

## Env vars (Module 5)

- `PANCAKE_V3_QUOTER_V2` (optional override)
- `PANCAKE_V3_DEFAULT_FEE_TIER` (default `2500`)
- `PANCAKE_V2_ROUTER` (optional override fallback)
- `WBNB_ADDRESS` (optional override)
- existing relayer env: `RPC_URL`, `RELAYER_PRIVATE_KEY`, `SHIELDED_POOL_ADDRESS`

