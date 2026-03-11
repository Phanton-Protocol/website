import { API_URL } from '../config';

const base = (path) => `${API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export async function getRelayer() {
  const res = await fetch(base('/relayer'));
  if (!res.ok) throw new Error(res.statusText || 'Relayer fetch failed');
  return res.json();
}

export async function createReportingKey(walletAddress, signature, message) {
  const res = await fetch(base('/tax-reporting-keys'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet: walletAddress, signature, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || res.statusText || 'Create key failed');
  }
  return res.json();
}

export async function revokeReportingKey(walletAddress, signature, message) {
  const res = await fetch(base('/tax-reporting-keys/revoke'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet: walletAddress, signature, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || res.statusText || 'Revoke failed');
  }
  return res.json();
}

export async function getTaxExport(key) {
  const url = new URL(base('/tax-export'));
  url.searchParams.set('key', key);
  const res = await fetch(url.toString(), {
    headers: { 'X-Tax-Reporting-Key': key },
  });
  if (!res.ok) throw new Error(res.statusText || 'Export failed');
  return res.json();
}

export async function getFhePublicKey() {
  const res = await fetch(base('/fhe/public-key'));
  if (!res.ok) throw new Error(res.statusText || 'FHE public key unavailable');
  return res.json();
}

export async function encryptFhe(payload) {
  const res = await fetch(base('/fhe/encrypt'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(res.statusText || 'Encrypt failed');
  return res.json();
}

export async function submitFheOrder(orderPayload) {
  const res = await fetch(base('/fhe/order'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderPayload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || res.statusText || 'Order submit failed');
  }
  return res.json();
}
