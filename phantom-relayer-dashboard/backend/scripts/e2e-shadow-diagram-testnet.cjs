#!/usr/bin/env node
/**
 * Shadow diagram: user funds shadow → pool `depositForBNB(shadow,…)` → BNB→BUSD join-split swap →
 * withdraw spends the **swap-output BUSD note** (not BNB change) with `finalRecipient` so pool pays
 * withdraw-shadow BUSD and relayer forwards tokens → user wallet.
 *
 * Prereqs: relayer running with same RELAYER_PRIVATE_KEY as shadow seed derivation in `src/index.js`.
 *
 *   API_URL=http://127.0.0.1:5050 E2E_USER_PRIVATE_KEY=0x... node scripts/e2e-shadow-diagram-testnet.cjs
 *
 * After this flow, sweep accumulated pool `gasReserve` BNB to owner (requires upgraded pool):
 *   node scripts/sweep-pool-gas-reserve-to-owner.cjs
 *
 * Reuses swap sizing env vars (E2E_RESERVE_*, etc.). BUSD withdraw keeps `protocolFee`/`gasRefund` at 0
 * in the ZK payload so the pool does not mis-apply native gasRefund on an ERC20 note.
 */
const crypto = require("crypto");
const http = require("http");
const https = require("https");
const path = require("path");
const fs = require("fs");
const { ethers } = require("ethers");
const { canonicalizeNote, computeNullifier } = require(path.join(__dirname, "..", "src", "noteModel"));

let API_URL = (process.env.API_URL || "").trim().replace(/\/$/, "");
const E2E_USER_PRIVATE_KEY = String(process.env.E2E_USER_PRIVATE_KEY || "").trim();
const TOKEN = ethers.getAddress(process.env.E2E_TOKEN || "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7");
const OUTPUT_TOKEN = ethers.getAddress(process.env.E2E_OUTPUT_TOKEN || "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7");
const DEPOSIT_WEI = String(
  process.env.E2E_DEPOSIT_WEI != null && String(process.env.E2E_DEPOSIT_WEI).trim() !== ""
    ? process.env.E2E_DEPOSIT_WEI
    : "50000000000000000"
);
const SHADOW_SWEEP_GAS_BUFFER_WEI = BigInt(process.env.E2E_SHADOW_SWEEP_GAS_BUFFER_WEI || "2000000000000000"); // 0.002 BNB
const E2E_MAX_SWAP_GAS_REFUND_WEI = String(process.env.E2E_MAX_SWAP_GAS_REFUND_WEI || "2500000000000000");
const E2E_RESERVE_CHANGE_AFTER_SWAP_WEI = String(process.env.E2E_RESERVE_CHANGE_AFTER_SWAP_WEI || "12000000000000000");
const E2E_SWAP_GAS_REFUND_FALLBACK_WEI = String(process.env.E2E_SWAP_GAS_REFUND_FALLBACK_WEI || "1000000000000000");
const E2E_JOIN_SPLIT_PROTOCOL_FEE_WEI = String(process.env.E2E_JOIN_SPLIT_PROTOCOL_FEE_WEI ?? "0");
const SLIPPAGE_BPS = Number(process.env.E2E_SLIPPAGE_BPS || 500);
const MERKLE_POLL_MS = Number(process.env.MERKLE_POLL_MS || 3000);
const MERKLE_POLL_MAX = Number(process.env.MERKLE_POLL_MAX || 45);

const DEPOSIT_TYPES = {
  Deposit: [
    { name: "depositor", type: "address" },
    { name: "token", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "commitment", type: "bytes32" },
    { name: "assetID", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
};

function outputAssetId(addr) {
  const n = String(addr || "").toLowerCase();
  if (n === "0x78867bbeeef44f2326bf8ddd1941a4439382ef2a7") return 1;
  if (n === "0x7ef95a0fe8a5f4f9c1824fbf6656e2f95fa6bf13") return 2;
  return Number(process.env.E2E_OUTPUT_ASSET_ID || 1);
}

function canonicalWbnb(chainId) {
  return Number(chainId) === 56
    ? "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c"
    : "0xae13d989dac2f0debff460ac112a837c89baa7cd";
}

function requestJson(method, urlStr, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const lib = u.protocol === "https:" ? https : http;
    const data = body ? JSON.stringify(body) : null;
    const proveTimeout = Number(process.env.E2E_HTTP_TIMEOUT_MS || 900000);
    const req = lib.request(
      {
        hostname: u.hostname,
        port: u.port || (u.protocol === "https:" ? 443 : 80),
        path: u.pathname + u.search,
        method,
        timeout: proveTimeout,
        headers: {
          "Content-Type": "application/json",
          ...(data ? { "Content-Length": Buffer.byteLength(data) } : {}),
          ...headers,
        },
      },
      (res) => {
        let buf = "";
        res.on("data", (c) => (buf += c));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, json: JSON.parse(buf || "{}"), raw: buf });
          } catch {
            resolve({ status: res.statusCode, text: buf, raw: buf });
          }
        });
      }
    );
    req.on("error", reject);
    req.on("timeout", () => {
      req.destroy();
      reject(new Error(`request timeout (${proveTimeout}ms) ${method} ${urlStr}`));
    });
    if (data) req.write(data);
    req.end();
  });
}

