# GGC token holders export (Sei / Pacific-1)

Standalone script — not part of Phantom Protocol.

**Token:** [Grand Gangsta City (GGC) on Seitrace](https://seitrace.com/token/0x58E11d8ED38a2061361e90916540c5c32281A380?chain=pacific-1&tab=holders)  
**Contract:** `0x58E11d8ED38a2061361e90916540c5c32281A380` (Sei mainnet / Pacific-1)

## Run

```bash
cd sei-ggc-holders
node export-ggc-holders.js
```

Output: `ggc-holders-sei.csv` in the same folder (address, balance_raw, balance_formatted, percentage).

**Requires:** Node 18+

**Optional:** Use another RPC if needed: `set SEI_RPC=https://sei.drpc.org` then run the script.

You can copy the folder anywhere (e.g. Desktop) and run it from there.
