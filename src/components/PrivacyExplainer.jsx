import { motion } from 'framer-motion';

const PrivacyExplainer = () => {
  const steps = [
    {
      title: "Commit-Reveal Scheme",
      desc: "Users submit a cryptographic hash of their order first. After a mandatory 3-second delay, the pre-image is revealed. No mempool observer can extract actionable information from the hash before the reveal window closes."
    },
    {
      title: "Deadline Enforcement",
      desc: "Every transaction carries a submission deadline encoded in the ZK proof. Transactions held past their validity window are rejected at contract level, regardless of proof validity. This eliminates time-bandit and delayed-execution attacks."
    },
    {
      title: "Nonce Sequencing",
      desc: "Per-user nonces are embedded in each proof, enforcing strict ordering. Replay attacks, transaction substitution, and out-of-sequence submission are cryptographically impossible."
    },
    {
      title: "Proof Batching",
      desc: "Multiple transactions are batched and submitted together, reducing the per-transaction exposure window to near zero. Batch ordering is determined by proof timestamp, not relayer discretion."
    }
  ];

  return (
    <section className="section" id="security">
      <div className="container">
        <div style={{ marginBottom: '4rem' }}>
          <div className="section-label">Cryptographic Stack</div>
          <h2 className="display-lg">
            Privacy built on<br /><em>mathematics,</em> not policy.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 1fr)', gap: '4rem', alignItems: 'start' }}>

          {/* Left: Step list */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                style={{
                  padding: '2.5rem 0',
                  borderTop: idx === 0 ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.03)',
                  display: 'flex',
                  gap: '2rem'
                }}
              >
                <div style={{ color: 'var(--cyan)', marginTop: '0.2rem' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.4rem',
                    fontWeight: 400,
                    marginBottom: '1rem',
                  }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
            <div className="divider" />
          </div>

          {/* Right: Terminal Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="terminal"
            style={{ position: 'sticky', top: '120px' }}
          >
            <div className="terminal-header">
              <div className="terminal-dot" style={{ background: '#ff5f56' }} />
              <div className="terminal-dot" style={{ background: '#ffbd2e' }} />
              <div className="terminal-dot" style={{ background: '#27c93f' }} />
              <span className="mono t-dim" style={{ marginLeft: '1rem', fontSize: '0.65rem' }}>phantom-node — proof-verifier — live</span>
            </div>
            <div className="terminal-body mono">
              <div style={{ marginBottom: '1.5rem' }}>
                <span className="t-cyan">{">"}</span> Proof received <span className="t-white">[0x7f3a...b812]</span><br />
                <span className="t-dim">timestamp : 1709123844</span><br />
                <span className="t-dim">type : SWAP</span><br />
                <span className="t-dim">nonce : 0x000000000000002f</span><br />
                <span className="t-dim">deadline : 1709123847</span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span className="t-cyan">{">"}</span> Running Groth16 verification...<br />
                <span className="t-green">✓ note_exists : valid</span><br />
                <span className="t-green">✓ amount_conservation: valid</span><br />
                <span className="t-green">✓ nullifier_unique : valid</span><br />
                <span className="t-green">✓ ownership_proof : valid</span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span className="t-cyan">{">"}</span> Broadcasting validator signature...<br />
                <span className="t-green">✓ Staker consensus : 68/100 (68%)</span><br />
                <span className="t-green">✓ Threshold met : {">"} 66%</span>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <span className="t-yellow">MEV window exposure : 0.0s</span><br />
                <span className="t-green">✓ Submitting to pool contract</span>
              </div>

              <div>
                <span className="t-cyan">{">"}</span> Execution complete. Note nullified.<br />
                <span className="t-green">✓ New output note issued: [0xa1f9...22c6]</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          #security .container > div:last-child {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default PrivacyExplainer;
