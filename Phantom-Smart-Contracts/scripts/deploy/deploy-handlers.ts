/**
 * Phase 2 — DepositHandler + optional TransactionHistory, wired to existing ShieldedPool.
 *
 * Prerequisite: run deploy-core.ts on the same network first (deployments/<network>.json).
 * Prerequisite: HH_FULL=1 npm run compile
 */
import hre from "hardhat";
import { deploymentTxHash, loadDeployment, saveDeployment } from "./deploymentRecord";

const { ethers, network } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;

  const prev = loadDeployment(network.name);
  const poolAddr = prev.contracts.shieldedPool;
  const feeOracleAddr = prev.contracts.feeOracle;
  const relayerRegistryAddr = prev.contracts.relayerRegistry;

  if (!poolAddr || !feeOracleAddr || !relayerRegistryAddr) {
    throw new Error("Missing addresses in deployments file; run deploy-core.ts first.");
  }

  const DepositHandler = await ethers.getContractFactory("DepositHandler");
  const depositHandler = await DepositHandler.deploy(
    poolAddr,
    feeOracleAddr,
    relayerRegistryAddr
  );
  await depositHandler.waitForDeployment();
  const depositHandlerAddr = await depositHandler.getAddress();

  const TransactionHistory = await ethers.getContractFactory("TransactionHistory");
  const txHistory = await TransactionHistory.deploy(poolAddr);
  await txHistory.waitForDeployment();
  const txHistoryAddr = await txHistory.getAddress();

  const pool = await ethers.getContractAt("ShieldedPool", poolAddr);
  const dhTx = await pool.setDepositHandler(depositHandlerAddr);
  await dhTx.wait();
  const thTx = await pool.setTransactionHistory(txHistoryAddr);
  await thTx.wait();

  const contracts = {
    ...prev.contracts,
    depositHandler: depositHandlerAddr,
    transactionHistory: txHistoryAddr,
  };

  const deploymentTxs: Record<string, string> = {
    ...(prev.deploymentTxs || {}),
    depositHandler: deploymentTxHash(depositHandler),
    transactionHistory: deploymentTxHash(txHistory),
  };

  const out = saveDeployment(
    network.name,
    chainId,
    deployer.address,
    prev.primary,
    contracts,
    deploymentTxs
  );
  console.log("Updated", out);
  console.log("depositHandler:", depositHandlerAddr);
  console.log("transactionHistory:", txHistoryAddr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
