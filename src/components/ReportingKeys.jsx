import { useState } from 'react';
import {
  createReportingKey,
  revokeReportingKey,
  getTaxExport,
} from '../api/phantomApi';

const REPORTING_MESSAGE_PREFIX = 'Phantom Protocol tax reporting key:';

function ReportingKeys({ wallet, onWalletConnect }) {
  const [createStatus, setCreateStatus] = useState('');
  const [createError, setCreateError] = useState('');
  const [revokeStatus, setRevokeStatus] = useState('');
  const [revokeError, setRevokeError] = useState('');
  const [exportKey, setExportKey] = useState('');
  const [exportResult, setExportResult] = useState(null);
  const [exportError, setExportError] = useState('');
  const [issuedKey, setIssuedKey] = useState('');

  const signMessage = async (message) => {
    if (!window.ethereum) throw new Error('No wallet (e.g. MetaMask) detected');
    const hex = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, wallet],
    });
    return hex;
  };

  const handleCreateKey = async () => {
    setCreateError('');
    setCreateStatus('Requesting signature…');
    try {
      const message = `${REPORTING_MESSAGE_PREFIX} ${Date.now()}`;
      const signature = await signMessage(message);
      setCreateStatus('Creating key…');
      const result = await createReportingKey(wallet, signature, message);
      const key = result.key ?? result.reportingKey ?? result;
      setIssuedKey(typeof key === 'string' ? key : JSON.stringify(key));
      setCreateStatus('Key created. Store it securely; it is shown only once.');
    } catch (e) {
      setCreateError(e.message || 'Failed');
      setCreateStatus('');
    }
  };

  const handleRevokeKey = async () => {
    setRevokeError('');
    setRevokeStatus('Requesting signature…');
    try {
      const message = `${REPORTING_MESSAGE_PREFIX} revoke ${Date.now()}`;
      const signature = await signMessage(message);
      setRevokeStatus('Revoking…');
      await revokeReportingKey(wallet, signature, message);
      setRevokeStatus('Key revoked.');
    } catch (e) {
      setRevokeError(e.message || 'Failed');
      setRevokeStatus('');
    }
  };

  const handleExport = async () => {
    setExportError('');
    setExportResult(null);
    if (!exportKey.trim()) {
      setExportError('Enter a reporting key.');
      return;
    }
    try {
      const data = await getTaxExport(exportKey.trim());
      setExportResult(data);
    } catch (e) {
      setExportError(e.message || 'Export failed');
    }
  };

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      style={{ padding: '1.5rem 2rem' }}
    >
      <div className="section-label" style={{ marginBottom: '1rem' }}>Reporting keys</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
        Create a key to share with accountants or tax tools; revoke when no longer needed. Export history using a valid key.
      </p>

      {!wallet ? (
        <div style={{ marginBottom: '1rem' }}>
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}
            onClick={onWalletConnect}
          >
            Connect wallet to create or revoke keys
          </button>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem', marginRight: '0.75rem' }}
              onClick={handleCreateKey}
              disabled={!!createStatus && !createError}
            >
              Create reporting key
            </button>
            <button
              type="button"
              className="btn-outline"
              style={{ fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}
              onClick={handleRevokeKey}
              disabled={!!revokeStatus && !revokeError}
            >
              Revoke key (sign)
            </button>
            {createStatus && <p className="mono t-cyan" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{createStatus}</p>}
            {createError && <p className="mono" style={{ color: '#f88', fontSize: '0.8rem', marginTop: '0.5rem' }}>{createError}</p>}
            {issuedKey && (
              <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: 4 }}>
                <span className="mono t-dim" style={{ fontSize: '0.7rem' }}>Key (store securely): </span>
                <span className="mono" style={{ color: '#fff', fontSize: '0.75rem', wordBreak: 'break-all' }}>{issuedKey}</span>
              </div>
            )}
            {revokeStatus && <p className="mono t-cyan" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{revokeStatus}</p>}
            {revokeError && <p className="mono" style={{ color: '#f88', fontSize: '0.8rem', marginTop: '0.5rem' }}>{revokeError}</p>}
          </div>
        </>
      )}

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
        <label className="mono t-dim" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>
          Export history (paste key)
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <input
            type="password"
            placeholder="Reporting key"
            value={exportKey}
            onChange={(e) => setExportKey(e.target.value)}
            className="mono"
            style={{
              flex: '1 1 200px',
              minWidth: 0,
              padding: '0.5rem 0.75rem',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border)',
              borderRadius: 4,
              color: '#fff',
              fontSize: '0.8rem',
            }}
          />
          <button
            type="button"
            className="btn-outline"
            style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
            onClick={handleExport}
          >
            Export
          </button>
        </div>
        {exportError && <p className="mono" style={{ color: '#f88', fontSize: '0.8rem', marginTop: '0.5rem' }}>{exportError}</p>}
        {exportResult && (
          <pre
            className="mono t-dim"
            style={{
              marginTop: '0.75rem',
              padding: '1rem',
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 4,
              fontSize: '0.7rem',
              overflow: 'auto',
              maxHeight: 240,
            }}
          >
            {JSON.stringify(exportResult, null, 2)}
          </pre>
        )}
      </div>
    </motion.div>
  );
}

export default ReportingKeys;
