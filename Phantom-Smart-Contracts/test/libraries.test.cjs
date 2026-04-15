const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Libraries (MerkleTree / IncrementalMerkleTree / MiMC7 via tree)", function () {
  it("Hardhat exposes signers", async function () {
    const [signer] = await ethers.getSigners();
    expect(signer.address).to.match(/^0x[a-fA-F0-9]{40}$/);
  });

  it("IncrementalMerkleTree: init, single insert, root updates", async function () {
    const Harness = await ethers.getContractFactory("LibraryTestHarness");
    const h = await Harness.deploy();
    await h.waitForDeployment();

    await (await h.treeInit(4)).wait();
    const leaf = ethers.keccak256(ethers.toUtf8Bytes("leaf-1"));
    const tx = await h.treeInsert(leaf);
    await tx.wait();

    const root = await h.treeRoot();
    const idx = await h.treeNextIndex();
    expect(idx).to.equal(1n);
    expect(root).to.not.equal(ethers.ZeroHash);
  });

  it("MerkleTree: verifyProof matches IncrementalMerkleTree root (first leaf)", async function () {
    const Harness = await ethers.getContractFactory("LibraryTestHarness");
    const h = await Harness.deploy();
    await h.waitForDeployment();

    const depth = 3n;
    await (await h.treeInit(depth)).wait();
    const leaf = ethers.keccak256(ethers.toUtf8Bytes("commitment"));
    await (await h.treeInsert(leaf)).wait();
    const root = await h.treeRoot();
    expect(await h.treeDepth()).to.equal(depth);

    const path = [];
    for (let i = 0; i < Number(depth); i++) {
      path.push(await h.treeZero(i));
    }
    while (path.length < 10) {
      path.push(ethers.ZeroHash);
    }

    const indices = Array(10).fill(0n);
    const ok = await h.merkleVerifyProof(leaf, root, path, indices, depth);
    expect(ok).to.equal(true);
  });
});
