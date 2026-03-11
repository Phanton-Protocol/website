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
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>$2 deposit: $1.50 treasury, $0.50 to relayer</h3>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>
            Each deposit into the shielded pool costs a flat fee of $2 worth of BNB. Of this, $1.50 goes to the protocol treasury and $0.50 to the relayer who submits the deposit—a successful relayer gets $0.50 on every user deposit. No percentage on the amount deposited.
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
          <div className="mono text-cyan" style={{ marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>SWAP — VIA PANCAKESWAP</div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>0.1%</h3>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>
            When your swap is routed through PancakeSwap (no internal match available), the protocol fee is 0.1% of the swap amount. Gas is taken from your deposited balance and repaid to the relayer; you may also pay a relayer fee.
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
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          style={{ padding: '2rem' }}
        >
          <div className="mono text-cyan" style={{ marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>GAS & RELAYER FEE</div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>You pay gas from your balance</h3>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>
            Gas is deducted from your deposited balance (note) in the circuit and repaid to the relayer. Relayers do not pay gas out of pocket. They may also charge a relayer fee; both are shown in the DApp before you confirm.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

export default FeesSection;