function loadMockFingerprints() {
  const fpPath = path.join(__dirname, "..", "..", "..", "config", "module7-mock-bytecode-hashes.json");
  if (!fs.existsSync(fpPath)) return null;
  return JSON.parse(fs.readFileSync(fpPath, "utf8"));
}

async function assertPoolNotMockOnChain(rpcUrl, poolAddr) {
  const fp = loadMockFingerprints();
  if (!fp?.mockVerifierBytecodeHash) {
    console.warn("[e2e-shadow] skip on-chain mock check");
    return;
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const pool = new ethers.Contract(
    poolAddr,
    ["function verifier() view returns (address)", "function swapAdaptor() view returns (address)"],
    provider
  );
  const [v, s] = await Promise.all([pool.verifier(), pool.swapAdaptor()]);
  const [codeV, codeS] = await Promise.all([provider.getCode(v), provider.getCode(s)]);
  if (ethers.keccak256(codeV) === fp.mockVerifierBytecodeHash) throw new Error("MockVerifier");
  if (ethers.keccak256(codeS) === fp.mockSwapAdaptorBytecodeHash) throw new Error("MockSwapAdaptor");
  console.log("[e2e-shadow] on-chain mock fingerprint check OK");
}

async function pollMerkle(commitment) {
  for (let i = 0; i < MERKLE_POLL_MAX; i += 1) {
    const r = await requestJson("GET", `${API_URL}/merkle/${encodeURIComponent(commitment)}`);
    if (r.status === 200 && r.json?.merkleRoot) return r.json;
    const detail = r.json?.error || r.text || r.raw || "";
    console.log(`[e2e-shadow] merkle poll ${i + 1}/${MERKLE_POLL_MAX} status=${r.status}`, detail && String(detail).slice(0, 200));
    await new Promise((res) => setTimeout(res, MERKLE_POLL_MS));
  }
  throw new Error("Merkle path timeout");
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  if (!E2E_USER_PRIVATE_KEY) {
    console.error("Set E2E_USER_PRIVATE_KEY");
    process.exit(1);
  }
  const { discoverRelayerApiUrl } = require("./lib/relayerApiDiscover.cjs");
  const d = await discoverRelayerApiUrl(API_URL || process.env.API_URL);
  API_URL = d.url;
  if (d.hint) console.warn("[e2e-shadow]", d.hint);
  console.log("[e2e-shadow] API_URL", API_URL);

  let pk = E2E_USER_PRIVATE_KEY;
  if (!pk.startsWith("0x") && /^[0-9a-fA-F]{64}$/.test(pk)) pk = `0x${pk}`;
  const wallet = new ethers.Wallet(pk);
  console.log("[e2e-shadow] user", wallet.address);

  const health = await requestJson("GET", `${API_URL}/health`);
  if (health.status !== 200) throw new Error(`health ${health.status}`);
  const cfg = await requestJson("GET", `${API_URL}/config`);
  if (cfg.status !== 200) throw new Error("config failed");
  const chainId = Number(cfg.json.chainId || 97);
  const pool = cfg.json.addresses?.shieldedPool;
  const rpcUrl = String(cfg.json.rpcUrl || "").trim();
  if (!pool) throw new Error("missing pool");
  if (rpcUrl) await assertPoolNotMockOnChain(rpcUrl, pool);

  const provider = new ethers.JsonRpcProvider(rpcUrl || "https://data-seed-prebsc-1-s1.binance.org:8545");
  const user = wallet.connect(provider);

  const blindingFactor = String(BigInt("0x" + crypto.randomBytes(16).toString("hex")));
  const ownerPublicKey = String(BigInt("0x" + crypto.randomBytes(16).toString("hex")));
  const inputAssetId = 0;
  const note = { assetId: inputAssetId, amount: DEPOSIT_WEI, blindingFactor, ownerPublicKey };
  const canonDep = canonicalizeNote({ ...note, assetID: note.assetId });
  const commitment = canonDep.commitment;
  const commitmentDecDeposit = String(BigInt(commitment));
  const deadline = Math.floor(Date.now() / 1000) + 900;

  const domain = {
    name: "ShadowDeFiRelayer",
    version: "1",
    chainId,
    verifyingContract: pool,
  };
  const message = {
    depositor: wallet.address,
    token: ethers.ZeroAddress,
    amount: DEPOSIT_WEI,
    commitment,
    assetID: inputAssetId,
    deadline,
  };
  const signature = await user.signTypedData(domain, DEPOSIT_TYPES, message);

  const shadowRes = await requestJson("POST", `${API_URL}/shadow-address`, { ...message, signature });
  if (shadowRes.status !== 200) throw new Error(`shadow-address ${shadowRes.status} ${shadowRes.raw}`);
  const shadowAddress = shadowRes.json.shadowAddress;
  const feeWei = BigInt(shadowRes.json.feeWei || "0");
  const totalFunding = BigInt(DEPOSIT_WEI) + feeWei + SHADOW_SWEEP_GAS_BUFFER_WEI;
  console.log("[e2e-shadow] deposit shadowAddress", shadowAddress);
  console.log("[e2e-shadow] user → shadow fundingWei", totalFunding.toString());

  const fundTx = await user.sendTransaction({ to: shadowAddress, value: totalFunding });
  await fundTx.wait();
  console.log("[e2e-shadow] funding tx (user wallet → shadow)", fundTx.hash);

  let sweep = null;
  let lastErr = null;
  for (let i = 0; i < 8; i += 1) {
    try {
      sweep = await requestJson("POST", `${API_URL}/shadow-sweep`, { shadowAddress, commitment });
      if (sweep.status === 200) {
        lastErr = null;
        break;
      }
      lastErr = sweep.raw;
    } catch (e) {
      lastErr = e;
    }
    await sleep(2000);
  }
  if (!sweep || sweep.status !== 200) throw new Error(`shadow-sweep failed: ${lastErr}`);
  const sweepTx = sweep.json?.txHash;
  if (!sweepTx) {
    throw new Error(`shadow-sweep returned no txHash: ${JSON.stringify(sweep.json || {})}`);
  }
  console.log("[e2e-shadow] sweep tx (shadow → pool depositForBNB)", sweepTx);
  console.log("[e2e-shadow] signedDepositor (user)", sweep.json?.signedDepositor);
  console.log("[e2e-shadow] poolDepositorOnChain (shadow)", sweep.json?.poolDepositorOnChain);

  try {
    const notePersist = await requestJson("POST", `${API_URL}/notes/from-deposit`, {
      txHash: sweepTx,
      ownerAddress: wallet.address,
      note: {
        assetID: inputAssetId,
        amount: DEPOSIT_WEI,
        blindingFactor,
        ownerPublicKey,
      },
    });
    if (notePersist.status === 200) console.log("[e2e-shadow] server note stored", notePersist.json?.noteId);
    else console.warn("[e2e-shadow] notes/from-deposit", notePersist.status, notePersist.raw);
  } catch (e) {
    console.warn("[e2e-shadow] notes/from-deposit skipped", e.message || e);
  }

  const merkle = await pollMerkle(commitment);
  console.log("[e2e-shadow] merkle root", merkle.merkleRoot);

  const notePayload = {
    version: 1,
    assetID: note.assetId,
    amount: note.amount,
    blindingFactor: note.blindingFactor,
    ownerPublicKey: note.ownerPublicKey,
    commitmentDecimal: commitmentDecDeposit,
    commitmentHex: commitment,
  };
  const nullifier = computeNullifier(commitment, note.ownerPublicKey);
  const nullifierHex = `0x${nullifier.toString(16).padStart(64, "0")}`;

  const wbnb = canonicalWbnb(chainId);
  const tokenIn = wbnb;
  const tokenOut = OUTPUT_TOKEN;
  const amountWei = note.amount;
  const chainSlug = chainId === 97 ? "bsc-testnet" : "bsc";

  const qRough = await requestJson("POST", `${API_URL}/quote`, {
    tokenIn,
    tokenOut,
    amountIn: amountWei,
    tokenInDecimals: 18,
    tokenOutDecimals: 18,
    slippageBps: SLIPPAGE_BPS,
    chainSlug,
  });
  if (qRough.status !== 200) throw new Error(`quote ${qRough.status}`);
  const rough = qRough.json;

  const gasCapBn = BigInt(E2E_MAX_SWAP_GAS_REFUND_WEI);
  const fallbackGasBn = BigInt(E2E_SWAP_GAS_REFUND_FALLBACK_WEI);
  let gasRefundBn = BigInt(String(rough.suggestedGasRefundWei || "0"));
  if (gasRefundBn === 0n) gasRefundBn = fallbackGasBn;
  if (gasRefundBn > gasCapBn) gasRefundBn = gasCapBn;
  const gasRefund = gasRefundBn.toString();
  const joinSplitProtocolBn = BigInt(E2E_JOIN_SPLIT_PROTOCOL_FEE_WEI);
  const reserveBn = BigInt(E2E_RESERVE_CHANGE_AFTER_SWAP_WEI);
  const noteBn = BigInt(amountWei);
  const swapAmountBn = noteBn - joinSplitProtocolBn - gasRefundBn - reserveBn;
  if (swapAmountBn <= 0n) throw new Error("swapAmount <= 0");

  const qSwap = await requestJson("POST", `${API_URL}/quote`, {
    tokenIn,
    tokenOut,
    amountIn: swapAmountBn.toString(),
    tokenInDecimals: 18,
    tokenOutDecimals: 18,
    slippageBps: SLIPPAGE_BPS,
    chainSlug,
  });
  if (qSwap.status !== 200) throw new Error(`quote swap ${qSwap.status}`);
  const quote = qSwap.json;
  const protocolFee = joinSplitProtocolBn.toString();
  const minOut = String(quote.minAmountOut || "0");
  const outAmt = String(quote.amountOut || "0");
  if (BigInt(minOut) <= 0n) throw new Error("minAmountOut invalid");

  const intentDeadline = Math.floor(Date.now() / 1000) + 900;
  const noteNonce = Date.now();
  const intentReq = {
    userAddress: wallet.address,
    inputAssetID: inputAssetId,
    outputAssetID: outputAssetId(tokenOut),
    amountIn: swapAmountBn.toString(),
    minAmountOut: minOut,
    nonce: String(noteNonce),
    nullifier: nullifierHex,
    deadline: intentDeadline,
  };
  const intentRes = await requestJson("POST", `${API_URL}/intent`, intentReq);
  if (intentRes.status !== 200) throw new Error(`intent ${intentRes.status}`);
  const { intentId, intent, domain: idDomain, types } = intentRes.json;
  const signPayload = {
    user: intent.userAddress,
    inputAssetID: intent.inputAssetID,
    outputAssetID: intent.outputAssetID,
    amountIn: intent.amountIn,
    minAmountOut: intent.minAmountOut,
    deadline: intent.deadline,
    nonce: intent.nonce,
    nullifier: intent.nullifier,
  };
  const intentSig = await wallet.signTypedData(idDomain, types || {}, signPayload);

  const swapBlinding = String(BigInt("0x" + crypto.randomBytes(16).toString("hex")));
  const changeBlinding = String(BigInt("0x" + crypto.randomBytes(16).toString("hex")));
  const proofBody = {
    inputNote: {
      assetID: notePayload.assetID,
      amount: notePayload.amount,
      blindingFactor: notePayload.blindingFactor,
      ownerPublicKey: notePayload.ownerPublicKey,
      nullifier: nullifierHex,
      commitment: commitmentDecDeposit,
    },
    outputNoteSwap: {
      assetID: outputAssetId(tokenOut),
      amount: outAmt,
      blindingFactor: swapBlinding,
      commitment: "0",
    },
    outputNoteChange: {
      assetID: notePayload.assetID,
      amount: "0",
      blindingFactor: changeBlinding,
      commitment: "0",
    },
    merkleRoot: merkle.merkleRoot,
    merklePath: merkle.merklePath,
    merklePathIndices: merkle.merklePathIndices,
    swapAmount: swapAmountBn.toString(),
    minOutputAmount: minOut,
    protocolFee,
    gasRefund,
  };
  const gen = await requestJson("POST", `${API_URL}/swap/generate-proof`, proofBody);
  if (gen.status !== 200) throw new Error(`generate-proof ${gen.status}`);
  const swapData = {
    proof: gen.json.proof,
    publicInputs: gen.json.publicInputs,
    swapParams: {
      tokenIn: ethers.ZeroAddress,
      tokenOut: String(tokenOut).toLowerCase() === ethers.ZeroAddress.toLowerCase() ? wbnb : tokenOut,
      amountIn: swapAmountBn.toString(),
      minAmountOut: minOut,
      fee: Number(quote.routeParams?.feeTier || 2500),
      sqrtPriceLimitX96: String(quote.routeParams?.sqrtPriceLimitX96 || 0),
      path: quote.routeParams?.path || "0x",
    },
    encryptedPayload: "0x",
  };
  const swapOut = await requestJson("POST", `${API_URL}/swap`, { intentId, intent, intentSig, swapData });
  if (swapOut.status !== 200) throw new Error(`swap ${swapOut.status} ${swapOut.raw}`);
  console.log("[e2e-shadow] swap tx (relayer → pool)", swapOut.json?.txHash);

  const postSwapWaitMs = Number(process.env.E2E_POST_SWAP_WAIT_MS || 4000);
  if (postSwapWaitMs > 0) {
    console.log("[e2e-shadow] waiting ms after swap (merkle/index sync)", postSwapWaitMs);
    await sleep(postSwapWaitMs);
  }

  if (String(process.env.E2E_SKIP_WITHDRAW || "").toLowerCase() === "true") {
    console.log("[e2e-shadow] E2E_SKIP_WITHDRAW=true — done.");
    process.exit(0);
  }

  const piSwap = gen.json.publicInputs;
  const busdAssetId = Number(piSwap.outputAssetIDSwap);
  const swapOutAmountStr = String(piSwap.outputAmountSwap);
  const swapCommitHex = ethers.zeroPadValue(ethers.toBeHex(BigInt(String(piSwap.outputCommitmentSwap))), 32);
  const swapCommitDec = String(BigInt(String(piSwap.outputCommitmentSwap)));

  const sanityRough = await requestJson("POST", `${API_URL}/quote`, {
    tokenIn: canonicalWbnb(chainId),
    tokenOut: OUTPUT_TOKEN,
    amountIn: String(5n * 10n ** 15n),
    tokenInDecimals: 18,
    tokenOutDecimals: 18,
    slippageBps: SLIPPAGE_BPS,
    chainSlug,
  });
  if (sanityRough.status === 200 && sanityRough.json?.amountOut) {
    console.log(
      "[e2e-shadow] quote sanity: ~BUSD for 0.005 tBNB notional (rough, pre-fees)",
      sanityRough.json.amountOut
    );
  }

  const swapNoteForWithdraw = {
    version: 1,
    assetID: busdAssetId,
    amount: swapOutAmountStr,
    blindingFactor: swapBlinding,
    ownerPublicKey: notePayload.ownerPublicKey,
    commitmentDecimal: swapCommitDec,
    commitmentHex: swapCommitHex,
  };
  const merkleBusd = await pollMerkle(swapNoteForWithdraw.commitmentHex);
  const nullifierSwap = computeNullifier(swapCommitHex, notePayload.ownerPublicKey);
  const nullifierSwapHex = `0x${nullifierSwap.toString(16).padStart(64, "0")}`;

  const busdIn = BigInt(swapOutAmountStr);
  const reserveChangeBusd = BigInt(process.env.E2E_WITHDRAW_BUSD_RESERVE_WEI || "1000000000000000");
  const protocolFeeW = String(process.env.E2E_WITHDRAW_BUSD_PROTOCOL_FEE_WEI ?? "0");
  const gasRefundW = String(process.env.E2E_WITHDRAW_BUSD_GAS_REFUND_WEI ?? "0");
  if (BigInt(protocolFeeW) !== 0n || BigInt(gasRefundW) !== 0n) {
    console.warn(
      "[e2e-shadow] Non-zero BUSD withdraw protocolFee/gasRefund in ZK is discouraged; pool pays gasRefund as native BNB from gasReserve."
    );
  }
  const withdrawPayoutBn = busdIn - reserveChangeBusd - BigInt(protocolFeeW) - BigInt(gasRefundW);
  if (withdrawPayoutBn <= 0n) throw new Error("BUSD withdraw payout <= 0 (increase swap output or lower reserve)");
  const changeWei = busdIn - withdrawPayoutBn - BigInt(protocolFeeW) - BigInt(gasRefundW);
  if (changeWei <= 0n) throw new Error("BUSD withdraw change <= 0");

  const changeBlindingW = String(BigInt("0x" + crypto.randomBytes(16).toString("hex")));
  const wProofBody = {
    inputNote: {
      assetID: swapNoteForWithdraw.assetID,
      amount: swapNoteForWithdraw.amount,
      blindingFactor: swapNoteForWithdraw.blindingFactor,
      ownerPublicKey: swapNoteForWithdraw.ownerPublicKey,
      nullifier: nullifierSwapHex,
      commitment: swapCommitDec,
    },
    outputNoteChange: {
      assetID: swapNoteForWithdraw.assetID,
      amount: changeWei.toString(),
      blindingFactor: changeBlindingW,
      commitment: "0",
    },
    merkleRoot: merkleBusd.merkleRoot,
    merklePath: merkleBusd.merklePath,
    merklePathIndices: merkleBusd.merklePathIndices,
    protocolFee: protocolFeeW,
    gasRefund: gasRefundW,
    withdrawAmount: withdrawPayoutBn.toString(),
  };
  const wgen = await requestJson("POST", `${API_URL}/withdraw/generate-proof`, wProofBody);
  if (wgen.status !== 200) throw new Error(`withdraw proof ${wgen.status}`);

  const withdrawData = {
    proof: wgen.json.proof,
    publicInputs: wgen.json.publicInputs,
    finalRecipient: wallet.address,
    ownerAddress: wallet.address.toLowerCase(),
    noteHints: {
      change: {
        assetId: busdAssetId,
        amount: changeWei.toString(),
        blindingFactor: changeBlindingW,
        ownerPublicKey: notePayload.ownerPublicKey,
      },
    },
    encryptedPayload: "0x",
  };
  const wdOut = await requestJson("POST", `${API_URL}/withdraw`, { withdrawData });
  if (wdOut.status !== 200) throw new Error(`withdraw ${wdOut.status} ${wdOut.raw}`);
  const wd = wdOut.json || {};
  console.log("[e2e-shadow] withdraw pool tx (relayer → pool, BUSD payout to withdraw-shadow)", wd.txHash);
  console.log("[e2e-shadow] withdrawPayoutShadow", wd.withdrawPayoutShadow);
  console.log("[e2e-shadow] userFinalRecipient", wd.userFinalRecipient);
  console.log("[e2e-shadow] shadow ERC20 forward tx", wd.shadowForwardTokenTxHash || wd.shadowForwardTxHash);
  console.log("[e2e-shadow] shadowForwardTokenWei", wd.shadowForwardTokenWei);
  if (wd.shadowForwardTokenError) console.error("[e2e-shadow] shadowForwardTokenError", wd.shadowForwardTokenError);
  if (wd.shadowForwardError) console.error("[e2e-shadow] shadowForwardError", wd.shadowForwardError);
  if (wd.shadowForwardSkippedMismatch) console.error("[e2e-shadow] shadowForwardSkippedMismatch", JSON.stringify(wd));

  try {
    const busd = new ethers.Contract(
      OUTPUT_TOKEN,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );
    const bal = await busd.balanceOf(wallet.address);
    console.log("[e2e-shadow] user wallet BUSD balance (after forward)", bal.toString());
    if (withdrawPayoutBn > 0n && !wd.shadowForwardTokenTxHash && bal === 0n) {
      throw new Error(
        "diagram_incomplete: pool withdraw ok but BUSD not forwarded to user (check relayer shadowForwardTokenError / pool BUSD transfer / RPC)"
      );
    }
  } catch (e) {
    if (e.message && e.message.startsWith("diagram_incomplete")) throw e;
    console.warn("[e2e-shadow] could not read user BUSD balance", e.message || e);
  }

  console.log("\n[e2e-shadow] Diagram flow completed (shadow deposit → BNB→BUSD swap → BUSD shadow withdraw + token forward).");
}

main().catch((e) => {
  console.error("[e2e-shadow] FAILED:", e.message || e);
  process.exit(1);
});
