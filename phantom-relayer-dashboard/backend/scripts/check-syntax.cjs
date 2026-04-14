#!/usr/bin/env node
/**
 * Syntax-check key backend entrypoints (used by npm test).
 */
const { spawnSync } = require("child_process");
const path = require("path");

const root = path.join(__dirname, "..");
const files = ["src/index.js", "src/module4Deposit.js", "src/db.js"];
for (const f of files) {
  const p = path.join(root, f);
  const r = spawnSync(process.execPath, ["--check", p], { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    process.exit(1);
  }
}
process.exit(0);
