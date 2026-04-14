import { ethers } from "ethers";
import { mimc7, FIELD } from "./mimc7.js";

export function addressToOwnerPublicKey(address) {
  const a = ethers.getAddress(address);
  return ethers.toBigInt(ethers.zeroPadValue(a, 32)).toString();
}

export function randomFieldElementString() {
  const bytes = ethers.randomBytes(32);
  let v = ethers.toBigInt(bytes) % FIELD;
  if (v < 0n) v += FIELD;
  return v.toString();
}

export function noteCommitment(assetID, amountStr, blindingStr, ownerPkStr) {
  const h1 = mimc7(BigInt(assetID), BigInt(amountStr));
  const h2 = mimc7(h1, BigInt(blindingStr));
  return mimc7(h2, BigInt(ownerPkStr));
}

export function noteNullifier(commitmentBn, ownerPkStr) {
  return mimc7(BigInt(commitmentBn), BigInt(ownerPkStr));
}

export function commitmentToBytes32(commitmentBn) {
  const hex = `0x${BigInt(commitmentBn).toString(16).padStart(64, "0").slice(-64)}`;
  return ethers.zeroPadValue(hex, 32);
}
