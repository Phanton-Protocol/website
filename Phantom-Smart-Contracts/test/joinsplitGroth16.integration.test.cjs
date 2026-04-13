const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  merkleProofForFirstLeaf,
  totalJoinSplitFeeBnb,
} = require("./helpers/poolFixtures.cjs");
const {
  proveJoinSplitPublic9FromPublicInputs,
  deployPoolWithRealJoinSplitVerifier,
} = require("./helpers/joinsplitGroth16.cjs");

describe("Join-split Groth16 (real verifier)", function () {
  it("shieldedSwapJoinSplit succeeds with snarkjs-produced proof", async function () {
    const { deployer, pool, feeOracle } = await deployPoolWithRealJoinSplitVerifier();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const outTok = await MockERC20.deploy("Out", "O", 18);
    await outTok.waitForDeployment();
    const outAddr = await outTok.getAddress();
    await pool.connect(deployer).registerAsset(1n, outAddr);

    const commitment = ethers.keccak256(ethers.toUtf8Bytes("note-groth16-swap"));
    const inputAmount = ethers.parseEther("25");
    await pool.connect(deployer).deposit(ethers.ZeroAddress, inputAmount, commitment, 0n, {
      value: inputAmount,
    });

    const { root, path, indices } = await merkleProofForFirstLeaf(commitment);
    const swapAmount = ethers.parseEther("5");
    const totalPf = await totalJoinSplitFeeBnb(feeOracle, inputAmount);
    const gasRefund = 0n;
    const changeAmount = inputAmount - swapAmount - totalPf - gasRefund;

    const nullifier = ethers.keccak256(ethers.toUtf8Bytes("null-groth16-1"));
    const outSwap = ethers.keccak256(ethers.toUtf8Bytes("out-swap-g"));
    const outChange = ethers.keccak256(ethers.toUtf8Bytes("out-change-g"));

    const publicInputs = {
      nullifier,
      inputCommitment: commitment,
      outputCommitmentSwap: outSwap,
      outputCommitmentChange: outChange,
      merkleRoot: root,
      inputAssetID: 0n,
      outputAssetIDSwap: 1n,
      outputAssetIDChange: 0n,
      inputAmount,
      swapAmount,
      changeAmount,
      outputAmountSwap: swapAmount,
      minOutputAmountSwap: swapAmount,
      gasRefund,
      protocolFee: totalPf,
      merklePath: path,
      merklePathIndices: indices,
    };

    const { poolProof } = await proveJoinSplitPublic9FromPublicInputs(publicInputs);

    const swapData = {
      proof: poolProof,
      publicInputs,
      swapParams: {
        tokenIn: ethers.ZeroAddress,
        tokenOut: outAddr,
        amountIn: swapAmount,
        minAmountOut: swapAmount,
        fee: 0,
        sqrtPriceLimitX96: 0n,
        path: "0x",
      },
      relayer: ethers.ZeroAddress,
      commitment: ethers.ZeroHash,
      deadline: 0n,
      nonce: 0n,
      encryptedPayload: "0x",
    };

    await expect(pool.connect(deployer).shieldedSwapJoinSplit(swapData)).to.emit(
      pool,
      "ShieldedSwapJoinSplit"
    );
    expect(await pool.nullifiers(nullifier)).to.equal(true);
  });

  it("reverts with PoolErr(6) when Groth16 proof is tampered", async function () {
    const { deployer, pool, feeOracle } = await deployPoolWithRealJoinSplitVerifier();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const outTok = await MockERC20.deploy("Out2", "O2", 18);
    await outTok.waitForDeployment();
    await pool.connect(deployer).registerAsset(1n, await outTok.getAddress());

    const commitment = ethers.keccak256(ethers.toUtf8Bytes("note-groth16-bad"));
    const inputAmount = ethers.parseEther("25");
    await pool.connect(deployer).deposit(ethers.ZeroAddress, inputAmount, commitment, 0n, {
      value: inputAmount,
    });

    const { root, path, indices } = await merkleProofForFirstLeaf(commitment);
    const swapAmount = ethers.parseEther("5");
    const totalPf = await totalJoinSplitFeeBnb(feeOracle, inputAmount);
    const changeAmount = inputAmount - swapAmount - totalPf;

    const publicInputs = {
      nullifier: ethers.keccak256(ethers.toUtf8Bytes("null-bad")),
      inputCommitment: commitment,
      outputCommitmentSwap: ethers.keccak256(ethers.toUtf8Bytes("os")),
      outputCommitmentChange: ethers.keccak256(ethers.toUtf8Bytes("oc")),
      merkleRoot: root,
      inputAssetID: 0n,
      outputAssetIDSwap: 1n,
      outputAssetIDChange: 0n,
      inputAmount,
      swapAmount,
      changeAmount,
      outputAmountSwap: swapAmount,
      minOutputAmountSwap: swapAmount,
      gasRefund: 0n,
      protocolFee: totalPf,
      merklePath: path,
      merklePathIndices: indices,
    };

    const { poolProof } = await proveJoinSplitPublic9FromPublicInputs(publicInputs);
    const cBytes = ethers.getBytes(poolProof.c);
    cBytes[cBytes.length - 1] ^= 1;
    const tamperedC = ethers.hexlify(cBytes);

    const swapData = {
      proof: { ...poolProof, c: tamperedC },
      publicInputs,
      swapParams: {
        tokenIn: ethers.ZeroAddress,
        tokenOut: await outTok.getAddress(),
        amountIn: swapAmount,
        minAmountOut: swapAmount,
        fee: 0,
        sqrtPriceLimitX96: 0n,
        path: "0x",
      },
      relayer: ethers.ZeroAddress,
      commitment: ethers.ZeroHash,
      deadline: 0n,
      nonce: 0n,
      encryptedPayload: "0x",
    };

    await expect(pool.connect(deployer).shieldedSwapJoinSplit(swapData))
      .to.be.revertedWithCustomError(pool, "PoolErr")
      .withArgs(6);
  });
});
