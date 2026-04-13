/**
 * Single-run deploy: core + handlers (for local `hardhat` network where each `hardhat run` resets state).
 * On persistent networks (bscTestnet / bsc), you can use deploy-core.ts then deploy-handlers.ts instead.
 *
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

  const MockVerifier = await ethers.getContractFactory("MockVerifier");
  const joinSplitVerifier = await MockVerifier.deploy();
  await joinSplitVerifier.waitForDeployment();
  const joinSplitAddr = await joinSplitVerifier.getAddress();

  const thresholdVerifier = await MockVerifier.deploy();
  await thresholdVerifier.waitForDeployment();
  const thresholdAddr = await thresholdVerifier.getAddress();

  const portfolioVerifierAddr = joinSplitAddr;

  const MockSwapAdaptor = await ethers.getContractFactory("MockSwapAdaptor");
  const swapAdaptor = await MockSwapAdaptor.deploy();
  await swapAdaptor.waitForDeployment();
  const swapAdaptorAddr = await swapAdaptor.getAddress();

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
    joinSplitAddr,
    portfolioVerifierAddr,
    thresholdAddr,
    swapAdaptorAddr,
    feeOracleAddr,
    relayerRegistryAddr
  );
  await shieldedPool.waitForDeployment();
  const shieldedPoolAddr = await shieldedPool.getAddress();

  const DepositHandler = await ethers.getContractFactory("DepositHandler");
  const depositHandler = await DepositHandler.deploy(
    shieldedPoolAddr,
    feeOracleAddr,
    relayerRegistryAddr
  );
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
    mockVerifierJoinSplit: joinSplitAddr,
    mockVerifierPortfolio: portfolioVerifierAddr,
    mockVerifierThreshold: thresholdAddr,
    mockSwapAdaptor: swapAdaptorAddr,
    feeOracle: feeOracleAddr,
    relayerRegistry: relayerRegistryAddr,
    shieldedPool: shieldedPoolAddr,
    depositHandler: depositHandlerAddr,
    transactionHistory: txHistoryAddr,
  };

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
