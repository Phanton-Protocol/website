const { mimc7 } = require("./mimc7");
const { toBigInt } = require("./utils/bigint");

const TREE_DEPTH = 10;

function buildZeroes(depth = TREE_DEPTH) {
  const zeros = [0n];
  let currentZero = 0n;
  for (let i = 1; i < depth; i += 1) {
    currentZero = mimc7(currentZero, currentZero);
    zeros.push(currentZero);
  }
  return zeros;
}

function rebuildIncrementalTree(commitments, depth = TREE_DEPTH) {
  const zeros = buildZeroes(depth);
  const filledSubtrees = new Array(depth).fill(null);
  const nodeValues = [];
  for (let i = 0; i <= depth; i += 1) nodeValues[i] = {};

  let root = zeros[depth - 1];

  for (let idx = 0; idx < commitments.length; idx += 1) {
    const leaf = toBigInt(commitments[idx]);
    nodeValues[0][idx] = leaf;

    let currentHash = leaf;
    let currentIndex = idx;
    for (let level = 0; level < depth; level += 1) {
      if (currentIndex % 2 === 0) {
        filledSubtrees[level] = currentHash;
        currentHash = mimc7(currentHash, zeros[level]);
      } else {
        if (filledSubtrees[level] === null) {
          throw new Error(`filledSubtrees[${level}] is null for index ${idx}`);
        }
        currentHash = mimc7(filledSubtrees[level], currentHash);
      }
      currentIndex = Math.floor(currentIndex / 2);
      const posAtNextLevel = idx >> (level + 1);
      nodeValues[level + 1][posAtNextLevel] = currentHash;
    }
    root = currentHash;
  }

  return { root, nodeValues, zeros };
}

function buildMerklePath(commitments, targetIndex, depth = TREE_DEPTH) {
  if (targetIndex < 0 || targetIndex >= commitments.length) {
    throw new Error(`buildMerklePath: index ${targetIndex} out of range [0, ${commitments.length})`);
  }
  const { root, nodeValues, zeros } = rebuildIncrementalTree(commitments, depth);
  const path = [];
  const indices = [];

  for (let level = 0; level < depth; level += 1) {
    const pos = targetIndex >> level;
    const siblingPos = pos ^ 1;
    const sibling = nodeValues[level] && nodeValues[level][siblingPos] !== undefined
      ? nodeValues[level][siblingPos]
      : zeros[level];
    path.push(`0x${sibling.toString(16).padStart(64, "0")}`);
    indices.push(pos % 2);
  }

  return {
    path,
    indices,
    root: `0x${root.toString(16).padStart(64, "0")}`,
  };
}

function verifyMerklePath(leaf, path, indices, expectedRoot) {
  let current = toBigInt(leaf);
  for (let i = 0; i < TREE_DEPTH; i += 1) {
    const sibling = toBigInt(path[i] ?? 0);
    const bit = Number(indices[i] ?? 0);
    current = bit === 0 ? mimc7(current, sibling) : mimc7(sibling, current);
  }
  const computed = `0x${current.toString(16).padStart(64, "0")}`.toLowerCase();
  return computed === String(expectedRoot).toLowerCase();
}

module.exports = {
  TREE_DEPTH,
  buildMerklePath,
  rebuildIncrementalTree,
  verifyMerklePath,
};
