import { useState } from "react";
import {
  createPayrollRun,
  listPayrollRuns,
  approvePayrollRun,
  executePayrollRun,
  screenCompliance,
  createLedgerAccount,
  postLedgerEntry,
  listLedgerEntries,
  createGovernanceProposal,
  getGovernanceOverview,
  getTokenomicsMetrics,
  getAuditEvents,
} from "../api/phantomApi";

export default function EnterpriseConsole() {
  const [out, setOut] = useState(null);
  const [err, setErr] = useState("");

  const [companyId, setCompanyId] = useState("demo-corp");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("1000000000000000000");
  const [tenantId, setTenantId] = useState("bank-tenant-1");
  const [proposalTitle, setProposalTitle] = useState("Adjust relayer reward curve");

  async function run(fn) {
    try {
      setErr("");
      const result = await fn();
      setOut(result);
    } catch (e) {
      setErr(e?.message || String(e));
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <h2 style={{ color: "#fff" }}>Enterprise Console</h2>
      <p style={{ color: "rgba(255,255,255,0.7)" }}>Payroll, compliance, ledger, governance, and audit endpoints.</p>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(2, minmax(0,1fr))", marginTop: 12 }}>
        <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="recipient 0x..." />
        <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="amount wei" />
        <input value={companyId} onChange={(e) => setCompanyId(e.target.value)} placeholder="companyId" />
        <input value={tenantId} onChange={(e) => setTenantId(e.target.value)} placeholder="tenantId" />
        <input value={proposalTitle} onChange={(e) => setProposalTitle(e.target.value)} placeholder="proposal title" />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button onClick={() => run(() => createPayrollRun({ companyId, currencyAssetId: 0, items: [{ recipient, amount, memo: "salary" }] }))}>Create payroll run</button>
        <button onClick={() => run(() => listPayrollRuns())}>List payroll runs</button>
        <button onClick={() => run(async () => { const runs = await listPayrollRuns(); if (!runs[0]) throw new Error("No payroll run"); return approvePayrollRun(runs[0].id); })}>Approve latest run</button>
        <button onClick={() => run(async () => { const runs = await listPayrollRuns(); if (!runs[0]) throw new Error("No payroll run"); return executePayrollRun(runs[0].id); })}>Execute latest run</button>
        <button onClick={() => run(() => screenCompliance({ wallet: recipient, amount, token: "0x0000000000000000000000000000000000000000", source: "manual_check" }))}>Screen wallet</button>
        <button onClick={() => run(() => createLedgerAccount({ tenantId, code: "1010", name: "Cash", type: "asset" }))}>Create ledger account</button>
        <button onClick={() => run(() => postLedgerEntry({ tenantId, memo: "internal settlement", legs: [{ accountCode: "1010", side: "debit", amount }, { accountCode: "2010", side: "credit", amount }] }))}>Post balanced entry</button>
        <button onClick={() => run(() => listLedgerEntries(tenantId))}>List ledger entries</button>
        <button onClick={() => run(() => createGovernanceProposal({ proposer: recipient, title: proposalTitle, description: "policy update" }))}>Create proposal</button>
        <button onClick={() => run(() => getGovernanceOverview())}>Governance overview</button>
        <button onClick={() => run(() => getTokenomicsMetrics())}>Tokenomics metrics</button>
        <button onClick={() => run(() => getAuditEvents())}>Audit events</button>
      </div>

      {err && <pre style={{ color: "#fca5a5", marginTop: 12 }}>{err}</pre>}
      {out && <pre style={{ color: "#e5e7eb", marginTop: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(out, null, 2)}</pre>}
    </div>
  );
}
