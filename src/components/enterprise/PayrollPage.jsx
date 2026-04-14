import { useState } from "react";
import { createPayrollRun, listPayrollRuns, approvePayrollRun, executePayrollRun } from "../../api/phantomApi";

export default function PayrollPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1000000000000000000");
  const [companyId, setCompanyId] = useState("demo-corp");
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
      <h2 style={{ color: "#fff" }}>Payroll</h2>
      <div style={{ display: "grid", gap: 8, maxWidth: 720 }}>
        <input style={{ borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.16)", background: "#151a23", color: "#fff" }} value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="company id" />
        <input style={{ borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.16)", background: "#151a23", color: "#fff" }} value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="recipient 0x..." />
        <input style={{ borderRadius: 10, padding: "10px 12px", border: "1px solid rgba(255,255,255,0.16)", background: "#151a23", color: "#fff" }} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount in wei" />
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={() => run(() => createPayrollRun({ companyId, currencyAssetId: 0, items: [{ recipient, amount, memo: "salary" }] }))}>Create run</button>
        <button onClick={() => run(() => listPayrollRuns())}>List runs</button>
        <button onClick={() => run(async () => { const runs = await listPayrollRuns(); if (!runs[0]) throw new Error("No payroll run found"); return approvePayrollRun(runs[0].id); })}>Approve latest</button>
        <button onClick={() => run(async () => { const runs = await listPayrollRuns(); if (!runs[0]) throw new Error("No payroll run found"); return executePayrollRun(runs[0].id); })}>Execute latest</button>
      </div>
      {err && <pre style={{ color: "#fca5a5", marginTop: 12 }}>{err}</pre>}
      {data && <pre style={{ color: "#fff", marginTop: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
