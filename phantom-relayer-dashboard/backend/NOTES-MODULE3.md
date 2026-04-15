# Module 3 — Off-chain notes + Merkle proofs

This file freezes the MVP note format and the minimal backend behavior for notes and Merkle proof building.

## Canonical note format (`note.v1`)

Source: `src/noteModel.js`

Fields (all decimal strings except `schema`):

- `schema`: `note.v1`
- `assetId`
- `amount` (smallest unit)
- `blindingFactor`
- `ownerPublicKey`
- `commitment` (hex32)
- `nullifier` (hex32)

Commitment definition (MiMC7 over BN254 field):

1. `h1 = MiMC7(assetId, amount)`
2. `h2 = MiMC7(h1, blindingFactor)`
3. `commitment = MiMC7(h2, ownerPublicKey)`

Nullifier definition:

- `nullifier = MiMC7(commitment, ownerPublicKey)`

This is the same formula used by backend proof generation helpers.

## Encrypted-at-rest note storage (MVP)

Backend stores note payload encrypted with AES-256-GCM.

Set one of:

- `NOTES_ENCRYPTION_KEY_HEX=...` (32-byte hex)
- `NOTES_ENCRYPTION_KEY_FILE=/abs/path/to/key.hex` (file with 32-byte hex)

### MVP key management note

- Testnet/dev only: local key file is acceptable.
- Production target: KMS/HSM managed key with rotation and access policy.

## Note APIs

- `POST /notes/from-deposit`
  - Input: `{ txHash, ownerAddress?, note: { assetId|assetID, amount, blindingFactor, ownerPublicKey } }`
  - Verifies note commitment equals on-chain `Deposit` event commitment.
  - Stores encrypted note payload and returns `{ noteId, commitment, commitmentIndex, txHash }`.

- `GET /notes/:noteId`
  - Minimal auth: requires `ownerAddress` in query or `x-owner-address` header.

- `GET /notes?ownerAddress=0x...`
  - Lists notes for owner.

- `GET /notes/threat-model`
  - Documents MVP auth limitations and production recommendations.

## Merkle builder + self-check

- `GET /merkle/index/:index`
  - Builds depth-10 MiMC path from chain commitments and verifies against on-chain root.

- `GET /merkle/self-check/:commitment`
  - Finds commitment index, builds path, verifies in JS, compares root with chain.

- CLI:

```bash
cd phantom-relayer-dashboard/backend
npm run merkle:selfcheck -- 0x<commitment>
```

## Threat model (MVP)

- Owner-address-only note auth is weak (no signed session challenge).
- If encryption key leaks, note payloads can be decrypted.
- Suitable for MVP/testnet only; production must add wallet-signature auth + KMS.
