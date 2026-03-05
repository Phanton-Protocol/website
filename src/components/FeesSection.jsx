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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ padding: '2rem' }}
        >
          <div className="mono text-cyan" style={{ marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>RELAYER FEE</div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>Set by relayers</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Relayers pay gas to submit your transaction. They may charge a small fee (e.g. % of amount or flat) to cover gas and margin. Fee is visible in the DApp before you confirm. Different relayers can compete on fee and speed.
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
          <div className="mono text-cyan" style={{ marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>SWAP / ROUTING</div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>DEX + spread</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Swaps are routed through an external DEX (e.g. PancakeSwap). You pay normal DEX fees and slippage; the protocol does not add an extra spread. Large internal matching (orders matched inside the pool) is roadmap — that would reduce external routing cost where orders cross.
          </p>
        </motion.div>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{ padding: '2rem' }}
        >
          <div className="mono text-cyan" style={{ marginBottom: '1rem', fontSize: '0.65rem', letterSpacing: '0.15em' }}>PROTOCOL FEE</div>
          <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.75rem' }}>None today</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            Phantom does not currently take a protocol-level fee on deposits, swaps, or withdrawals. Any future protocol fee would be announced and configurable; today your only fees are relayer fee (optional, set by relayer) and standard chain/DEX costs.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

export default FeesSection;
