import { useState, useCallback } from 'react';
import RelayerStatus from './RelayerStatus';
import ReportingKeys from './ReportingKeys';
import FHEMatching from './FHEMatching';

function DAppSection({ embedded = false }) {
  const [wallet, setWallet] = useState(null);
  const [connectError, setConnectError] = useState('');

  const connectWallet = useCallback(async () => {
    setConnectError('');
    if (!window.ethereum) {
      setConnectError('No wallet (e.g. MetaMask) found. Install and try again.');
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts?.[0]) setWallet(accounts[0]);
      else setConnectError('No account selected.');
    } catch (e) {
      setConnectError(e.message || 'Connection failed');
    }
  }, []);

  const intro = (
    <div style={{ marginBottom: embedded ? '1.75rem' : '3rem' }}>
      <div className="section-label">{embedded ? 'Relayer tools' : 'DApp'}</div>
      <h2 className={embedded ? 'app-page__title-compact' : 'display-lg'} style={embedded ? { marginBottom: '0.65rem' } : undefined}>
        {embedded ? (
          <>Status, keys &amp; <em>matching</em></>
        ) : (
          <>
            Relayer status, reporting keys,<br /><em>FHE matching.</em>
          </>
        )}
      </h2>
      <p
        style={{
          color: 'var(--text-secondary)',
          fontSize: embedded ? '0.98rem' : 'var(--body-size)',
          fontWeight: 500,
          lineHeight: 'var(--body-line)',
          maxWidth: '640px',
          marginTop: '1rem',
        }}
      >
        Check sanctions screening flags, manage tax reporting keys (create, revoke, export), and place OTC orders when the FHE matching service is running.
      </p>
      {!wallet ? (
        <button
          type="button"
          className="btn-outline"
          style={{ marginTop: '1.25rem', fontSize: '0.8rem', padding: '0.6rem 1.2rem' }}
          onClick={connectWallet}
        >
          Connect wallet (for reporting keys)
        </button>
      ) : (
        <p className="mono t-cyan" style={{ marginTop: '1rem', fontSize: '0.85rem' }}>
          Wallet: {wallet.slice(0, 6)}…{wallet.slice(-4)}
        </p>
      )}
      {connectError && <p className="mono" style={{ color: '#f88', fontSize: '0.8rem', marginTop: '0.5rem' }}>{connectError}</p>}
    </div>
  );

  const stack = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <RelayerStatus />
      <ReportingKeys wallet={wallet} onWalletConnect={connectWallet} />
      <FHEMatching />
    </div>
  );

  if (embedded) {
    return (
      <div
        id="dapp"
        className="card"
        style={{
          padding: 'clamp(1.5rem, 4vw, 2.25rem)',
          borderColor: 'rgba(0, 229, 199, 0.2)',
          background: 'linear-gradient(165deg, rgba(18, 18, 18, 0.95) 0%, rgba(12, 14, 18, 0.98) 100%)',
        }}
      >
        {intro}
        {stack}
      </div>
    );
  }

  return (
    <section className="section" id="dapp">
      <div className="container">
        {intro}
        {stack}
      </div>
    </section>
  );
}

export default DAppSection;
