import { motion } from 'framer-motion';

const TechCards = () => {
  const cards = [
    {
      title: "SNARK Prover",
      subtitle: "CRYPTOGRAPHIC PROOF",
      desc: "Groth16 proofs for deposits, swaps, withdrawals, and payroll. Prove that balances and Merkle paths are valid without revealing who owns which note.",
    },
    {
      title: "Backend Prover",
      subtitle: "RAPIDSNARK + SNARKJS",
      desc: "A backend‑first proving layer that uses Rapidsnark where available and snarkjs as a fallback, so heavy proofs don’t freeze the browser.",
    },
    {
      title: "Reporting Keys",
      subtitle: "SELECTIVE DISCLOSURE",
      desc: "Per‑wallet reporting keys for accountants, lawyers, and regulators. Share exactly the flows you need to, and nothing more.",
    },
    {
      title: "FHE (Research)",
      subtitle: "FULLY HOMOMORPHIC ENCRYPTION",
      desc: "FHE is under research for future versions — compute on encrypted data without decrypting. Today Phantom uses ZK‑SNARKs for privacy; FHE could later enhance private matching or compliance checks.",
    },
  ];

    return (
        <section className="section" id="technology">
            <div className="container">
                <div style={{ marginBottom: '4rem' }}>
                    <div className="section-label">Underlying Infrastructure</div>
                    <h2 className="display-lg">
                        Zero knowledge.<br /><em>Absolute</em> certainty.
                    </h2>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1px',
                    background: 'var(--border)'
                }}>
                    {cards.map((card, idx) => (
                        <motion.div
                            key={idx}
                            className="card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, duration: 0.6 }}
                            style={{ border: 'none', borderRadius: 0, display: 'flex', flexDirection: 'column' }}
                        >
                            <div className="mono text-cyan" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: 8, height: 8, background: 'var(--cyan)' }}></span>
                                {card.subtitle}
                            </div>
                            <h3 style={{
                                fontFamily: 'var(--font-body)',
                                fontWeight: 600,
                                fontSize: '1.25rem',
                                color: '#fff',
                                marginBottom: '1rem',
                            }}>
                                {card.title}
                            </h3>
                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                lineHeight: 1.7,
                                flexGrow: 1
                            }}>
                                {card.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechCards;
