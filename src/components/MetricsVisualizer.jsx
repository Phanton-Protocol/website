import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API_URL } from '../config';

const defaultMetrics = [
  { label: "PHN_VOL_24H", value: "—", info: "ENCRYPTED" },
  { label: "NODE_OPERATORS", value: "—", info: "ACTIVE" },
  { label: "ANONYMITY_SET", value: "—", info: "SHIELDED" },
  { label: "AVG_STATE_SYNC", value: "—", info: "LATENCY" }
];

function formatVolume(weiStr) {
  if (!weiStr || weiStr === "0") return "—";
  try {
    const n = Number(BigInt(weiStr) / BigInt(1e18));
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return n > 0 ? `$${n.toFixed(2)}` : "—";
  } catch {
    return "—";
  }
}

const MetricsVisualizer = () => {
  const [metrics, setMetrics] = useState(defaultMetrics);

  useEffect(() => {
    let cancelled = false;
    const base = (API_URL || "").replace(/\/$/, "");
    if (!base) return;
    fetch(`${base}/telemetry`)
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (cancelled || !data) return;
        const vol = data.volume24hWei ? formatVolume(data.volume24hWei) : (data.swapCount24h > 0 ? `${data.swapCount24h} swaps` : "—");
        setMetrics([
          { label: "PHN_VOL_24H", value: vol, info: "ENCRYPTED" },
          { label: "NODE_OPERATORS", value: data.nodeOperators != null ? String(data.nodeOperators) : "—", info: "ACTIVE" },
          { label: "ANONYMITY_SET", value: data.anonymitySet != null ? Number(data.anonymitySet).toLocaleString() : "—", info: "SHIELDED" },
          { label: "AVG_STATE_SYNC", value: "—", info: "LATENCY" }
        ]);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="section">
      <div className="container">
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <div className="mono text-cyan" style={{ letterSpacing: '0.2em' }}>/// REALTIME_NETWORK_TELEMETRY</div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
        }}>
          {metrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 1 }}
              style={{
                padding: '3rem 2rem',
                borderRight: idx !== metrics.length - 1 ? '1px solid var(--border)' : 'none',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div className="mono text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.65rem' }}>
                {metric.label}
                <span style={{ display: 'block', color: 'var(--cyan)', marginTop: '0.25rem', fontSize: '0.55rem' }}>
                  [{metric.info}]
                </span>
              </div>
              <div className="display-lg" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                {metric.value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MetricsVisualizer;
