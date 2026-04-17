import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const poolAddr = String(process.env.SHIELDED_POOL_ADDRESS || "").trim();
  const feeOracleAddr = String(process.env.FEE_ORACLE_ADDRESS || "").trim();
  const relayerRegistryAddr = String(process.env.RELAYER_REGISTRY_ADDRESS || "").trim();
  if (!poolAddr || !feeOracleAddr || !relayerRegistryAddr) {
    throw new Error("Set SHIELDED_POOL_ADDRESS, FEE_ORACLE_ADDRESS, RELAYER_REGISTRY_ADDRESS");
  }

  const [deployer] = await ethers.getSigners();
  console.log("[path-b] deployer:", deployer.address);

  const DepositHandler = await ethers.getContractFactory("DepositHandler");
  const handler = await DepositHandler.deploy(poolAddr, feeOracleAddr, relayerRegistryAddr);
  await handler.waitForDeployment();
  const handlerAddr = await handler.getAddress();
  console.log("[path-b] DepositHandler:", handlerAddr);

  const pool = await ethers.getContractAt("ShieldedPoolUpgradeableReduced", poolAddr);
  const tx = await pool.setDepositHandler(handlerAddr);
  await tx.wait();
  console.log("[path-b] setDepositHandler OK");
}

main().catch((e) => {
  console.error("[path-b] failed:", e);
  process.exit(1);
});

