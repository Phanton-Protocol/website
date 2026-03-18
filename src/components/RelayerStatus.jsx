import { useState, useEffect } from 'react';
import { getRelayer } from '../api/phantomApi';

const RelayerStatus = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getRelayer()
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="card" style={{ padding: '1.5rem 2rem' }}>
        <span className="mono t-dim">Loading relayer status…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: '1.5rem 2rem', borderColor: 'rgba(255,100,100,0.3)' }}>
        <span className="mono" style={{ color: '#f88' }}>Relayer unavailable: {error}</span>
      </div>
    );
  }

  const screening = data?.chainalysisScreening === true;
  const address = data?.relayerAddress || data?.address;

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '1.5rem 2rem' }}
    >
      <div className="section-label" style={{ marginBottom: '0.75rem' }}>Relayer status</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: screening ? 'var(--cyan)' : 'var(--text-tertiary)',
            }}
          />
          <span className="mono" style={{ color: '#fff', fontSize: '0.85rem' }}>
            Chainalysis sanctions screening: {screening ? 'enabled' : 'disabled'}
          </span>
        </div>
        {address && (
          <span className="mono t-dim" style={{ fontSize: '0.75rem' }}>
            Relayer: {address.slice(0, 6)}…{address.slice(-4)}
          </span>
        )}
        {data?.dryRun && (
          <span className="mono" style={{ color: 'var(--cyan)', fontSize: '0.75rem' }}>Dry run</span>
        )}
      </div>
    </motion.div>
  );
};

export default RelayerStatus;
