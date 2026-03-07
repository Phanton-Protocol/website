import { motion } from 'framer-motion';
import { DAPP_URL } from '../config';

const useCases = [
  {
    title: 'On-chain contracts',
    desc: 'Integrate your dApps with the shielded pool. Use our contract interfaces (ShieldedPool, NoteStorage, SwapAdaptor) to add private deposits, swaps, and withdrawals to your protocol or DAO.',
  },
  {
    title: 'Messaging & payments',
    desc: 'Build private payment rails or messaging layers that settle through Phantom. Users get shielded transfers and optional per-wallet disclosure for compliance.',
  },
  {
    title: 'Treasury & payroll apps',
    desc: 'Dashboards, payroll runners, and treasury tools that call our relayer API for proofs and submissions. Run payroll or rebalance without exposing amounts on-chain.',
  },
  {
    title: 'Trading & automation',
    desc: 'Bots and aggregators that submit swaps via our API, use internal OTC matching when available, or route through the pool for privacy-preserving execution.',
  },
];

const SDKSection = () => (
  <section className="section" id="sdk">
    <div className="container">
      <div style={{ marginBottom: '4rem' }}>
        <div className="section-label">Build on Phantom</div>
        <h2 className="display-lg">
          SDK & APIs.
          <br />
          <em>Build applications.</em>
        </h2>
        <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', maxWidth: '680px', marginTop: '1.5rem' }}>
          Use Phantom’s APIs and contract interfaces to build on-chain contracts, messaging apps, treasury tools, and more. Our relayer API handles proof generation and transaction submission; you bring the product.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '4rem' }}>
        {useCases.map((item, idx) => (
          <motion.div
            key={idx}
            className="card"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08, duration: 0.5 }}
            style={{ padding: '1.75rem' }}
          >
            <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.05rem', color: '#fff', marginBottom: '0.5rem' }}>
              {item.title}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', margin: 0 }}>
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="card" style={{ padding: '2.5rem', background: 'var(--bg-card)', marginBottom: '2rem' }}>
        <div className="mono text-cyan" style={{ fontSize: '0.6rem', letterSpacing: '0.18em', marginBottom: '1.25rem' }}>
          WHAT YOU GET
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem 2rem' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.35rem' }}>Relayer API</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
              REST endpoints for quote, intent, swap, deposit, withdraw, merkle proofs, and health. Submit proofs and get receipts.
            </p>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.35rem' }}>Contract interfaces</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
              ShieldedPool, NoteStorage, SwapAdaptor, RelayerStaking. ABIs and deployment addresses for BNB Chain testnet/mainnet.
            </p>
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 600, marginBottom: '0.35rem' }}>Client patterns</div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
              TypeScript/JS client for wallet integration, note handling, and API calls. Use our DApp as reference or ship your own UI.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <a
          href="https://github.com/phantomproto"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'var(--cyan)',
            color: '#0a0a0a',
            padding: '0.85rem 1.75rem',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'opacity 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.boxShadow = '0 0 28px rgba(0,229,199,0.35)'; }}
          onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.boxShadow = 'none'; }}
        >
          SDK & code — GitHub
        </a>
        <a
          href={DAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline-cyan btn-outline"
          style={{ fontSize: '0.7rem', padding: '0.85rem 1.75rem' }}
        >
          Try the DApp
        </a>
      </div>
    </div>
  </section>
);

export default SDKSection;
