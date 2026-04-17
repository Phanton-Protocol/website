import hre from "hardhat";

const { ethers } = hre;

/**
 * Deploy WithdrawHandler and wire it to ShieldedPoolUpgradeableReduced.
 * Run as the pool owner (same signer as `set-pathb-deposit-handler.ts`).
 *
 * Env:
 *   SHIELDED_POOL_ADDRESS — pool address (required)
 *   OWNER_PRIVATE_KEY   — optional; if set, must be pool owner (pays gas for deploy + setWithdrawHandler)
 */
async function main() {
  const poolAddr = String(process.env.SHIELDED_POOL_ADDRESS || "").trim();
  if (!poolAddr) {
    throw new Error("Set SHIELDED_POOL_ADDRESS");
  }

  const ownerPk = String(process.env.OWNER_PRIVATE_KEY || "").trim();
  const deployer =
    ownerPk.length > 0
      ? new ethers.Wallet(ownerPk.startsWith("0x") ? ownerPk : `0x${ownerPk}`, ethers.provider)
      : (await ethers.getSigners())[0];
  console.log("[path-b] signer:", deployer.address, ownerPk ? "(OWNER_PRIVATE_KEY)" : "(hardhat default)");

  const pool = (await ethers.getContractAt("ShieldedPoolUpgradeableReduced", poolAddr)).connect(deployer);
  const [verifier, thresholdVerifier, feeOracle, relayerRegistry, owner] = await Promise.all([
    pool.verifier(),
    pool.thresholdVerifier(),
    pool.feeOracle(),
    pool.relayerRegistry(),
    pool.owner(),
  ]);

  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    throw new Error(
      `[path-b] signer ${deployer.address} is not pool owner ${owner}. Use owner private key in hardhat network config.`
    );
  }

  const WithdrawHandler = await ethers.getContractFactory("WithdrawHandler", deployer);
  const handler = await WithdrawHandler.deploy(
    poolAddr,
    verifier,
    thresholdVerifier,
    feeOracle,
    relayerRegistry
  );
  await handler.waitForDeployment();
  const handlerAddr = await handler.getAddress();
  const deployTx = handler.deploymentTransaction();
  console.log("[path-b] WithdrawHandler:", handlerAddr);
  if (deployTx) console.log("[path-b] WithdrawHandler deploy tx:", deployTx.hash);

  const tx = await pool.setWithdrawHandler(handlerAddr);
  console.log("[path-b] setWithdrawHandler tx:", tx.hash);
  await tx.wait();
  console.log("[path-b] setWithdrawHandler OK");
}

main().catch((e) => {
  console.error("[path-b] failed:", e);
  process.exit(1);
});
