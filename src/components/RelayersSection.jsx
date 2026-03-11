import { motion } from 'framer-motion';
import { DAPP_URL } from '../config';

const steps = [
  {
    num: '01',
    title: 'What relayers do',
    body: 'Users build a zero-knowledge proof (locally or via our prover API). Relayers take the proof and calldata and submit the transaction to the shielded pool contract. Gas is deducted from your deposited balance and repaid to the relayer; they may charge a small fee. They never see which notes belong to which user or control anyone’s funds.',
  },
  {
    num: '02',
    title: 'What you earn',
    body: 'Two sources of earnings: (1) Relayer fees — you set a fee (e.g. % or flat) per transaction; users see it in the DApp before confirming. (2) $0.50 on every user deposit you submit (of the $2 deposit fee, $1.50 goes to treasury, $0.50 to you). (3) Proportional share of 80% of protocol swap fees; stakers claim via the staking contract.',
  },
  {
    num: '03',
    title: 'How to stake',
    body: 'Stake the protocol token (PHN) in the DApp’s Staking Hub. There is a minimum stake required to register as a relayer; the exact amount is shown in the DApp (Staking Hub → Min Stake). Use the same wallet that will run your relayer backend (RELAYER_PRIVATE_KEY). After staking at or above the minimum, your relayer can submit transactions and earn relayer fees plus your share of protocol fees.',
  },
  {
    num: '04',
    title: 'How to run a relayer',
    body: 'Run the Phantom backend (or your own server that implements the same API) with a funded wallet. Set RELAYER_PRIVATE_KEY to the private key of the wallet that has staked. Your server will accept /prove requests, submit transactions on-chain, and optionally coordinate with validators. Gas is taken from the user’s balance and repaid to you. You need: a server and stake ≥ min stake in PHN. No special permission is required beyond that.',
  },
  {
    num: '05',
    title: 'Requirements at a glance',
    body: 'Protocol token (PHN) to stake; minimum stake amount (see DApp); a wallet to use as relayer (same as staking wallet); a running backend with RELAYER_PRIVATE_KEY set. Gas is paid by the user (deducted from their balance and repaid to you). The DApp shows total staked, min stake, your stake, and your relayer status.',
  },
  {
    num: '06',
    title: 'Slashing & safety',
    body: 'The protocol can slash stake for misbehavior (e.g. submitting invalid proofs or abuse). Relayers that follow the rules and stay online earn fees and reward share; those that are slashed lose part of their stake. Stay compliant and run reliable infrastructure.',
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
          Relayers submit proven transactions to Phantom’s shielded pool on behalf of users. A successful relayer receives $0.50 on every user deposit they process (of the $2 deposit fee, $1.50 goes to treasury). Gas is deducted from the user’s deposited balance and repaid to the relayer. They may charge a relayer fee. Stake the protocol token (PHN) to register as a relayer and earn both <strong style={{ color: '#fff', fontWeight: 600 }}>relayer fees</strong>, <strong style={{ color: '#fff', fontWeight: 600 }}>$0.50 per deposit</strong>, and a <strong style={{ color: '#fff', fontWeight: 600 }}>share of protocol fees</strong>.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <a
            href={DAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
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
            onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.boxShadow = '0 0 28px rgba(0,229,199,0.35)'; }}
            onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.boxShadow = 'none'; }}
          >
            Open DApp — Staking Hub (Become a relayer)
          </a>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
            Stake PHN, meet the minimum, and run your relayer. All relayer info and staking is in the DApp.
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
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>Stake PHN in the DApp. Meet the minimum to register as a relayer.</p>
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
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>Relayer fees you set + $0.50 per user deposit you process + your share of protocol fees (e.g. 80% to stakers).</p>
        </motion.div>
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{ padding: '1.5rem', textAlign: 'center' }}
        >
          <div className="mono text-cyan" style={{ fontSize: '0.6rem', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>RUN</div>
          <p style={{ color: '#fff', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)' }}>Run the backend with your relayer wallet. Gas is taken from users’ balances and repaid to you; you can also earn relayer fees.</p>
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
          Stake PHN, check min stake, and see your relayer status in the DApp.
        </p>
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
            padding: '0.85rem 2rem',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'inline-block',
            transition: 'opacity 0.3s, box-shadow 0.3s',
          }}
          onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.boxShadow = '0 0 28px rgba(0,229,199,0.35)'; }}
          onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.boxShadow = 'none'; }}
        >
          Open DApp — Staking Hub & Relayer
        </a>
      </div>
    </div>
  </section>
);

export default RelayersSection;
