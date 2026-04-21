import { useState } from "react";
import { getAuditEvents, createLedgerAccount, postLedgerEntry, listLedgerEntries } from "../../api/phantomApi";

export default function AuditPage() {
  const [tenantId, setTenantId] = useState("bank-tenant-1");
  const [amount, setAmount] = useState("1000000000000000000");
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

  return (
    <div>
      <h2 style={{ color: "#fff" }}>Audit & Ledger Ops</h2>
      <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
        <input style={{ borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.16)", background: "#070708", color: "#fff" }} value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="tenant id" />
        <input style={{ borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.16)", background: "#070708", color: "#fff" }} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount in wei" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={() => run(() => createLedgerAccount({ tenantId, code: "1010", name: "Cash", type: "asset" }))}>Create account</button>
        <button onClick={() => run(() => postLedgerEntry({ tenantId, memo: "settlement", legs: [{ accountCode: "1010", side: "debit", amount }, { accountCode: "2010", side: "credit", amount }] }))}>Post entry</button>
        <button onClick={() => run(() => listLedgerEntries(tenantId))}>List entries</button>
        <button onClick={() => run(() => getAuditEvents())}>Audit events</button>
      </div>
      {err && <pre style={{ color: "#fca5a5", marginTop: 12 }}>{err}</pre>}
      {data && <pre style={{ color: "#fff", marginTop: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
