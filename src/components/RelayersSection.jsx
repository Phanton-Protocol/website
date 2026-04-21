import { motion } from 'framer-motion';

const steps = [
  {
    num: '01',
    title: 'What relayers do',
    body: 'Relayers submit verified private transactions to Phantom on behalf of users and keep execution flow operational across the network. Relayers front the network gas at submission, then the protocol reimburses that gas from user balance rules after settlement.',
  },
  {
    num: '02',
    title: 'What you earn',
    body: 'Relayers earn $0.50 on each successful deposit submitted to the pool, plus a protocol-fee share from swaps and internal matching based on staking weight.',
  },
  {
    num: '03',
    title: 'How to become one',
    body: 'Stake $PPT and meet the minimum threshold shown in relayer onboarding. Then run a relayer node/backend with the same registered wallet to activate relayer status.',
  },
  {
    num: '04',
    title: 'Safety & reliability',
    body: 'Relayer status is stake-backed. Malicious or abusive behavior can be slashed, while reliable operators remain eligible for reward share.',
  },
];

const RelayersSection = () => (
  <section className="section" id="relayers">
    <div className="container">
      <div style={{ marginBottom: '4rem' }}>
        <div className="section-label">Relayer network</div>
        <h2 className="display-lg">
          Become a relayer.
          <br />
          <em>Stake. Run. Earn.</em>
        </h2>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', maxWidth: '680px', marginTop: '1.5rem' }}>
          Relayers submit proven transactions to Phantom on behalf of users. Anyone can become a relayer by staking $PPT tokens and meeting the minimum threshold shown in relayer onboarding.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a
            href="/relayer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              background: 'var(--cyan)',
              color: '#0a0a0a',
              padding: '0.9rem 2rem',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-block',
              transition: 'opacity 0.3s, box-shadow 0.3s',
            }}
            onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.boxShadow = 'none'; }}
            onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.boxShadow = 'none'; }}
          >
            Open relayer onboarding
          </a>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Stake PPT, meet the minimum threshold, and run your relayer node. All relayer info and staking is in relayer onboarding.
          </p>
        </div>
      </div>

      {/* Summary cards: Stake · Earn · Run */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ padding: '1.5rem', textAlign: 'center' }}
        >
          <div className="mono text-cyan" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>STAKE</div>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>Stake $PPT with the minimum requirement to become part of the relayer node network.</p>
        </motion.div>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          style={{ padding: '1.5rem', textAlign: 'center' }}
        >
          <div className="mono text-cyan" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>EARN</div>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>Relayers earn $0.50 on each successful deposit submitted to the pool, plus 80% of platform fees generated from swaps and internal matching.</p>
        </motion.div>
      </div>

      {/* Full page content */}
      <div className="card" style={{ padding: '3rem', background: 'var(--bg-card)', marginBottom: '3rem' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ display: 'grid', gap: '2.5rem' }}
        >
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{ color: 'var(--cyan)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', flexShrink: 0 }}>{step.num}</div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>{step.title}</h3>
                <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>{step.body}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, marginBottom: '1.25rem' }}>
          Stake $PPT, check minimum threshold, and see your relayer status in relayer onboarding.
        </p>
        <a
          href="/relayer"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            background: 'var(--cyan)',
            color: '#0a0a0a',
            padding: '0.85rem 2rem',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-block',
            transition: 'opacity 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.boxShadow = 'none'; }}
          onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.boxShadow = 'none'; }}
        >
          Open relayer page
        </a>
      </div>
    </div>
  </section>
);

export default RelayersSection;
