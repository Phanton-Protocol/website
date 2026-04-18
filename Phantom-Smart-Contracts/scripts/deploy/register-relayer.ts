/**
 * Register an additional relayer on RelayerRegistry (owner-only).
 * RELAYER_ADDRESS=0x... DEPLOYER_PRIVATE_KEY=0x... npx hardhat run scripts/deploy/register-relayer.ts --network bscTestnet
 */
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

const { ethers, network } = hre;

async function main() {
  const relayer = process.env.RELAYER_ADDRESS?.trim();
  if (!relayer || !ethers.isAddress(relayer)) {
    throw new Error("Set RELAYER_ADDRESS to a valid relayer EOA");
  }
  const [deployer] = await ethers.getSigners();
  const depPath = path.join(process.cwd(), "deployments", `${network.name}.json`);
  const dep = JSON.parse(fs.readFileSync(depPath, "utf8")) as { contracts: { relayerRegistry: string } };
  const reg = await ethers.getContractAt("RelayerRegistry", dep.contracts.relayerRegistry);
  const tx = await reg.registerRelayer(relayer);
  const receipt = await tx.wait();
  console.log("registerRelayer tx:", tx.hash);
  console.log("block:", receipt?.blockNumber);
  console.log("registered:", relayer);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
