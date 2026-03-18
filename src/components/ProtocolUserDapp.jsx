import { useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { loadVault, saveVault } from "../lib/noteVault";

function shorten(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

async function fetchJson(url, opts) {
  const res = await fetch(url, {
    headers: { "content-type": "application/json" },
    ...opts,
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text }; }
  if (!res.ok) {
    const msg = body?.error || body?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return body;
}

const INTENT_TYPES = {
  SwapIntent: [
    { name: "userAddress", type: "address" },
    { name: "inputToken", type: "address" },
    { name: "outputToken", type: "address" },
    { name: "inputAmount", type: "uint256" },
    { name: "minOutputAmount", type: "uint256" },
    { name: "deadline", type: "uint256" },
    { name: "nonce", type: "uint256" },
  ],
};

const DEPOSIT_TYPES = {
  Deposit: [
    { name: "depositor", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "commitment", type: "bytes32" },
    { name: "assetID", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

export default function ProtocolUserDapp() {
  const [apiBase, setApiBase] = useState(() => localStorage.getItem("phantom_api") || "http://localhost:5050");
  const base = useMemo(() => (apiBase || "").replace(/\/$/, "").trim(), [apiBase]);
  const [cfg, setCfg] = useState(null);
  const [health, setHealth] = useState(null);
  const [cfgErr, setCfgErr] = useState(null);

  const [wallet, setWallet] = useState({ address: null, provider: null, signer: null });
  const [connectError, setConnectError] = useState(null);

  const [vault, setVault] = useState({ unlocked: false, key: null, data: { notes: [], updatedAt: null } });
  const [vaultError, setVaultError] = useState(null);
  const [noteDraft, setNoteDraft] = useState("");

  const [tab, setTab] = useState("deposit");
  const [lastResult, setLastResult] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [depositForm, setDepositForm] = useState({
    token: ethers.ZeroAddress,
    amount: "",
    assetID: 0,
    commitment: "",
    deadlineSec: 900,
  });

  const [intentForm, setIntentForm] = useState({
    inputToken: ethers.ZeroAddress,
    outputToken: ethers.ZeroAddress,
    inputAmount: "",
    minOutputAmount: "",
    deadlineSec: 900,
    nonce: "0",
    swapDataJson: "",
  });

  const [withdrawForm, setWithdrawForm] = useState({
    withdrawDataJson: "",
  });

  useEffect(() => {
    localStorage.setItem("phantom_api", apiBase);
  }, [apiBase]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setCfgErr(null);
      try {
        if (!base) return;
        const [c, h] = await Promise.all([
          fetchJson(`${base}/config`),
          fetchJson(`${base}/health`),
        ]);
        if (!cancelled) {
          setCfg(c);
          setHealth(h);
        }
      } catch (e) {
        if (!cancelled) setCfgErr(e.message || String(e));
      }
    }
    run();
    const t = setInterval(run, 10_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [base]);

  async function connect() {
    setConnectError(null);
    setActionError(null);
    try {
      if (!window.ethereum) throw new Error("No injected wallet found (MetaMask).");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet({ provider, signer, address });
    } catch (e) {
      setConnectError(e.message || String(e));
    }
  }

  async function unlockVault() {
    setVaultError(null);
    if (!wallet.signer) {
      setVaultError("Connect wallet first.");
      return;
    }
    try {
      const msg = `Unlock Phantom Note Vault\n\nDomain: ${window.location.host}\nTime: ${new Date().toISOString()}`;
      const signature = await wallet.signer.signMessage(msg);
      const loaded = await loadVault({ signature });
      setVault({ unlocked: true, key: loaded.key, data: loaded.data });
    } catch (e) {
      setVaultError(e.message || String(e));
    }
  }

  async function addNoteToVault() {
    setVaultError(null);
    try {
      if (!vault.unlocked || !vault.key) throw new Error("Vault is locked.");
      const trimmed = noteDraft.trim();
      if (!trimmed) throw new Error("Paste a note / payload JSON first.");
      let parsed;
      try { parsed = JSON.parse(trimmed); } catch { parsed = { raw: trimmed }; }
      const next = {
        notes: [{ t: Date.now(), payload: parsed }, ...(vault.data?.notes || [])].slice(0, 200),
        updatedAt: Date.now(),
      };
      await saveVault({ key: vault.key, data: next });
      setVault({ ...vault, data: next });
      setNoteDraft("");
    } catch (e) {
      setVaultError(e.message || String(e));
    }
  }

  const canTransact = (cfg?.mode === "live") && !!wallet?.signer;

  async function submitDeposit() {
    setActionError(null);
    setLastResult(null);
    try {
      if (!wallet.signer) throw new Error("Connect wallet first.");
      if (!cfg?.chainId || !cfg?.addresses?.shieldedPool) throw new Error("Backend config not loaded.");
      if (cfg.mode !== "live") throw new Error(`Backend is ${cfg.mode}. Configure missing env vars first.`);

      const amountWei = ethers.parseUnits(String(depositForm.amount || "0"), 18);
      const deadline = Math.floor(Date.now() / 1000) + Number(depositForm.deadlineSec || 900);
      const domain = {
        name: "ShadowDeFiDeposit",
        version: "1",
        chainId: Number(cfg.chainId),
        verifyingContract: cfg.addresses.shieldedPool,
      };
      const message = {
        depositor: wallet.address,
        token: depositForm.token,
        amount: amountWei.toString(),
        commitment: depositForm.commitment,
        assetID: Number(depositForm.assetID),
        deadline,
      };
      const signature = await wallet.signer.signTypedData(domain, DEPOSIT_TYPES, message);
      const out = await fetchJson(`${base}/deposit`, {
        method: "POST",
        body: JSON.stringify({ ...message, signature }),
      });
      setLastResult(out);
    } catch (e) {
      setActionError(e.message || String(e));
    }
  }

  async function submitSwap() {
    setActionError(null);
    setLastResult(null);
    try {
      if (!wallet.signer) throw new Error("Connect wallet first.");
      if (!cfg?.chainId || !cfg?.addresses?.shieldedPool) throw new Error("Backend config not loaded.");
      if (cfg.mode !== "live") throw new Error(`Backend is ${cfg.mode}. Configure missing env vars first.`);

      const intentRes = await fetchJson(`${base}/intent`, {
        method: "POST",
        body: JSON.stringify({
          userAddress: wallet.address,
          inputToken: intentForm.inputToken,
          outputToken: intentForm.outputToken,
          inputAmount: String(intentForm.inputAmount || "0"),
          minOutputAmount: String(intentForm.minOutputAmount || "0"),
          deadline: Math.floor(Date.now() / 1000) + Number(intentForm.deadlineSec || 900),
          nonce: String(intentForm.nonce || "0"),
        }),
      });

      const { intentId, intent, domain } = intentRes;
      const intentSig = await wallet.signer.signTypedData(domain, INTENT_TYPES, intent);

      let swapData;
      try { swapData = JSON.parse(intentForm.swapDataJson || "{}"); } catch { swapData = {}; }
      const out = await fetchJson(`${base}/swap`, {
        method: "POST",
        body: JSON.stringify({ intentId, intent, intentSig, swapData }),
      });
      setLastResult(out);
    } catch (e) {
      setActionError(e.message || String(e));
    }
  }

  async function submitWithdraw() {
    setActionError(null);
    setLastResult(null);
    try {
      if (!cfg?.addresses?.shieldedPool) throw new Error("Backend config not loaded.");
      if (cfg.mode !== "live") throw new Error(`Backend is ${cfg.mode}. Configure missing env vars first.`);
      let withdrawData;
      try { withdrawData = JSON.parse(withdrawForm.withdrawDataJson || "{}"); } catch { withdrawData = {}; }
      const out = await fetchJson(`${base}/withdraw`, {
        method: "POST",
        body: JSON.stringify({ withdrawData }),
      });
      setLastResult(out);
    } catch (e) {
      setActionError(e.message || String(e));
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-lg font-semibold">User Protocol DApp</div>
          <div className="text-xs text-white/60">
            Relayer-only submission. Backend mode: <span className="font-semibold">{cfg?.mode || "unknown"}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <input
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none md:w-[360px]"
            placeholder="Relayer API URL (e.g. http://localhost:5050)"
          />
          <button
            onClick={connect}
            className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            {wallet.address ? `Wallet: ${shorten(wallet.address)}` : "Connect wallet"}
          </button>
        </div>
      </div>

      {cfgErr && <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{cfgErr}</div>}
      {connectError && <div className="mt-3 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{connectError}</div>}

      {cfg?.mode === "degraded" && (
        <div className="mt-3 rounded-lg border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-100">
          Missing env for transactions: <span className="font-semibold">{(cfg.missingForTx || []).join(", ") || "unknown"}</span>
        </div>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Note vault (encrypted)</div>
            <button
              onClick={unlockVault}
              className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
              disabled={!wallet.signer}
              title={!wallet.signer ? "Connect wallet first" : ""}
            >
              {vault.unlocked ? "Unlocked" : "Unlock"}
            </button>
          </div>
          {vaultError && <div className="mt-2 text-sm text-red-200">{vaultError}</div>}
          <textarea
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            className="mt-3 h-28 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs outline-none"
            placeholder="Paste a note / proof payload / JSON here, then save it encrypted locally."
          />
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={addNoteToVault}
              className="rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
              disabled={!vault.unlocked}
            >
              Save to vault
            </button>
            <div className="text-xs text-white/60">{(vault.data?.notes || []).length} saved</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="font-semibold">Backend status</div>
          <div className="mt-2 grid gap-1 text-sm text-white/80">
            <div>Health: <span className="font-semibold">{health?.ok ? "OK" : "Unknown"}</span></div>
            <div>Chain ID: <span className="font-semibold">{cfg?.chainId ?? "—"}</span></div>
            <div>Pool: <span className="font-mono text-xs">{cfg?.addresses?.shieldedPool || "—"}</span></div>
            <div>Quote mode: <span className="font-semibold">{cfg?.features?.quoteMode || "—"}</span></div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["deposit", "swap", "withdraw"].map((k) => (
          <button
            key={k}
            onClick={() => { setTab(k); setActionError(null); setLastResult(null); }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold ${tab === k ? "bg-indigo-500 text-white" : "bg-white/10 text-white hover:bg-white/15"}`}
          >
            {k === "deposit" ? "Deposit" : k === "swap" ? "Swap" : "Withdraw"}
          </button>
        ))}
      </div>

      {tab === "deposit" && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/70">
            Deposit requires a correct note commitment. If you don’t have a note generator yet, don’t deposit.
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-white/60">Token address (0x0 for native)</div>
              <input value={depositForm.token} onChange={(e) => setDepositForm({ ...depositForm, token: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="text-xs text-white/60">Amount (assumes 18 decimals)</div>
              <input value={depositForm.amount} onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="text-xs text-white/60">Asset ID</div>
              <input value={depositForm.assetID} onChange={(e) => setDepositForm({ ...depositForm, assetID: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="text-xs text-white/60">Deadline seconds (from now)</div>
              <input value={depositForm.deadlineSec} onChange={(e) => setDepositForm({ ...depositForm, deadlineSec: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-white/60">Commitment (bytes32)</div>
            <input value={depositForm.commitment} onChange={(e) => setDepositForm({ ...depositForm, commitment: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" placeholder="0x…" />
          </div>
          <button onClick={submitDeposit} disabled={!canTransact} className="mt-4 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50">
            Sign & submit deposit
          </button>
        </div>
      )}

      {tab === "swap" && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/70">
            This UI signs the intent and submits swap data to the relayer. Proof/publicInputs must be provided (store them in the vault).
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div>
              <div className="text-xs text-white/60">Input token</div>
              <input value={intentForm.inputToken} onChange={(e) => setIntentForm({ ...intentForm, inputToken: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="text-xs text-white/60">Output token</div>
              <input value={intentForm.outputToken} onChange={(e) => setIntentForm({ ...intentForm, outputToken: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="text-xs text-white/60">Input amount (uint256 string)</div>
              <input value={intentForm.inputAmount} onChange={(e) => setIntentForm({ ...intentForm, inputAmount: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="text-xs text-white/60">Min output amount (uint256 string)</div>
              <input value={intentForm.minOutputAmount} onChange={(e) => setIntentForm({ ...intentForm, minOutputAmount: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="text-xs text-white/60">Deadline seconds (from now)</div>
              <input value={intentForm.deadlineSec} onChange={(e) => setIntentForm({ ...intentForm, deadlineSec: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
            <div>
              <div className="text-xs text-white/60">Nonce</div>
              <input value={intentForm.nonce} onChange={(e) => setIntentForm({ ...intentForm, nonce: e.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xs text-white/60">Swap data JSON (must include `proof` + `publicInputs` + `swapParams`)</div>
            <textarea value={intentForm.swapDataJson} onChange={(e) => setIntentForm({ ...intentForm, swapDataJson: e.target.value })} className="mt-1 h-40 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs outline-none" placeholder='{"proof":{...},"publicInputs":{...},"swapParams":{...}}' />
          </div>
          <button onClick={submitSwap} disabled={!canTransact} className="mt-4 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50">
            Sign intent & submit swap
          </button>
        </div>
      )}

      {tab === "withdraw" && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
          <div className="text-sm text-white/70">
            Withdraw requires a valid proof and public inputs. Paste the `withdrawData` JSON produced by your proof flow.
          </div>
          <div className="mt-3">
            <div className="text-xs text-white/60">Withdraw data JSON</div>
            <textarea value={withdrawForm.withdrawDataJson} onChange={(e) => setWithdrawForm({ withdrawDataJson: e.target.value })} className="mt-1 h-40 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs outline-none" placeholder='{"proof":{...},"publicInputs":{...},"recipient":"0x..."}' />
          </div>
          <button onClick={submitWithdraw} disabled={cfg?.mode !== "live"} className="mt-4 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50">
            Submit withdraw
          </button>
        </div>
      )}

      {actionError && <div className="mt-4 rounded-lg border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-200">{actionError}</div>}
      {lastResult && (
        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-3">
          <div className="text-xs text-white/60">Result</div>
          <pre className="mt-2 overflow-auto text-xs text-white/80">{JSON.stringify(lastResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

