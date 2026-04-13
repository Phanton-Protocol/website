/**
 * Legacy stub — real deploy flows live under `scripts/deploy/*.ts`.
 * See `DEPLOY.md` (e.g. `npx hardhat run scripts/deploy/deploy-core.ts --network bscTestnet`).
 */
require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const net = hre.network;
  console.log("Network:", net.name, "chainId:", Number(net.config.chainId ?? 0));
  const hasKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (!hasKey && net.name !== "hardhat") {
    console.warn("DEPLOYER_PRIVATE_KEY or PRIVATE_KEY is not set; funded deploys on live networks will fail.");
  }
  console.log("This file is a stub. Use scripts/deploy/deploy-core.ts, deploy-handlers.ts, or deploy-all.ts — see DEPLOY.md");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
