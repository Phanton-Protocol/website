/**
 * Phase 1 — Deploy core ShieldedPool (non-upgradeable) + infrastructure.
 *
 * Prerequisite: HH_FULL=1 npm run compile
 *
 * Profiles (DEPLOY_PROFILE):
 * - dev (default): MockVerifier x2 + MockSwapAdaptor
 * - staging | production: Groth16Verifier + Groth16VerifierAdapter + PancakeSwapAdaptor(PANCAKE_ROUTER, WBNB_ADDRESS)
 *   Optional: JOIN_SPLIT_GROTH16_ADDRESS to reuse an existing verifier.
 */
import hre from "hardhat";
import { deployVerifiersAndSwapAdaptor } from "./deployInfrastructure";
import { deploymentTxHash, saveDeployment } from "./deploymentRecord";

const { ethers, network } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = (await ethers.provider.getNetwork()).chainId;

  console.log("Network:", network.name, "chainId:", chainId.toString());
  console.log("Deployer:", deployer.address);
  console.log("DEPLOY_PROFILE:", process.env.DEPLOY_PROFILE || "dev");

  const profile = (process.env.DEPLOY_PROFILE || "dev").toLowerCase();
  const infra = await deployVerifiersAndSwapAdaptor();
  if (profile === "staging" || profile === "production") {
    if (infra.mockJoinSplit || infra.mockThreshold || infra.mockSwapAdaptor) {
      throw new Error(
        "Module 7 invariant: staging/production deploy must not record mock verifier/adaptor addresses — check deployInfrastructure."
      );
    }
    if (!infra.groth16Verifier) {
      throw new Error("Module 7 invariant: staging/production must deploy real Groth16 verifier (groth16Verifier missing).");
    }
  }

  const FeeOracle = await ethers.getContractFactory("FeeOracle");
  const feeOracle = await FeeOracle.deploy();
  await feeOracle.waitForDeployment();
  const feeOracleAddr = await feeOracle.getAddress();
  const offchainOracle = String(process.env.OFFCHAIN_ORACLE_ADDRESS || "").trim();
  if (offchainOracle) {
    await (await feeOracle.setOffchainOracle(offchainOracle)).wait();
    console.log("FeeOracle.offchainOracle:", offchainOracle);
  }
  const bnbUsdFeed = String(process.env.BNB_USD_FEED || "").trim();
  if (bnbUsdFeed) {
    await (await feeOracle.setPriceFeed(ethers.ZeroAddress, bnbUsdFeed)).wait();
    console.log("FeeOracle BNB/USD feed:", bnbUsdFeed);
  }

  const RelayerRegistry = await ethers.getContractFactory("RelayerRegistry");
  const relayerRegistry = await RelayerRegistry.deploy();
  await relayerRegistry.waitForDeployment();
  const relayerRegistryAddr = await relayerRegistry.getAddress();

  const regTx = await relayerRegistry.registerRelayer(deployer.address);
  await regTx.wait();

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

  const contracts: Record<string, string> = {
    joinSplitVerifier: infra.joinSplit,
    portfolioVerifier: infra.portfolio,
    thresholdVerifier: infra.threshold,
    swapAdaptor: infra.swapAdaptor,
    feeOracle: feeOracleAddr,
    relayerRegistry: relayerRegistryAddr,
    shieldedPool: shieldedPoolAddr,
  };
  const deploymentTxs: Record<string, string> = {
    ...infra.deploymentTxs,
    feeOracle: deploymentTxHash(feeOracle),
    relayerRegistry: deploymentTxHash(relayerRegistry),
    shieldedPool: deploymentTxHash(shieldedPool),
  };
  if (infra.groth16Verifier) {
    contracts.groth16Verifier = infra.groth16Verifier;
  }
  if (infra.mockJoinSplit) {
    contracts.mockVerifierJoinSplit = infra.mockJoinSplit;
    contracts.mockVerifierThreshold = infra.mockThreshold!;
    contracts.mockSwapAdaptor = infra.mockSwapAdaptor!;
    deploymentTxs.mockVerifierJoinSplit = deploymentTxs.joinSplitVerifier;
    deploymentTxs.mockVerifierThreshold = deploymentTxs.thresholdVerifier;
    deploymentTxs.mockSwapAdaptor = deploymentTxs.swapAdaptor;
  }

  const out = saveDeployment(
    network.name,
    chainId,
    deployer.address,
    "ShieldedPool",
    contracts,
    deploymentTxs
  );
  console.log("Wrote", out);
  console.log("shieldedPool:", shieldedPoolAddr);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
