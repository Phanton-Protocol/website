import Navbar from './Navbar';
import SeoHead from './SeoHead';
import { RUNBOOK_URL, GITHUB_URL } from '../config';

const linkStyle = { color: 'rgba(167, 139, 250, 0.95)', textDecoration: 'underline' };

export default function PrivacyVisibilityPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#050508' }}>
      <SeoHead
        title="Privacy & visibility | Phantom Protocol"
        description="What stays private in the shielded pool versus what may be visible on-chain when interacting with AMM routing."
        path="/privacy-visibility"
      />
      <Navbar />
      <article
        className="container section"
        style={{
          maxWidth: 720,
          margin: '0 auto',
          paddingTop: 'clamp(5rem, 12vw, 7rem)',
          paddingBottom: '4rem',
          color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.65,
        }}
      >
        <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', marginBottom: '0.5rem', fontWeight: 600 }}>
          Privacy & visibility
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '2rem', fontSize: '0.95rem' }}>
          Short guide for users of the Phantom MVP. This is not legal advice; for deployment and operations see the{' '}
          <a href={RUNBOOK_URL} target="_blank" rel="noreferrer" style={linkStyle}>
            operator runbook
          </a>
          .
        </p>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#e9e9f0' }}>What tends to stay private</h2>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>
              <strong>Balances inside the shielded pool</strong> are represented as commitments and nullifiers; you do not
              publish a plain “account balance” on-chain like a normal ERC-20 balance for the pool note.
            </li>
            <li>
              <strong>Which notes belong to which user</strong> is not written on-chain by the protocol in the same way as
              a named account; the client holds note data and proves ownership in zero-knowledge.
            </li>
            <li>
              <strong>Withdrawal destination</strong> is not advertised in advance by the pool in the same way as a
              standing order; the protocol flow uses proofs and one-off transactions (subject to relayer and mempool
              visibility).
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#e9e9f0' }}>What the AMM / routing layer can see</h2>
          <p style={{ marginBottom: '0.75rem' }}>
            When a shielded swap is executed, the pool contract interacts with an adaptor (e.g. Pancake-style routing). That
            path is a <strong>normal on-chain execution</strong>:
          </p>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>
              <strong>Token pairs and amounts</strong> in the swap leg are visible in the transaction and on-chain
              state/events as the DEX normally exposes them.
            </li>
            <li>
              <strong>Timing and ordering</strong> follow public mempool and block inclusion rules (same as any swap).
            </li>
            <li>
              Phantom does not magically hide the DEX’s own transparency; it separates <em>your shielded note state</em>{' '}
              from <em>the concrete swap leg</em> that the adaptor performs.
            </li>
          </ul>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#e9e9f0' }}>What the relayer sees</h2>
          <p>
            The relayer receives proofs and transaction payloads needed to submit <code>shieldedSwapJoinSplit</code> /{' '}
            <code>shieldedWithdraw</code> (and related endpoints). Treat that as a <strong>trusted operator</strong> in the
            MVP: you must trust the relayer process and its key, not just the smart contracts. Hardening for
            staging/production deployments is described in{' '}
            <a href={RUNBOOK_URL} target="_blank" rel="noreferrer" style={linkStyle}>
              RUNBOOK.md
            </a>
            .
          </p>
        </section>

        <section
          style={{
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: 12,
            padding: '1.25rem 1.5rem',
            background: 'rgba(239, 68, 68, 0.06)',
          }}
        >
          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.75rem', color: '#fecaca' }}>MVP security limitations</h2>
          <ul style={{ paddingLeft: '1.25rem', margin: 0 }}>
            <li>
              <strong>Relayer compromise</strong>: a hot key or leaked host can submit transactions, censor, or reorder
              work. There is no substitute for key management, monitoring, and limiting blast radius.
            </li>
            <li>
              <strong>Rate limits</strong> are per-IP defaults on the API and are not a full anti-abuse product; dedicated
              attackers may route through many IPs.
            </li>
            <li>
              <strong>No formal audit</strong> is implied by this MVP; contracts and relayer should be reviewed before
              mainnet-scale use.
            </li>
            <li>
              <strong>Privacy</strong> is not absolute: network observers, RPC providers, and the relayer may
              correlate timing and metadata.
            </li>
          </ul>
          <p style={{ marginTop: '1rem', marginBottom: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.55)' }}>
            Source:{' '}
            <a href={`${GITHUB_URL}/core`} target="_blank" rel="noreferrer" style={linkStyle}>
              core repo
            </a>
            .
          </p>
        </section>
      </article>
    </div>
  );
}
