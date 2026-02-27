import { motion } from 'framer-motion';

const features = [
    { name: 'Order Obfuscation', phantom: 'Full FHE', standard: 'Partial ZK' },
    { name: 'MEV Protection', phantom: 'Absolute', standard: 'Vulnerable' },
    { name: 'Cross-Chain Sync', phantom: 'Invisible', standard: 'Public' },
    { name: 'Network Anonymity', phantom: 'Ghost Net', standard: 'IP Visible' },
    { name: 'Throughput', phantom: '12,000 TPS', standard: '15–50 TPS' },
];

const ComparisonTable = () => (
    <section className="section">
        <div className="container">
            <div style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <div className="section-label">System Comparison</div>
                    <h2 className="display-lg">Beyond current<br /><em>limits.</em></h2>
                </div>
            </div>

            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '0' }}>
                <div className="mono" style={{ color: 'var(--text-tertiary)' }}>FEATURE</div>
                <div className="mono" style={{ color: 'var(--cyan)' }}>PHANTOM PROTOCOL</div>
                <div className="mono" style={{ color: 'var(--text-tertiary)' }}>STANDARD DEFI</div>
            </div>

            {features.map((f, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.5 }}
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        padding: '1.5rem 0',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.3s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{f.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0 }} />
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.875rem' }}>{f.phantom}</span>
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>{f.standard}</div>
                </motion.div>
            ))}
        </div>
    </section>
);

export default ComparisonTable;
