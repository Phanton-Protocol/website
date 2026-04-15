/**
 * Module 8 — in-memory recent activity for operator dashboard (resets on process restart).
 */
const MAX_TX = 30;
const MAX_ERR = 30;

const recentTransactions = [];
const recentErrors = [];

function pushTransaction({ op, txHash, blockNumber, extra }) {
  recentTransactions.push({
    ts: Date.now(),
    op: String(op || "unknown"),
    txHash: txHash ? String(txHash) : undefined,
    blockNumber: blockNumber != null ? Number(blockNumber) : undefined,
    ...(extra && typeof extra === "object" ? extra : {})
  });
  while (recentTransactions.length > MAX_TX) recentTransactions.shift();
}

function pushError({ phase, message, code }) {
  const msg = String(message || "").slice(0, 800);
  recentErrors.push({
    ts: Date.now(),
    phase: String(phase || "unknown"),
    message: msg,
    ...(code != null ? { code: String(code) } : {})
  });
  while (recentErrors.length > MAX_ERR) recentErrors.shift();
}

function getSnapshot() {
  return {
    recentTransactions: [...recentTransactions].reverse(),
    recentErrors: [...recentErrors].reverse()
  };
}

module.exports = {
  pushTransaction,
  pushError,
  getSnapshot
};
