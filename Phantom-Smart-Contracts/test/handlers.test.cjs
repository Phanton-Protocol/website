const { expect } = require("chai");
const { ethers } = require("hardhat");

function emptyProof() {
  return { a: "0x", b: "0x", c: "0x" };
}

function emptyJoinSplitPublicInputs() {
  return {
    nullifier: ethers.ZeroHash,
    inputCommitment: ethers.ZeroHash,
    outputCommitmentSwap: ethers.ZeroHash,
    outputCommitmentChange: ethers.ZeroHash,
    merkleRoot: ethers.ZeroHash,
    inputAssetID: 0n,
    outputAssetIDSwap: 0n,
    outputAssetIDChange: 0n,
    inputAmount: 0n,
    swapAmount: 0n,
    changeAmount: 0n,
    outputAmountSwap: 0n,
    minOutputAmountSwap: 0n,
    gasRefund: 0n,
    protocolFee: 0n,
    merklePath: Array(10).fill(0n),
    merklePathIndices: Array(10).fill(0n),
  };
}

function emptyPublicInputs() {
  return {
    nullifier: ethers.ZeroHash,
    inputCommitment: ethers.ZeroHash,
    outputCommitment: ethers.ZeroHash,
    merkleRoot: ethers.ZeroHash,
    inputAssetID: 0n,
    outputAssetID: 0n,
    inputAmount: 0n,
    outputAmount: 0n,
    minOutputAmount: 0n,
    gasRefund: 0n,
    protocolFee: 0n,
    merklePath: Array(10).fill(0n),
    merklePathIndices: Array(10).fill(0n),
  };
}

describe("Handlers (onlyShieldedPool)", function () {
  it("WithdrawHandler: rejects calls not from ShieldedPool", async function () {
    const [_, notPool] = await ethers.getSigners();
    const MockV = await ethers.getContractFactory("MockVerifier");
    const v = await MockV.deploy();
    await v.waitForDeployment();
    const vAddr = await v.getAddress();

    const FO = await ethers.getContractFactory("FeeOracle");
    const fo = await FO.deploy();
    await fo.waitForDeployment();

    const RR = await ethers.getContractFactory("RelayerRegistry");
    const rr = await RR.deploy();
    await rr.waitForDeployment();

    const Wh = await ethers.getContractFactory("WithdrawHandler");
    const wh = await Wh.deploy(notPool.address, vAddr, vAddr, await fo.getAddress(), await rr.getAddress());
    await wh.waitForDeployment();

    const wd = {
      proof: emptyProof(),
      publicInputs: emptyJoinSplitPublicInputs(),
      recipient: ethers.ZeroAddress,
      relayer: ethers.ZeroAddress,
      encryptedPayload: "0x",
    };

    await expect(wh.processWithdraw(wd)).to.be.revertedWith("WithdrawHandler: only ShieldedPool");
  });

  it("SwapHandler: rejects calls not from ShieldedPool", async function () {
    const [_, notPool] = await ethers.getSigners();
    const MockV = await ethers.getContractFactory("MockVerifier");
    const v = await MockV.deploy();
    await v.waitForDeployment();
    const vAddr = await v.getAddress();

    const MockA = await ethers.getContractFactory("MockSwapAdaptor");
    const adaptor = await MockA.deploy();
    await adaptor.waitForDeployment();

    const FO = await ethers.getContractFactory("FeeOracle");
    const fo = await FO.deploy();
    await fo.waitForDeployment();

    const RR = await ethers.getContractFactory("RelayerRegistry");
    const rr = await RR.deploy();
    await rr.waitForDeployment();

    const Sh = await ethers.getContractFactory("SwapHandler");
    const sh = await Sh.deploy(
      notPool.address,
      vAddr,
      vAddr,
      await adaptor.getAddress(),
      await fo.getAddress(),
      await rr.getAddress()
    );
    await sh.waitForDeployment();

    const sd = {
      proof: emptyProof(),
      publicInputs: emptyPublicInputs(),
      swapParams: {
        tokenIn: ethers.ZeroAddress,
        tokenOut: ethers.ZeroAddress,
        amountIn: 0n,
        minAmountOut: 0n,
        fee: 0,
        sqrtPriceLimitX96: 0n,
        path: "0x",
      },
      relayer: ethers.ZeroAddress,
      commitment: ethers.ZeroHash,
      deadline: 0n,
      nonce: 0n,
    };

    await expect(sh.processSwap(sd)).to.be.revertedWith("SwapHandler: only ShieldedPool");
  });

  it("DepositHandler: rejects calls not from ShieldedPool", async function () {
    const FO = await ethers.getContractFactory("FeeOracle");
    const RR = await ethers.getContractFactory("RelayerRegistry");

    const fo = await FO.deploy();
    await fo.waitForDeployment();
    const rr = await RR.deploy();
    await rr.waitForDeployment();

    const [_, notPool] = await ethers.getSigners();
    const Dh = await ethers.getContractFactory("DepositHandler");
    const dh = await Dh.deploy(notPool.address, await fo.getAddress(), await rr.getAddress());
    await dh.waitForDeployment();

    await expect(
      dh.processDeposit(
        notPool.address,
        ethers.ZeroAddress,
        1n,
        ethers.keccak256("0x01"),
        0n,
        0n,
        ethers.ZeroAddress,
        ethers.ZeroAddress
      )
    ).to.be.revertedWith("DepositHandler: only ShieldedPool");
  });
});
