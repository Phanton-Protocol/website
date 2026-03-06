import { motion } from 'framer-motion';

const benefits = [
  {
    num: '01',
    title: 'Private payroll out of the box',
    body: 'Fund a company account once and distribute salaries from the shielded pool. Teammates get paid without exposing who earns what on a public block explorer.',
    tag: 'PAYROLL',
  },
  {
    num: '02',
    title: 'Treasury moves that stay off‑radar',
    body: 'Swap and rebalance treasuries inside Phantom, so strategies and positions are not broadcast to competitors and copy‑traders in real time.',
    tag: 'TREASURY',
  },
  {
    num: '03',
    title: 'Per‑wallet keys for auditors',
    body: 'Issue reporting keys on a per‑wallet basis. Lawyers, accountants, or regulators can see exactly what they need — and nothing else.',
    tag: 'COMPLIANCE',
  },
  {
    num: '04',
    title: 'Built for production, not demos',
    body: 'Backend-first proving with Rapidsnark where available, snarkjs fallback when not. Same API, safer UX, and room to scale to real company flows.',
    tag: 'ENGINEERING',
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
                            color: 'rgba(255, 255, 255, 0.85)',
                            position: 'absolute',
                            top: '1.5rem',
                            right: '2rem',
                        }}>
                            {b.num}
                        </div>

                        <h3 style={{
                            fontFamily: 'var(--font-body)',
                            fontWeight: 800,
                            fontSize: '1.15rem',
                            color: '#fff',
                            marginBottom: '1rem',
                        }}>
                            {b.title}
                        </h3>

                        <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', marginBottom: '2rem' }}>
                            {b.body}
                        </p>

                        <span style={{
                            display: 'inline-block',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6rem',
                            letterSpacing: '0.15em',
                            textTransform: 'uppercase',
                            border: '1px solid rgba(255,255,255,0.35)',
                            padding: '0.3rem 0.75rem',
                            color: '#ffffff',
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
