const base =
  process.env.TEST_API_BASE ||
  process.env.API_BASE ||
  "http://127.0.0.1:5050";
const tests = [];
const enterpriseApiKey = process.env.ENTERPRISE_API_KEY || "";

async function call(path, init) {
  const headers = { ...(init?.headers || {}) };
  if (enterpriseApiKey) headers["x-enterprise-api-key"] = enterpriseApiKey;
  const res = await fetch(`${base}${path}`, { ...(init || {}), headers });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { ok: res.ok, status: res.status, body };
}

function record(name, pass, detail) {
  tests.push({ name, pass, detail });
}

async function run() {
  const health = await call("/enterprise/health");
  record("enterprise health", health.ok, health);

  const badLedger = await call("/ledger/post", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tenantId: "qa-tenant",
      memo: "unbalanced",
      legs: [
        { accountCode: "1010", side: "debit", amount: "100" },
        { accountCode: "2010", side: "credit", amount: "90" }
      ]
    })
  });
  record("ledger rejects unbalanced entry", badLedger.status === 400, badLedger);

  const payroll = await call("/payroll/runs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      companyId: "qa-corp",
      currencyAssetId: 0,
      items: [{ recipient: "0x1111111111111111111111111111111111111111", amount: "1000", memo: "salary" }]
    })
  });
  record("create payroll run", payroll.ok && payroll.body?.id, payroll);

  const approve = await call(`/payroll/runs/${payroll.body?.id}/approve`, { method: "POST" });
  record("approve payroll run", approve.ok && approve.body?.status === "approved", approve);

  const execute = await call(`/payroll/runs/${payroll.body?.id}/execute`, { method: "POST" });
  record("execute payroll run", execute.ok && execute.body?.status === "completed", execute);

  const compliance = await call("/compliance/screen", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      wallet: "0x1111111111111111111111111111111111111111",
      amount: "1000000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      source: "smoke"
    })
  });
  record("compliance screen", compliance.ok && compliance.body?.status, compliance);

  const ledgerAccount = await call("/ledger/accounts", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ tenantId: "qa-tenant", code: "1010", name: "Cash", type: "asset" })
  });
  record("create ledger account", ledgerAccount.ok && ledgerAccount.body?.id, ledgerAccount);

  const ledgerEntry = await call("/ledger/post", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tenantId: "qa-tenant",
      memo: "balanced",
      legs: [
        { accountCode: "1010", side: "debit", amount: "100" },
        { accountCode: "2010", side: "credit", amount: "100" }
      ]
    })
  });
  record("create balanced ledger entry", ledgerEntry.ok && ledgerEntry.body?.id, ledgerEntry);

  const proposal = await call("/governance/proposals", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      proposer: "0x1111111111111111111111111111111111111111",
      title: "Smoke Proposal",
      description: "qa"
    })
  });
  record("create governance proposal", proposal.ok && proposal.body?.id, proposal);

  const vote = await call(`/governance/proposals/${proposal.body?.id}/vote`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      voter: "0x1111111111111111111111111111111111111111",
      support: true,
      weight: "100"
    })
  });
  record("cast governance vote", vote.ok && vote.body?.id, vote);

  const govOverview = await call("/governance/overview");
  record("governance overview", govOverview.ok && govOverview.body?.proposals >= 1, govOverview);

  const tokenomics = await call("/tokenomics/metrics");
  record("tokenomics metrics", tokenomics.ok && tokenomics.body?.stakingAprBps, tokenomics);

  const audit = await call("/audit/events");
  record("audit events", audit.ok && Array.isArray(audit.body), { status: audit.status, count: Array.isArray(audit.body) ? audit.body.length : null });

  const failed = tests.filter((t) => !t.pass);
  console.log(JSON.stringify({
    passed: tests.length - failed.length,
    failed: failed.length,
    tests
  }, null, 2));
  if (failed.length) {
    throw new Error(`Smoke tests failed: ${failed.length}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
