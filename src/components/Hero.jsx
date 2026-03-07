import { motion } from 'framer-motion';
import { DAPP_URL } from '../config';

const stats = [
  { value: '1', label: 'SHIELDED POOL FOR MANY USES' },
  { value: '3+', label: 'PRIMARY PAYROLL / TREASURY FLOWS' },
  { value: 'ZK', label: 'PRIVACY WITH AUDIT TRAILS' },
  { value: 'API', label: 'BACKEND-FIRST PROVER LAYER' },
  { value: 'FHE / OTC', label: 'INTERNAL MATCHING — SWAPS LIVE' },
];

const Hero = () => {
  const fade = (delay = 0) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] },
  });

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        paddingTop: '8rem',
        paddingBottom: '6rem',
        position: 'relative',
      }}
    >
      <div className="container" style={{ width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '4rem', alignItems: 'center' }}>

          {/* Left: Headline */}
          <div>
            <motion.div {...fade(0.1)} className="section-label">
              Private, compliant rails for on‑chain money
            </motion.div>

            <motion.h1
              {...fade(0.25)}
              className="display-xl"
              style={{ marginBottom: '2.5rem', maxWidth: '820px' }}
            >
              Privacy for teams,
              <br />
              treasuries, <em>traders</em>
              <br />
              and payouts.
            </motion.h1>

            <motion.p
              {...fade(0.4)}
              style={{
                maxWidth: '520px',
                color: '#ffffff',
                fontSize: 'var(--body-size)',
                fontWeight: 500,
                lineHeight: 'var(--body-line)',
                marginBottom: '3rem',
              }}
            >
              Phantom Protocol is a shielded pool and relayer network on BNB Chain
              that lets you run payroll, manage treasury, and swap assets privately —
              with per‑wallet reporting keys for auditors, lawyers, and tax tools.
            </motion.p>

            <motion.div {...fade(0.5)} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <a
                href={DAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  background: 'var(--cyan)',
                  color: '#0a0a0a',
                  padding: '0.85rem 1.75rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  transition: 'opacity 0.3s, box-shadow 0.3s',
                }}
                className="btn-cyan"
                onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.boxShadow = '0 0 32px rgba(0,229,199,0.4)'; }}
                onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.boxShadow = 'none'; }}
              >
                Open DApp
              </a>
              <a href="#architecture" className="btn-outline-cyan btn-outline">
                Explore how it works
              </a>
              <a href="#features" className="btn-outline">
                See what you can do
              </a>
            </motion.div>

            <motion.p
              {...fade(0.6)}
              style={{
                marginTop: '2.5rem',
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--label-size)',
                fontWeight: 500,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: '#ffffff',
              }}
            >
              For banks · institutions · traders · teams
            </motion.p>
          </div>

          {/* Right: Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2.5rem',
              minWidth: '160px',
              alignSelf: 'flex-end',
              paddingBottom: '1rem',
            }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.1, duration: 0.6 }}
                style={{ textAlign: 'right' }}
              >
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* Bottom gradient fade */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '120px',
        background: 'linear-gradient(to bottom, transparent, rgba(10,10,10,0.6))',
        pointerEvents: 'none',
      }} />

      {/* Responsive: hide stats on small screens */}
      <style>{`
        @media (max-width: 768px) {
          section > .container > div {
            grid-template-columns: 1fr !important;
          }
          section > .container > div > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
