import { motion } from 'framer-motion';

const features = [
  { name: 'Private swaps on major DEX routers', phantom: 'Swap on main AMMs without exposing wallet address', standard: 'Most market solutions expose wallet and execution trail' },
  { name: 'Use funds on any chain without bridging', phantom: 'Native flow on the chain where assets already sit', standard: 'Many privacy tools require bridge-first or siloed liquidity' },
  { name: 'On-chain salary payouts', phantom: 'Send salaries privately on-chain', standard: 'Large organisations cannot move payroll on-chain because no private solution exists today' },
  { name: 'Bank and institutional transaction privacy', phantom: 'Support account transfers and inter-bank settlement privately', standard: 'Existing rails can compromise institution and client privacy' },
  { name: 'Internal matching without public footprint', phantom: 'Private internal matching with no public order trail', standard: 'Most alternatives route through visible on-chain order flow' },
  { name: 'Compliance-ready privacy', phantom: 'Selective disclosure and sanctions screening built in', standard: 'Many privacy networks are difficult to align with compliance needs' },
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
                <div className="mono" style={{ color: 'var(--text-tertiary)' }}>MARKET SOLUTIONS</div>
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
                    <div style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500 }}>{f.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--cyan)', flexShrink: 0 }} />
                        <span style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500 }}>{f.phantom}</span>
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: 'var(--body-size)', fontWeight: 500 }}>{f.standard}</div>
                </motion.div>
            ))}
        </div>
    </section>
);

export default ComparisonTable;
