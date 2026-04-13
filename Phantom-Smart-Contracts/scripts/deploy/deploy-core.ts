/**
 * Phase 1 — Deploy mocks + core ShieldedPool (non-upgradeable).
 *
 * Libraries (MerkleTree, IncrementalMerkleTree, etc.) are linked at compile time into ShieldedPool; no separate library deployment.
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

  // 1) Verifiers — MockVerifier always returns true (testnet / dev only)
  const MockVerifier = await ethers.getContractFactory("MockVerifier");
  const joinSplitVerifier = await MockVerifier.deploy();
  await joinSplitVerifier.waitForDeployment();
  const joinSplitAddr = await joinSplitVerifier.getAddress();

  const thresholdVerifier = await MockVerifier.deploy();
  await thresholdVerifier.waitForDeployment();
  const thresholdAddr = await thresholdVerifier.getAddress();

  // Portfolio verifier may equal join-split per ShieldedPool constructor
  const portfolioVerifierAddr = joinSplitAddr;

  // 2) Swap adaptor (mock 1:1)
  const MockSwapAdaptor = await ethers.getContractFactory("MockSwapAdaptor");
  const swapAdaptor = await MockSwapAdaptor.deploy();
  await swapAdaptor.waitForDeployment();
  const swapAdaptorAddr = await swapAdaptor.getAddress();

  // 3) Fee oracle (standalone; optional Chainlink feeds configured later)
  const FeeOracle = await ethers.getContractFactory("FeeOracle");
  const feeOracle = await FeeOracle.deploy();
  await feeOracle.waitForDeployment();
  const feeOracleAddr = await feeOracle.getAddress();

  // 4) Relayer registry (owner = deployer)
  const RelayerRegistry = await ethers.getContractFactory("RelayerRegistry");
  const relayerRegistry = await RelayerRegistry.deploy();
  await relayerRegistry.waitForDeployment();
  const relayerRegistryAddr = await relayerRegistry.getAddress();

  // Register deployer as relayer so onlyRelayer paths work in tests
  const regTx = await relayerRegistry.registerRelayer(deployer.address);
  await regTx.wait();

  // 5) ShieldedPool — primary deployable for current non-upgradeable architecture
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

  const contracts: Record<string, string> = {
    mockVerifierJoinSplit: joinSplitAddr,
    mockVerifierPortfolio: portfolioVerifierAddr,
    mockVerifierThreshold: thresholdAddr,
    mockSwapAdaptor: swapAdaptorAddr,
    feeOracle: feeOracleAddr,
    relayerRegistry: relayerRegistryAddr,
    shieldedPool: shieldedPoolAddr,
  };

  const out = saveDeployment(
    network.name,
    chainId,
    deployer.address,
    "ShieldedPool",
    contracts
  );
  console.log("Wrote", out);
  console.log("shieldedPool:", shieldedPoolAddr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
