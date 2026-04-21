import React from 'react';
import Navbar from './Navbar';
import SeoHead from './SeoHead';

const PitchDeckPage = () => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SeoHead
        title="Phantom Protocol Pitch Deck"
        description="View the Phantom Protocol pitch deck - Confidential DeFi infrastructure for institutions and enterprises."
        path="/pitchdeck"
        robots="noindex, nofollow"
      />
      <Navbar />
      <section className="section" style={{ paddingTop: '7rem' }}>
        <div className="container">
          <div className="section-label">Phantom Protocol</div>
          <h1 className="display-lg" style={{ marginBottom: '1.25rem' }}>Pitch Deck</h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '65ch', marginBottom: '2rem' }}>
            Explore our comprehensive pitch deck detailing Phantom Protocol's confidential DeFi infrastructure,
            designed for institutions, enterprises, and global finance operations.
          </p>
          <div style={{
            width: '100%',
            height: '80vh',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <iframe
              src="/pitchdeck.pdf"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Phantom Protocol Pitch Deck"
            />
          </div>
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <a
              href="/pitchdeck.pdf"
              download="Phantom-Protocol-Pitch-Deck.pdf"
              style={{
                color: 'var(--cyan)',
                textDecoration: 'none',
                fontWeight: '500',
                padding: '0.75rem 1.5rem',
                border: '1px solid var(--cyan)',
                borderRadius: '6px',
                display: 'inline-block',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--cyan)';
                e.target.style.color = 'var(--bg)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--cyan)';
              }}
            >
              Download PDF
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PitchDeckPage;
