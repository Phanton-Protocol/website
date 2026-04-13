const express = require("express");

/**
 * Enterprise API surface (payroll / reporting keys / batches) — extend as product needs.
 * Mounted at /enterprise and (late) / for dashboard static fallback compatibility.
 */
function createEnterpriseRouter() {
  const r = express.Router();

  r.get("/status", (_req, res) => {
    res.json({
      ok: true,
      scope: "enterprise",
      message: "Enterprise routes stub — wire payroll/tax endpoints when backend tables are enabled.",
    });
  });

  return r;
}

module.exports = { createEnterpriseRouter };
