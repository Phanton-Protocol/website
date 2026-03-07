import { motion } from 'framer-motion';
import { DAPP_URL } from '../config';

const audiences = [
  {
    tag: 'BANKS',
    title: 'Banks & custodians',
    body: 'Offer privacy-preserving settlement and treasury flows to clients. Phantom’s shielded pool and per-wallet reporting keys support audit and regulatory needs without exposing positions on-chain.',
  },
  {
    tag: 'INSTITUTIONS',
    title: 'Institutions & funds',
    body: 'Execute payroll, rebalance treasuries, and manage payouts without broadcasting strategy or recipient lists. Selective disclosure keys let auditors and lawyers see only what they need.',
  },
  {
    tag: 'TRADERS',
    title: 'Traders & market makers',
    body: 'Swap and move size inside the pool with reduced on-chain footprint. OTC-style internal matching (in development): set the price you want to buy or sell at; when a counterparty comes with a matching order, you’re filled. No public order book, no price impact. Today you get shielded deposits, swaps via DEX, and withdrawals.',
  },
  {
    tag: 'TEAMS',
    title: 'Teams & treasuries',
    body: 'Run payroll from a single deposit and distribute privately. OTC-style internal matching: set your price to sell (or buy) tokens or LP; when someone comes with the opposite order at a compatible price, you match inside the shielded pool — no public book, zero visible impact.',
  },
];

const WhoCanUseIt = () => (
  <section className="section" id="who-its-for">
    <div className="container">
      <div style={{ marginBottom: '4rem' }}>
        <div className="section-label">Who it's for</div>
        <h2 className="display-lg">
          Built for <em>banks</em>, institutions,
          <br />
          traders, and teams.
        </h2>
        <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', maxWidth: '560px', marginTop: '1.5rem' }}>
          Phantom provides private, compliant rails for on-chain money — payroll, treasury, and OTC-style matching (set your price; when someone comes, you match) so size never hits the public book.
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
            style={{ display: 'flex', flexDirection: 'column' }}
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

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        style={{ marginTop: '3rem', textAlign: 'center' }}
      >
        <a
          href={DAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'var(--cyan)',
            color: '#0a0a0a',
            padding: '0.85rem 2rem',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-block',
            transition: 'opacity 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.boxShadow = '0 0 28px rgba(0,229,199,0.35)'; }}
          onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.boxShadow = 'none'; }}
        >
          Open DApp
        </a>
      </motion.div>
    </div>
  </section>
);

export default WhoCanUseIt;
