/**
 * Phase 2 — DepositHandler + optional TransactionHistory, wired to existing ShieldedPool.
 *
 * Prerequisite: run deploy-core.ts on the same network first (deployments/<network>.json).
 * Prerequisite: HH_FULL=1 npm run compile
 */
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";

const { ethers, network } = hre;

type DeploymentRecord = {
  network: string;
  chainId: string;
  deployer: string;
  deployedAt: string;
  primary: string;
  contracts: Record<string, string>;
};

function loadDeployment(networkName: string): DeploymentRecord {
  const deploymentsDir = path.join(process.cwd(), "deployments");
  const filePath = path.join(deploymentsDir, `${networkName}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as DeploymentRecord;
}

function saveDeployment(
  networkName: string,
  chainId: bigint,
  deployer: string,
  primary: string,
  contracts: Record<string, string>
): string {
  const deploymentsDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  const payload: DeploymentRecord = {
    network: networkName,
    chainId: chainId.toString(),
    deployer,
    deployedAt: new Date().toISOString(),
    primary,
    contracts,
  };
  const filePath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

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

  const out = saveDeployment(
    network.name,
    chainId,
    deployer.address,
    prev.primary,
    contracts
  );
  console.log("Updated", out);
  console.log("depositHandler:", depositHandlerAddr);
  console.log("transactionHistory:", txHistoryAddr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
