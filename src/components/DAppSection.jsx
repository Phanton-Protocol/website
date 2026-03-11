import { useState, useCallback } from 'react';
import RelayerStatus from './RelayerStatus';
import ReportingKeys from './ReportingKeys';
import FHEMatching from './FHEMatching';

function DAppSection() {
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

  return (
    <section className="section" id="dapp">
      <div className="container">
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-label">DApp</div>
          <h2 className="display-lg">
            Relayer status, reporting keys,<br /><em>FHE matching.</em>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', maxWidth: '640px', marginTop: '1rem' }}>
            Check whether Chainalysis sanctions screening is enabled, manage tax reporting keys (create, revoke, export), and place OTC orders when the FHE matching service is running.
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <RelayerStatus />
          <ReportingKeys wallet={wallet} onWalletConnect={connectWallet} />
          <FHEMatching />
        </div>
      </div>
    </section>
  );
}

export default DAppSection;
