import { motion } from 'framer-motion';

const TechCards = () => {
    const cards = [
        {
            title: "SNARK Prover",
            subtitle: "CRYPTOGRAPHIC PROOF",
            desc: "Ultra-fast zero-knowledge state transitions. Prove transaction validity without revealing the underlying data points to the consensus layer."
        },
        {
            title: "F.H.E. Engine",
            subtitle: "HOMOMORPHIC COMPUTE",
            desc: "Perform complex operations on perpetually encrypted dark pool orders. Decryption is never required for matching execution."
        },
        {
            title: "Ghost Net",
            subtitle: "P2P OBFUSCATION",
            desc: "Network-level traffic spoofing and localized mixing to prevent IP correlation and timing analysis by sophisticated adversaries."
        }
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
