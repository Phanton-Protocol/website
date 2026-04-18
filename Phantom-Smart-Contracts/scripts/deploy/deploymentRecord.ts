/**
 * Shared shape for deployments/<network>.json and helpers to read/write it.
 */
import * as fs from "fs";
import * as path from "path";
import type { BaseContract } from "ethers";

export type DeploymentRecord = {
  network: string;
  chainId: string;
  deployer: string;
  deployedAt: string;
  primary: string;
  contracts: Record<string, string>;
  /** Contract-creation transaction hash for each key in `contracts` (when known). */
  deploymentTxs?: Record<string, string>;
};

export function deploymentTxHash(contract: BaseContract): string {
  const tx = contract.deploymentTransaction();
  const h = tx?.hash;
  if (!h) {
    throw new Error("deploymentTransaction().hash missing (expected a freshly deployed contract)");
  }
  return h;
}

export function saveDeployment(
  networkName: string,
  chainId: bigint,
  deployer: string,
  primary: string,
  contracts: Record<string, string>,
  deploymentTxs: Record<string, string>
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
    deploymentTxs,
  };
  const filePath = path.join(deploymentsDir, `${networkName}.json`);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
  return filePath;
}

export function loadDeployment(networkName: string): DeploymentRecord {
  const filePath = path.join(process.cwd(), "deployments", `${networkName}.json`);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw) as DeploymentRecord;
}
