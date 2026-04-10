import { motion } from 'framer-motion';

const audiences = [
  {
    tag: 'TRADERS',
    title: 'Traders & market makers',
    body: 'Swap and move size inside the pool with reduced on-chain footprint. OTC-style internal matching (in development): set the price you want to buy or sell at; when a counterparty comes with a matching order, you’re filled. No public order book, no price impact. Today you get shielded deposits, swaps via DEX, and withdrawals.',
  },
  {
    tag: 'INSTITUTIONS',
    title: 'Institutions & funds',
    body: 'Execute payroll, rebalance treasuries, and manage payouts without broadcasting strategy or recipient lists. Selective disclosure keys let auditors and lawyers see only what they need.',
  },
  {
    tag: 'BANKS (Saas)',
    title: 'Banks & Custodians',
    body: 'Offer Privacy preserving settlement and treasury flows to clinets. Users depositing crypto directly into there bank accounts without any third parties, Settlement within the Bank or a custodian without any on-chain footprint.',
  },
  {
    tag: 'DEVELOPERS SDK',
    title: 'Developers & builders',
    body: 'Build on-chain contracts, messaging apps, and treasury tools with our SDK and APIs. Relayer API for proofs and submissions; contract interfaces for ShieldedPool, NoteStorage, SwapAdaptor. See the Build / SDK section.',
  },
];

const WhoCanUseIt = () => (
  <section className="section" id="who-its-for" style={{ scrollMarginTop: '8rem' }}>
    <div className="container">
      <div style={{ marginBottom: '4rem' }}>
        <div className="section-label">Who it's for</div>
        <h2 className="display-lg">
          Built for those who seeks compliant based privacy onchain
        </h2>
        <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', maxWidth: '560px', marginTop: '1.5rem' }}>
          Phantom provides private, compliant rails for on-chain money — payroll, treasury, and OTC-style matching.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {audiences.map((a, i) => (
          <motion.div
            key={i}
            className="card"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08, duration: 0.6 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--cyan)',
              marginBottom: '1rem',
            }}>
              {a.tag}
            </span>
            <h3 style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 700,
              fontSize: '1.15rem',
              color: '#fff',
              marginBottom: '0.75rem',
            }}>
              {a.title}
            </h3>
            <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', flexGrow: 1 }}>
              {a.body}
            </p>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default WhoCanUseIt;
