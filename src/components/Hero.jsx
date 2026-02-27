import { motion } from 'framer-motion';

const stats = [
  { value: '5,000', label: 'MAX STAKERS / NODE' },
  { value: '66%', label: 'CONSENSUS THRESHOLD' },
  { value: '1M+', label: 'MERKLE TREE CAPACITY' },
  { value: '3s', label: 'COMMIT-REVEAL DELAY' },
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
              Dark-pool native privacy layer for DeFi
            </motion.div>

            <motion.h1 {...fade(0.25)} className="display-xl" style={{ marginBottom: '2.5rem', maxWidth: '820px' }}>
              Trade in the{' '}
              <br />
              <em>shadows.</em>
              <br />
              Comply in the{' '}
              <br />
              open.
            </motion.h1>

            <motion.p {...fade(0.4)} style={{
              maxWidth: '520px',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              lineHeight: 1.75,
              marginBottom: '3rem',
            }}>
              Phantom Protocol combines ZK-SNARKs, Fully Homomorphic Encryption,
              and a decentralized validator network to deliver institutional-grade
              dark pool trading with native compliance primitives.
            </motion.p>

            <motion.div {...fade(0.5)} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a href="#architecture" className="btn-outline-cyan btn-outline">
                Explore Architecture
              </a>
              <a href="#" className="btn-outline">
                Read Whitepaper
              </a>
            </motion.div>
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
