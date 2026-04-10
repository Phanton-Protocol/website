const express = require('express');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const router = express.Router();

const FHE_SERVICE_URL = (process.env.FHE_SERVICE_URL || '').replace(/\/$/, '');

async function fheRemoteFetch(relPath, init) {
  if (!FHE_SERVICE_URL) return null;
  const url = `${FHE_SERVICE_URL}${relPath.startsWith('/') ? '' : '/'}${relPath}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), Number(process.env.FHE_SERVICE_TIMEOUT_MS || 30000));
  try {
    const r = await fetch(url, { ...init, signal: ctrl.signal });
    const text = await r.text();
    let body;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text };
    }
    if (!r.ok) {
      const err = new Error(body?.error || body?.message || `FHE service ${r.status}`);
      err.status = r.status;
      err.body = body;
      throw err;
    }
    return body;
  } finally {
    clearTimeout(t);
  }
}

const ORDER_STORE_FILE = process.env.MATCHING_ORDER_STORE || path.join(__dirname, '..', 'data', 'matching-orders.json');
const orderBook = new Map();
const MAX_ORDERS_PER_PAIR = 50;

function orderBookKey(inputAssetID, outputAssetID) {
  return `${Number(inputAssetID)}-${Number(outputAssetID)}`;
}

function normalizeFheOrder(order) {
  if (!order || order.inputAssetID === undefined || order.outputAssetID === undefined) return null;
  const inputAssetID = Number(order.inputAssetID);
  const outputAssetID = Number(order.outputAssetID);
  if (!Number.isFinite(inputAssetID) || !Number.isFinite(outputAssetID)) return null;
  return {
    ...order,
    inputAssetID,
    outputAssetID,
    fheEncryptedInputAmount: order.fheEncryptedInputAmount,
    fheEncryptedMinOutput: order.fheEncryptedMinOutput,
  };
}

function loadOrderBook() {
  try {
    if (!fs.existsSync(ORDER_STORE_FILE)) return;
    const raw = JSON.parse(fs.readFileSync(ORDER_STORE_FILE, 'utf8'));
    if (!raw || typeof raw !== 'object') return;
    for (const [k, list] of Object.entries(raw)) {
      if (!Array.isArray(list)) continue;
      orderBook.set(k, list.slice(-MAX_ORDERS_PER_PAIR));
    }
  } catch (_) {}
}

function persistOrderBook() {
  try {
    const out = {};
    for (const [k, list] of orderBook.entries()) out[k] = list;
    const dir = path.dirname(ORDER_STORE_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(ORDER_STORE_FILE, JSON.stringify(out), 'utf8');
  } catch (_) {}
}

async function registerOrderAndTryMatch(order) {
  const normalized = normalizeFheOrder(order);
  if (!normalized) {
    return { matched: false, error: "invalid_order_asset_ids" };
  }
  const key = orderBookKey(normalized.inputAssetID, normalized.outputAssetID);
  const reverseKey = orderBookKey(normalized.outputAssetID, normalized.inputAssetID);
  const reverseList = orderBook.get(reverseKey);
  if (reverseList && reverseList.length > 0) {
    const existing = reverseList[reverseList.length - 1];
    const result = await matchOrdersFHE(normalized, existing);
    if (result.matched) {
      reverseList.pop();
      if (reverseList.length === 0) orderBook.delete(reverseKey);
      else orderBook.set(reverseKey, reverseList);
      persistOrderBook();
      return { matched: true, matchResult: result };
    }
  }
  const list = orderBook.get(key) || [];
  list.push({ ...normalized, ts: Date.now() });
  if (list.length > MAX_ORDERS_PER_PAIR) list.shift();
  orderBook.set(key, list);
  persistOrderBook();
  return { matched: false };
}

async function matchOrdersFHE(order1, order2) {
  console.log('🔄 Matching FHE-encrypted orders...');

  if (FHE_SERVICE_URL) {
    try {
      const remote = await fheRemoteFetch('/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order1, order2 }),
      });
      if (remote && typeof remote.matched === 'boolean') return remote;
    } catch (e) {
      console.error('FHE remote /match failed:', e.message || e);
      throw e;
    }
  }

  const a1 = Number(order1.inputAssetID);
  const a2 = Number(order1.outputAssetID);
  const b1 = Number(order2.inputAssetID);
  const b2 = Number(order2.outputAssetID);
  const assetsMatch = a1 === b2 && a2 === b1;
  
  if (!assetsMatch) {
    return {
      matched: false,
      fheEncryptedResult: '0x',
      executionId: ethers.ZeroHash
    };
  }

  const executionId = ethers.keccak256(
    ethers.concat([
      ethers.getBytes(ethers.keccak256(ethers.toUtf8Bytes(order1.fheEncryptedInputAmount))),
      ethers.getBytes(ethers.keccak256(ethers.toUtf8Bytes(order2.fheEncryptedInputAmount))),
      ethers.toUtf8Bytes(Date.now().toString())
    ])
  );

  const fheEncryptedResult = ethers.hexlify(
    ethers.toUtf8Bytes(`FHE_MATCH:${executionId}`)
  );
  
  console.log('✅ Orders matched via FHE');
  
  return {
    matched: true,
    fheEncryptedResult,
    executionId
  };
}

router.post('/match', async (req, res) => {
  try {
    const { order1, order2 } = req.body;
    
    if (!order1 || !order2) {
      return res.status(400).json({ error: 'Missing order data' });
    }

    const n1 = normalizeFheOrder(order1);
    const n2 = normalizeFheOrder(order2);
    if (!n1 || !n2) {
      return res.status(400).json({ error: 'Invalid order asset IDs' });
    }

    if (FHE_SERVICE_URL) {
      try {
        const remote = await fheRemoteFetch('/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order1: n1, order2: n2 }),
        });
        return res.json(remote);
      } catch (e) {
        const code = e.status >= 400 && e.status < 600 ? e.status : 502;
        return res.status(code).json({ error: e.message || 'FHE service error' });
      }
    }

    const result = await matchOrdersFHE(n1, n2);
    res.json(result);
  } catch (error) {
    console.error('❌ FHE matching error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const order = req.body;
    if (!order || order.inputAssetID === undefined || order.outputAssetID === undefined) {
      return res.status(400).json({ error: 'Missing order or asset IDs' });
    }
    const { matched, matchResult, error } = await registerOrderAndTryMatch(order);
    if (error) return res.status(400).json({ error });
    res.json({ matched, matchResult: matchResult || null });
  } catch (error) {
    console.error('❌ FHE register error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/health', (req, res) => {
  const openOrders = Array.from(orderBook.values()).reduce((sum, arr) => sum + arr.length, 0);
  res.json({
    status: 'healthy',
    service: 'FHE Matching Service',
    fheEnabled: true,
    orderPairs: orderBook.size,
    openOrders,
    fheMode: FHE_SERVICE_URL ? 'remote' : 'mock',
    fheLibrary: FHE_SERVICE_URL ? 'remote-service' : 'deterministic-mock',
    fheServiceConfigured: Boolean(FHE_SERVICE_URL),
  });
});

router.post('/compute', async (req, res) => {
  try {
    const { operation, encryptedInputs } = req.body;
    
    if (!operation || !encryptedInputs) {
      return res.status(400).json({ error: 'Missing operation or inputs' });
    }

    if (FHE_SERVICE_URL) {
      try {
        const remote = await fheRemoteFetch('/compute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body),
        });
        return res.json(remote);
      } catch (e) {
        const code = e.status >= 400 && e.status < 600 ? e.status : 502;
        return res.status(code).json({ error: e.message || 'FHE service error' });
      }
    }

    console.log(`🔄 FHE computation: ${operation}`);

    const result = {
      operation,
      fheEncryptedResult: ethers.hexlify(ethers.randomBytes(32)),
      executionId: ethers.keccak256(ethers.toUtf8Bytes(Date.now().toString()))
    };
    
    res.json(result);
  } catch (error) {
    console.error('❌ FHE computation error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/public-key', async (req, res) => {
  if (FHE_SERVICE_URL) {
    try {
      const remote = await fheRemoteFetch('/public-key', { method: 'GET' });
      return res.json(remote);
    } catch (e) {
      const code = e.status >= 400 && e.status < 600 ? e.status : 502;
      return res.status(code).json({ error: e.message || 'FHE service error' });
    }
  }
  res.json({ publicKey: ethers.hexlify(ethers.randomBytes(32)) });
});

router.post('/encrypt', async (req, res) => {
  try {
    if (FHE_SERVICE_URL) {
      try {
        const remote = await fheRemoteFetch('/encrypt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req.body),
        });
        return res.json(remote);
      } catch (e) {
        const code = e.status >= 400 && e.status < 600 ? e.status : 502;
        return res.status(code).json({ error: e.message || 'FHE service error' });
      }
    }
    res.json({ ciphertext: req.body });
  } catch (e) {
    res.status(500).json({ error: e.message || 'encrypt failed' });
  }
});

router.post('/order', async (req, res) => {
  try {
    const encrypted = req.body?.ciphertext ?? req.body?.encrypted ?? req.body;
    if (!encrypted) {
      return res.status(400).json({ error: 'Missing order payload' });
    }

    const side = encrypted.side || 'sell';
    let assetIn = encrypted.assetIn;
    let assetOut = encrypted.assetOut;
    if (assetIn === undefined || assetOut === undefined) {
      return res.status(400).json({ error: 'Missing assetIn/assetOut' });
    }

    const inputAssetID = Number(assetIn);
    const outputAssetID = Number(assetOut);
    if (!Number.isFinite(inputAssetID) || !Number.isFinite(outputAssetID)) {
      return res.status(400).json({ error: 'Invalid asset IDs' });
    }

    const toFheBytes = (v) => ethers.hexlify(ethers.toUtf8Bytes(String(v)));
    const order = {
      inputAssetID,
      outputAssetID,
      fheEncryptedInputAmount: toFheBytes(encrypted.amount ?? '0'),
      fheEncryptedMinOutput: toFheBytes(encrypted.price ?? '0'),
    };

    const result = await registerOrderAndTryMatch(order);

    const orderId = ethers.keccak256(
      ethers.toUtf8Bytes(
        JSON.stringify({ inputAssetID, outputAssetID, side, ts: Date.now(), matched: !!result.matched })
      )
    );

    res.json({
      orderId,
      matched: !!result.matched,
      matchResult: result.matchResult ?? null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'order failed' });
  }
});

function getFheMatchMode() {
  return FHE_SERVICE_URL ? 'remote' : 'mock';
}

module.exports = router;
module.exports.registerOrderAndTryMatch = registerOrderAndTryMatch;
module.exports.getFheMatchMode = getFheMatchMode;
module.exports.normalizeFheOrder = normalizeFheOrder;
loadOrderBook();