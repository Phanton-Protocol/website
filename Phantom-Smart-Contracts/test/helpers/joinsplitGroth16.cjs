const path = require("path");
const { ethers } = require("hardhat");
const snarkjs = require("snarkjs");

const PSC_ROOT = path.resolve(__dirname, "..", "..");
const WASM = path.join(
  PSC_ROOT,
  "circuits/joinsplit_public9/build/joinsplit_public9_js/joinsplit_public9.wasm"
);
const ZKEY = path.join(PSC_ROOT, "circuits/joinsplit_public9/circuit_final.zkey");

/**
 * Map JoinSplitPublicInputs-style object to Circom private inputs (field elements as decimal strings).
 */
function joinSplitPublicInputsToWitness(inputs) {
  return {
    in_nullifier: BigInt(inputs.nullifier).toString(10),
    in_inputCommitment: BigInt(inputs.inputCommitment).toString(10),
    in_outputCommitmentSwap: BigInt(inputs.outputCommitmentSwap).toString(10),
    in_outputCommitmentChange: BigInt(inputs.outputCommitmentChange).toString(10),
    in_merkleRoot: BigInt(inputs.merkleRoot).toString(10),
    in_outputAmountSwap: BigInt(inputs.outputAmountSwap).toString(10),
    in_minOutputAmountSwap: BigInt(inputs.minOutputAmountSwap).toString(10),
    in_protocolFee: BigInt(inputs.protocolFee).toString(10),
    in_gasRefund: BigInt(inputs.gasRefund).toString(10),
  };
}

/**
 * Encode A,B,C exactly as snarkjs `groth16.exportSolidityCallData` (matches generated Solidity verifier).
 */
function poolProofFromSolidityCallData(calldataStr) {
  const quoted = calldataStr.match(/"0x[0-9a-fA-F]+"/g);
  if (!quoted || quoted.length < 8) {
    throw new Error("Could not parse groth16.exportSolidityCallData output");
  }
  const vals = quoted.map((x) => BigInt(JSON.parse(x)));
  const abi = ethers.AbiCoder.defaultAbiCoder();
  const a = abi.encode(["uint256", "uint256"], [vals[0], vals[1]]);
  const b = abi.encode(["uint256", "uint256", "uint256", "uint256"], [vals[2], vals[3], vals[4], vals[5]]);
  const c = abi.encode(["uint256", "uint256"], [vals[6], vals[7]]);
  return { a, b, c };
}

async function proveJoinSplitPublic9FromPublicInputs(publicInputsStruct) {
  const witness = joinSplitPublicInputsToWitness(publicInputsStruct);
  const { proof, publicSignals } = await snarkjs.groth16.fullProve(witness, WASM, ZKEY);
  const vk = JSON.parse(
    require("fs").readFileSync(path.join(PSC_ROOT, "circuits/joinsplit_public9/verification_key.json"), "utf8")
  );
  const ok = await snarkjs.groth16.verify(vk, publicSignals, proof);
  if (!ok) throw new Error("snarkjs groth16.verify failed");
  const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
  return { proof, publicSignals, poolProof: poolProofFromSolidityCallData(calldata) };
}

/**
 * Pool + mocks, but join-split slot uses real Groth16Verifier + adapter (portfolio stays MockVerifier).
 */
async function deployPoolWithRealJoinSplitVerifier() {
  const [deployer] = await ethers.getSigners();
  const FQN = "contracts/_full/verifiers/JoinSplitVerifier.sol:Groth16Verifier";
  const Groth16 = await ethers.getContractFactory(FQN);
  const groth16 = await Groth16.deploy();
  await groth16.waitForDeployment();
  const groth16Addr = await groth16.getAddress();

  const Adapter = await ethers.getContractFactory("Groth16VerifierAdapter");
  const joinAdapter = await Adapter.deploy(groth16Addr);
  await joinAdapter.waitForDeployment();
  const joinAddr = await joinAdapter.getAddress();

  const MockVerifier = await ethers.getContractFactory("MockVerifier");
  const portfolio = await MockVerifier.deploy();
  await portfolio.waitForDeployment();
  const portfolioAddr = await portfolio.getAddress();

  const threshold = await MockVerifier.deploy();
  await threshold.waitForDeployment();
  const thresholdAddr = await threshold.getAddress();

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
  const pool = await ShieldedPool.deploy(
    joinAddr,
    portfolioAddr,
    thresholdAddr,
    swapAdaptorAddr,
    feeOracleAddr,
    relayerRegistryAddr
  );
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();

  const DepositHandler = await ethers.getContractFactory("DepositHandler");
  const depositHandler = await DepositHandler.deploy(poolAddr, feeOracleAddr, relayerRegistryAddr);
  await depositHandler.waitForDeployment();

  const TransactionHistory = await ethers.getContractFactory("TransactionHistory");
  const txHistory = await TransactionHistory.deploy(poolAddr);
  await txHistory.waitForDeployment();

  await (await pool.setDepositHandler(await depositHandler.getAddress())).wait();
  await (await pool.setTransactionHistory(await txHistory.getAddress())).wait();

  return {
    deployer,
    pool,
    feeOracle: await ethers.getContractAt("FeeOracle", feeOracleAddr),
    groth16Addr,
  };
}

module.exports = {
  joinSplitPublicInputsToWitness,
  poolProofFromSolidityCallData,
  proveJoinSplitPublic9FromPublicInputs,
  deployPoolWithRealJoinSplitVerifier,
};
