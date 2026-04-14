/**
 * Export GGC token holders (Sei chain / Pacific-1) to CSV.
 * Token: https://seitrace.com/token/0x58E11d8ED38a2061361e90916540c5c32281A380?chain=pacific-1&tab=holders
 * Run from any folder: node export-ggc-holders.js
 * Requires: Node 18+
 */

const TOKEN_ADDRESS = "0x58E11d8ED38a2061361e90916540c5c32281A380";
const SEI_RPC = process.env.SEI_RPC || "https://evm-rpc.sei-apis.com";
const CHUNK_BLOCKS = 5000;
const OUT_CSV = "ggc-holders-sei.csv";

const transferTopic = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f166c5a1ff4bb92b60d26a9293";

async function rpc(method, params) {
  const res = await fetch(SEI_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
  return data.result;
}

async function getBlockNumber() {
  return await rpc("eth_blockNumber", []);
}

function hexToNum(hex) {
  return parseInt(hex, 16);
}

function hexToBigInt(hex) {
  return BigInt(hex);
}

async function getLogs(fromBlock, toBlock) {
  return await rpc("eth_getLogs", [
    {
      address: TOKEN_ADDRESS,
      fromBlock: "0x" + fromBlock.toString(16),
      toBlock: "0x" + toBlock.toString(16),
      topics: [transferTopic],
    },
  ]);
}

async function getTotalSupply() {
  const res = await rpc("eth_call", [
    { to: TOKEN_ADDRESS, data: "0x18160ddd" },
    "latest",
  ]);
  return hexToBigInt(res);
}

async function getDecimals() {
  const res = await rpc("eth_call", [
    { to: TOKEN_ADDRESS, data: "0x313ce567" },
    "latest",
  ]);
  return hexToNum(res);
}

function decodeTransfer(log) {
  const from = "0x" + log.topics[1].slice(26);
  const to = "0x" + log.topics[2].slice(26);
  const value = hexToBigInt(log.data);
  return { from, to, value };
}

function formatBalance(raw, decimals) {
  const d = Number(10n ** BigInt(decimals));
  return (Number(raw) / d).toLocaleString("en", { maximumFractionDigits: 6 });
}

async function main() {
  console.log("Sei RPC:", SEI_RPC);
  console.log("Token:", TOKEN_ADDRESS);
  const currentHex = await getBlockNumber();
  const currentBlock = hexToNum(currentHex);
  console.log("Current block:", currentBlock);

  const [totalSupply, decimals] = await Promise.all([getTotalSupply(), getDecimals()]);
  console.log("Decimals:", decimals);

  const balances = new Map();
  let fromBlock = 0;

  while (fromBlock <= currentBlock) {
    const toBlock = Math.min(fromBlock + CHUNK_BLOCKS - 1, currentBlock);
    const logs = await getLogs(fromBlock, toBlock);
    for (const log of logs) {
      const { from, to, value } = decodeTransfer(log);
      if (from !== "0x0000000000000000000000000000000000000000") {
        balances.set(from, (balances.get(from) || 0n) - value);
      }
      if (to !== "0x0000000000000000000000000000000000000000") {
        balances.set(to, (balances.get(to) || 0n) + value);
      }
    }
    if (logs.length > 0) console.log(`Blocks ${fromBlock}-${toBlock}: ${logs.length} transfers`);
    fromBlock = toBlock + 1;
    if (fromBlock <= currentBlock) await new Promise((r) => setTimeout(r, 200));
  }

  const entries = [...balances.entries()]
    .filter(([, b]) => b > 0n)
    .sort((a, b) => (b[1] > a[1] ? 1 : -1));

  const fs = await import("fs");
  const lines = ["address,balance_raw,balance_formatted,percentage"];
  for (const [addr, balance] of entries) {
    const pct = totalSupply > 0n ? (Number((balance * 10000n) / totalSupply) / 100).toFixed(4) : "0";
    lines.push(`${addr},${balance.toString()},${formatBalance(balance, decimals)},${pct}%`);
  }
  fs.writeFileSync(OUT_CSV, lines.join("\n"), "utf8");
  console.log("Wrote", entries.length, "holders to", OUT_CSV);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
