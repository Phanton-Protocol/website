import { motion } from 'framer-motion';

const FeesSection = () => (
  <section className="section" id="fees">
    <div className="container">
      <div style={{ marginBottom: '4rem' }}>
        <div className="section-label">Fees & liquidity</div>
        <h2 className="display-lg">
          Transparent <em>fees.</em>
          <br />
          No hidden spread.
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ padding: '2rem' }}
        >
          <div className="mono text-cyan" style={{ marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>DEPOSIT</div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>$2 flat deposit fee</h3>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>
            Each deposit costs a flat $2 in the native token of that chain. No percentage is charged on the amount deposited.
          </p>
        </motion.div>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          style={{ padding: '2rem' }}
        >
          <div className="mono text-cyan" style={{ marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>SWAP VIA (E.G. PANCAKESWAP)</div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>0.1%</h3>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>
            When your swap is routed through PancakeSwap, the protocol fee is 0.1% of the swap amount.
          </p>
        </motion.div>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ padding: '2rem' }}
        >
          <div className="mono text-cyan" style={{ marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>SWAP — INTERNAL MATCH (SHIELDED POOL)</div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>0.2%</h3>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>
            OTC-style matching inside the shielded pool: you set the price you want to buy or sell at. When a counterparty submits an opposite order at a compatible price, you’re matched (0.2% fee). No public order book — your order is encrypted; when someone comes, the match is settled privately.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

export default FeesSection;
