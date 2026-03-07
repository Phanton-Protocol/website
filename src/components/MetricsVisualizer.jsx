import { motion } from 'framer-motion';

const MetricsVisualizer = () => {
    const metrics = [
        { label: "PHN_VOL_24H", value: "$4.20B", info: "ENCRYPTED" },
        { label: "NODE_OPERATORS", value: "1,280", info: "ACTIVE" },
        { label: "ANONYMITY_SET", value: "85,490", info: "SHIELDED" },
        { label: "AVG_STATE_SYNC", value: "1.24s", info: "LATENCY" }
    ];

    return (
        <section className="section">
            <div className="container">
                <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <div className="mono text-cyan" style={{ letterSpacing: '0.2em' }}>/// REALTIME_NETWORK_TELEMETRY</div>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    borderTop: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                }}>
                    {metrics.map((metric, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 1 }}
                            style={{
                                padding: '3rem 2rem',
                                borderRight: idx !== metrics.length - 1 ? '1px solid var(--border)' : 'none',
                                textAlign: 'center',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <div className="mono text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.65rem' }}>
                                {metric.label}
                                <span style={{ display: 'block', color: 'var(--cyan)', marginTop: '0.25rem', fontSize: '0.55rem' }}>
                                    [{metric.info}]
                                </span>
                            </div>
                            <div className="display-lg" style={{ color: 'var(--text-primary)', fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                                {metric.value}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default MetricsVisualizer;
