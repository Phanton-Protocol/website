const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const srcDir = path.join(__dirname, "..", "src");
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith(".js"));
let failed = false;
for (const f of files) {
  const full = path.join(srcDir, f);
  const r = spawnSync(process.execPath, ["--check", full], { encoding: "utf8" });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout || f);
    failed = true;
  }
}
if (failed) process.exit(1);
console.log(`Syntax OK: ${files.length} file(s) in src/`);
