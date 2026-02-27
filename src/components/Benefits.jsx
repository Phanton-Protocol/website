import { motion } from 'framer-motion';

const benefits = [
    {
        num: '01',
        title: 'Zero Trace Maturity',
        body: 'Mathematical guarantees that sender, receiver, and execution payloads remain completely obscured from validators and observers.',
        tag: 'CORE LAYER',
    },
    {
        num: '02',
        title: 'MEV Immunity Core',
        body: 'By encrypting order flow pre-execution, Phantom removes the possibility of sandwich attacks, front-running, and toxic arbitrage.',
        tag: 'PROTECTION',
    },
    {
        num: '03',
        title: 'Institutional Scale',
        body: 'Designed for high-throughput, low-latency execution required by institutional liquidity providers and heavy algorithmic traders.',
        tag: 'PERFORMANCE',
    },
    {
        num: '04',
        title: 'Cross-Chain Fluidity',
        body: 'Seamlessly shift liquidity across Ethereum, BSC, and L2s without leaving a breadcrumb trail of origin or destination.',
        tag: 'INTEROP',
    },
];

const Benefits = () => (
    <section className="section" id="features">
        <div className="container">
            <div style={{ marginBottom: '4rem' }}>
                <div className="section-label">Capability Matrix</div>
                <h2 className="display-lg">
                    Privacy built on<br /><em>mathematics,</em> not policy.
                </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1px', background: 'var(--border)' }}>
                {benefits.map((b, i) => (
                    <motion.div
                        key={i}
                        className="card"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        style={{ borderRadius: 0, border: 'none' }}
                    >
                        {/* Icon placeholder */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                <rect x="1" y="1" width="20" height="20" stroke="var(--cyan)" strokeWidth="1.2" />
                                <rect x="7" y="7" width="8" height="8" fill="var(--cyan)" opacity="0.3" />
                            </svg>
                        </div>

                        <div style={{
                            fontSize: '2.5rem',
                            fontFamily: 'var(--font-display)',
                            color: 'var(--text-tertiary)',
                            position: 'absolute',
                            top: '1.5rem',
                            right: '2rem',
                        }}>
                            {b.num}
                        </div>

                        <h3 style={{
                            fontFamily: 'var(--font-body)',
                            fontWeight: 600,
                            fontSize: '1.1rem',
                            color: '#fff',
                            marginBottom: '1rem',
                        }}>
                            {b.title}
                        </h3>

                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.75, marginBottom: '2rem' }}>
                            {b.body}
                        </p>

                        <span style={{
                            display: 'inline-block',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            border: '1px solid var(--border)',
                            padding: '0.3rem 0.75rem',
                            color: 'var(--text-secondary)',
                        }}>
                            {b.tag}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>

        <style>{`
      @media (max-width: 640px) {
        #features .container > div:last-child {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
    </section>
);

export default Benefits;
