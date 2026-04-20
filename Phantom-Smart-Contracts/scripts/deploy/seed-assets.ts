/**
 * After deploy-core (or deploy-all), optionally register assets and Chainlink feeds for MVP testnet.
 *
 * Usage:
 *   HH_FULL=1 npx hardhat run scripts/deploy/seed-assets.ts --network bscTestnet
 *
 * Env (optional — only set what you need):
 * - ASSET_1_SYMBOL, ASSET_1_ADDRESS — e.g. USDT testnet token → registered as assetId 1
 * - ASSET_2_SYMBOL, ASSET_2_ADDRESS — assetId 2
 * - OFFCHAIN_ORACLE_ADDRESS — optional signed-price oracle (preferred when Chainlink feed unavailable)
 * - BNB_USD_FEED — Chainlink BNB/USD for address(0) (BSC testnet feed address)
 * - ASSET_1_USD_FEED — USD feed for ASSET_1 (token/USD aggregator)
 * - ASSET_2_USD_FEED
 *
 * If env vars are missing, the script skips those steps (no-op safe).
 */
import hre from "hardhat";
import { loadDeployment } from "./deploymentRecord";

const { ethers, network } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  const dep = loadDeployment(network.name);
  const poolAddr = dep.contracts.shieldedPool;
  const feeOracleAddr = dep.contracts.feeOracle;
  if (!poolAddr || !feeOracleAddr) {
    throw new Error("deployments/<network>.json must contain shieldedPool and feeOracle");
  }

  const pool = await ethers.getContractAt("ShieldedPool", poolAddr);
  const feeOracle = await ethers.getContractAt("FeeOracle", feeOracleAddr);
  const offchainOracle = process.env.OFFCHAIN_ORACLE_ADDRESS?.trim();
  if (offchainOracle) {
    await (await feeOracle.connect(deployer).setOffchainOracle(offchainOracle)).wait();
    console.log("FeeOracle: set offchain oracle ->", offchainOracle);
  }

  const bnbFeed = process.env.BNB_USD_FEED?.trim();
  if (bnbFeed) {
    const tx = await feeOracle.connect(deployer).setPriceFeed(ethers.ZeroAddress, bnbFeed);
    await tx.wait();
    console.log("FeeOracle: set BNB/USD feed for native token");
  }

  const a1 = process.env.ASSET_1_ADDRESS?.trim();
  if (a1) {
    const tx = await pool.connect(deployer).registerAsset(1n, a1);
    await tx.wait();
    console.log("Registered assetId 1 ->", a1);
    const f1 = process.env.ASSET_1_USD_FEED?.trim();
    if (f1) {
      await (await feeOracle.connect(deployer).setPriceFeed(a1, f1)).wait();
      console.log("FeeOracle: set feed for asset 1");
    }
  }

  const a2 = process.env.ASSET_2_ADDRESS?.trim();
  if (a2) {
    const tx = await pool.connect(deployer).registerAsset(2n, a2);
    await tx.wait();
    console.log("Registered assetId 2 ->", a2);
    const f2 = process.env.ASSET_2_USD_FEED?.trim();
    if (f2) {
      await (await feeOracle.connect(deployer).setPriceFeed(a2, f2)).wait();
      console.log("FeeOracle: set feed for asset 2");
    }
  }

  console.log("seed-assets done for network:", network.name);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
