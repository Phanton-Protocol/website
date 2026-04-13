/**
 * Shared deploy helpers for verifiers + swap adaptor (Module 1 profiles).
 */
import { ethers } from "hardhat";

export type DeployProfileName = "dev" | "staging" | "production";

export function getDeployProfile(): DeployProfileName {
  const p = (process.env.DEPLOY_PROFILE || "dev").toLowerCase();
  if (p === "staging" || p === "production") return p as DeployProfileName;
  return "dev";
}

export function useMockInfrastructure(): boolean {
  return getDeployProfile() === "dev";
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`DEPLOY_PROFILE is staging/production: required env ${name} is missing`);
  }
  return v.trim();
}

export type InfraAddresses = {
  joinSplit: string;
  portfolio: string;
  threshold: string;
  swapAdaptor: string;
  /** Set when not using mocks (for deployments.json) */
  groth16Verifier?: string;
  mockJoinSplit?: string;
  mockThreshold?: string;
  mockSwapAdaptor?: string;
};

export async function deployVerifiersAndSwapAdaptor(): Promise<InfraAddresses> {
  if (useMockInfrastructure()) {
    const MockVerifier = await ethers.getContractFactory("MockVerifier");
    const joinSplitVerifier = await MockVerifier.deploy();
    await joinSplitVerifier.waitForDeployment();
    const joinSplitAddr = await joinSplitVerifier.getAddress();

    const thresholdVerifier = await MockVerifier.deploy();
    await thresholdVerifier.waitForDeployment();
    const thresholdAddr = await thresholdVerifier.getAddress();

    const MockSwapAdaptor = await ethers.getContractFactory("MockSwapAdaptor");
    const swapAdaptor = await MockSwapAdaptor.deploy();
    await swapAdaptor.waitForDeployment();
    const swapAdaptorAddr = await swapAdaptor.getAddress();

    return {
      joinSplit: joinSplitAddr,
      portfolio: joinSplitAddr,
      threshold: thresholdAddr,
      swapAdaptor: swapAdaptorAddr,
      mockJoinSplit: joinSplitAddr,
      mockThreshold: thresholdAddr,
      mockSwapAdaptor: swapAdaptorAddr,
    };
  }

  const profile = getDeployProfile();
  console.log("Deploy profile:", profile, "(real Groth16 + PancakeSwapAdaptor)");

  let groth16Addr = process.env.JOIN_SPLIT_GROTH16_ADDRESS?.trim();
  if (!groth16Addr) {
    const Groth16 = await ethers.getContractFactory(
      "contracts/_full/verifiers/JoinSplitVerifier.sol:Groth16Verifier"
    );
    const groth16 = await Groth16.deploy();
    await groth16.waitForDeployment();
    groth16Addr = await groth16.getAddress();
    console.log("Deployed Groth16Verifier at", groth16Addr);
  } else {
    console.log("Using existing Groth16Verifier at", groth16Addr);
  }

  const Adapter = await ethers.getContractFactory("Groth16VerifierAdapter");
  const adapter = await Adapter.deploy(groth16Addr);
  await adapter.waitForDeployment();
  const adapterAddr = await adapter.getAddress();
  console.log("Deployed Groth16VerifierAdapter at", adapterAddr);

  const router = requireEnv("PANCAKE_ROUTER");
  const wbnb = requireEnv("WBNB_ADDRESS");
  const Pancake = await ethers.getContractFactory("PancakeSwapAdaptor");
  const swapAdaptor = await Pancake.deploy(router, wbnb);
  await swapAdaptor.waitForDeployment();
  const swapAdaptorAddr = await swapAdaptor.getAddress();
  console.log("Deployed PancakeSwapAdaptor at", swapAdaptorAddr);

  return {
    joinSplit: adapterAddr,
    portfolio: adapterAddr,
    threshold: adapterAddr,
    swapAdaptor: swapAdaptorAddr,
    groth16Verifier: groth16Addr,
  };
}
