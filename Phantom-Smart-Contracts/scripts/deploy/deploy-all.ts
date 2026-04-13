/**
 * Single-run deploy: core + handlers (local hardhat: one process).
 *
 * Prerequisite: HH_FULL=1 npm run compile
 *
 * DEPLOY_PROFILE=dev|staging|production — see deploy-core.ts
 */
import * as fs from "fs";
import * as path from "path";
import hre from "hardhat";
import { deployVerifiersAndSwapAdaptor } from "./deployInfrastructure";

const { ethers, network } = hre;

type DeploymentRecord = {
  network: string;
  chainId: string;
  deployer: string;
  deployedAt: string;
  primary: string;
  contracts: Record<string, string>;
};

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

  console.log("Network:", network.name, "chainId:", chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("DEPLOY_PROFILE:", process.env.DEPLOY_PROFILE || "dev");

  const infra = await deployVerifiersAndSwapAdaptor();

  const FeeOracle = await ethers.getContractFactory("FeeOracle");
  const feeOracle = await FeeOracle.deploy();
  await feeOracle.waitForDeployment();
  const feeOracleAddr = await feeOracle.getAddress();

  const RelayerRegistry = await ethers.getContractFactory("RelayerRegistry");
  const relayerRegistry = await RelayerRegistry.deploy();
  await relayerRegistry.waitForDeployment();
  const relayerRegistryAddr = await relayerRegistry.getAddress();

  await (await relayerRegistry.registerRelayer(deployer.address)).wait();

  const ShieldedPool = await ethers.getContractFactory("ShieldedPool");
  const shieldedPool = await ShieldedPool.deploy(
    infra.joinSplit,
    infra.portfolio,
    infra.threshold,
    infra.swapAdaptor,
    feeOracleAddr,
    relayerRegistryAddr
  );
  await shieldedPool.waitForDeployment();
  const shieldedPoolAddr = await shieldedPool.getAddress();

  const DepositHandler = await ethers.getContractFactory("DepositHandler");
  const depositHandler = await DepositHandler.deploy(shieldedPoolAddr, feeOracleAddr, relayerRegistryAddr);
  await depositHandler.waitForDeployment();
  const depositHandlerAddr = await depositHandler.getAddress();

  const TransactionHistory = await ethers.getContractFactory("TransactionHistory");
  const txHistory = await TransactionHistory.deploy(shieldedPoolAddr);
  await txHistory.waitForDeployment();
  const txHistoryAddr = await txHistory.getAddress();

  const pool = await ethers.getContractAt("ShieldedPool", shieldedPoolAddr);
  await (await pool.setDepositHandler(depositHandlerAddr)).wait();
  await (await pool.setTransactionHistory(txHistoryAddr)).wait();

  const contracts: Record<string, string> = {
    joinSplitVerifier: infra.joinSplit,
    portfolioVerifier: infra.portfolio,
    thresholdVerifier: infra.threshold,
    swapAdaptor: infra.swapAdaptor,
    feeOracle: feeOracleAddr,
    relayerRegistry: relayerRegistryAddr,
    shieldedPool: shieldedPoolAddr,
    depositHandler: depositHandlerAddr,
    transactionHistory: txHistoryAddr,
  };
  if (infra.groth16Verifier) {
    contracts.groth16Verifier = infra.groth16Verifier;
  }
  if (infra.mockJoinSplit) {
    contracts.mockVerifierJoinSplit = infra.mockJoinSplit;
    contracts.mockVerifierThreshold = infra.mockThreshold!;
    contracts.mockSwapAdaptor = infra.mockSwapAdaptor!;
  }

  const out = saveDeployment(
    network.name,
    chainId,
    deployer.address,
    "ShieldedPool",
    contracts
  );
  console.log("Wrote", out);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
