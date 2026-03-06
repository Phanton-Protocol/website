import { motion } from 'framer-motion';

const Roadmap = () => {
    const phases = [
        {
            num: "01",
            title: "Genesis Node",
            desc: "Laying the foundations of privacy-first institutional DeFi. Core architecture and initial cryptographic primitives established.",
            items: ["Whitepaper v1.0", "ZK-SNARKs Engine Blueprint", "Institutional Framework Design"]
        },
        {
            num: "02",
            title: "Dark Pool Init",
            desc: "FHE-based encrypted matching: orders matched on ciphertext so neither side reveals amount or direction. Real liquidity meets zero-knowledge and fully homomorphic encryption.",
            items: ["FHE Internal Matching (SEAL)", "Testnet Deployment", "Selective Disclosure Keys"]
        },
        {
            num: "03",
            title: "Omnichain Flux",
            desc: "Scaling privacy across the fragmented multi-chain landscape. Boundless, untraceable liquidity.",
            items: ["Cross-chain Obfuscation", "DEX Aggregator Integration", "Institutional SDK Release"]
        }
    ];

    return (
        <section className="section" id="roadmap">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <div className="section-label">Deployment Schedule</div>
                        <h2 className="display-lg">
                            The<br /><em>roadmap.</em>
                        </h2>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {phases.map((phase, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, duration: 0.6 }}
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(80px, auto) 1fr',
                                gap: '3rem',
                                padding: '3rem 0',
                                borderTop: idx === 0 ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.03)'
                            }}
                        >
                            <div className="display-lg" style={{ color: 'var(--text-tertiary)', fontSize: 'clamp(3rem, 5vw, 4.5rem)', lineHeight: 0.9 }}>
                                {phase.num}
                            </div>
                            <div>
                                <h3 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '2rem',
                                    fontWeight: 400,
                                    marginBottom: '1rem',
                                    color: 'var(--cyan)'
                                }}>
                                    {phase.title}
                                </h3>
                                <p style={{
                                    color: '#fff',
                                    fontSize: 'var(--body-size)',
                                    fontWeight: 500,
                                    lineHeight: 'var(--body-line)',
                                    maxWidth: '600px',
                                    marginBottom: '2rem'
                                }}>
                                    {phase.desc}
                                </p>
                                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                    {phase.items.map((item, i) => (
                                        <div key={i} className="mono text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: 4, height: 4, background: 'var(--cyan)', borderRadius: '50%' }} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <div className="divider" />
                </div>
            </div>

            <style>{`
                @media (max-width: 640px) {
                    #roadmap .container > div:last-child > div {
                        grid-template-columns: 1fr !important;
                        gap: 1.5rem !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default Roadmap;
