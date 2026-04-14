import { useState } from "react";
import { ethers } from "ethers";
import { screenCompliance, createReportingKey, revokeReportingKey, getTaxExport } from "../../api/phantomApi";

export default function CompliancePage() {
  const [wallet, setWallet] = useState("");
  const [amount, setAmount] = useState("1000000000000000000");
  const [reportingKey, setReportingKey] = useState("");
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function run(fn) {
    try {
      setErr("");
      setData(await fn());
    } catch (e) {
      setErr(e?.message || String(e));
    }
  }

  async function signMessageForWallet(message) {
    if (!window.ethereum) throw new Error("Wallet extension not detected");
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const signerAddr = await signer.getAddress();
    if (!wallet || signerAddr.toLowerCase() !== wallet.toLowerCase()) {
      throw new Error("Entered wallet must match connected signer wallet");
    }
    const signature = await signer.signMessage(message);
    return { signature, signerAddr };
  }

  async function createKeyDemo() {
    const message = `Create reporting key ${Date.now()}`;
    const { signature } = await signMessageForWallet(message);
    return createReportingKey(wallet, signature, message);
  }

  async function revokeKeyDemo() {
    const message = `Revoke reporting key ${Date.now()}`;
    const { signature } = await signMessageForWallet(message);
    return revokeReportingKey(wallet, signature, message);
  }

  return (
    <div>
      <h2 style={{ color: "#fff" }}>Compliance & Reporting</h2>
      <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
        <input style={{ borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.16)", background: "#151a23", color: "#fff" }} value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="wallet 0x..." />
        <input style={{ borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.16)", background: "#151a23", color: "#fff" }} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount in wei" />
        <input style={{ borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.16)", background: "#151a23", color: "#fff" }} value={reportingKey} onChange={(e) => setReportingKey(e.target.value)} placeholder="reporting key for export" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={() => run(() => screenCompliance({ wallet, amount, token: "0x0000000000000000000000000000000000000000", source: "enterprise_ui" }))}>Screen wallet</button>
        <button onClick={() => run(() => createKeyDemo())}>Create reporting key</button>
        <button onClick={() => run(() => revokeKeyDemo())}>Revoke reporting key</button>
        <button onClick={() => run(() => getTaxExport(reportingKey))}>Tax export</button>
      </div>
      {err && <pre style={{ color: "#fca5a5", marginTop: 12 }}>{err}</pre>}
      {data && <pre style={{ color: "#fff", marginTop: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
