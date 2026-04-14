const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const buildInfoDir = path.join(root, "artifacts", "build-info");
const outDir = path.join(root, "contracts-recovered");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function run() {
  if (!fs.existsSync(buildInfoDir)) {
    throw new Error(`Missing build-info directory: ${buildInfoDir}`);
  }
  ensureDir(outDir);
  const files = fs.readdirSync(buildInfoDir).filter((f) => f.endsWith(".json"));
  let written = 0;
  for (const file of files) {
    const full = path.join(buildInfoDir, file);
    const json = JSON.parse(fs.readFileSync(full, "utf8"));
    const sources = json?.input?.sources || {};
    for (const [sourcePath, sourceObj] of Object.entries(sources)) {
      const content = sourceObj?.content;
      if (typeof content !== "string") continue;
      const outPath = path.join(outDir, sourcePath);
      ensureDir(path.dirname(outPath));
      if (!fs.existsSync(outPath)) {
        fs.writeFileSync(outPath, content, "utf8");
        written += 1;
      }
    }
  }
  console.log(`Recovered ${written} source files into ${outDir}`);
}

run();
