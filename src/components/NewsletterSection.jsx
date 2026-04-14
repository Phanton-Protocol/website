import { useState } from 'react';
import { motion } from 'framer-motion';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const response = await fetch('https://formsubmit.co/ajax/hamzashamsi@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email,
          _subject: 'New Phantom newsletter subscriber',
          _captcha: 'false',
          source: 'phantomproto.com newsletter',
        }),
      });

      if (!response.ok) {
        throw new Error('submit failed');
      }
      setStatus('submitted');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="section" id="newsletter">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            border: '1px solid var(--border)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
            padding: 'clamp(1.25rem, 4vw, 2rem)',
            display: 'grid',
            gap: '1rem',
          }}
        >
          <div className="section-label">Newsletter</div>
          <h2 className="display-lg" style={{ marginBottom: '0.25rem' }}>
            Subscribe to our <em>newsletter.</em>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '58ch', lineHeight: 1.6 }}>
            Monthly updates on launches, roadmap milestones, governance changes, and ecosystem integrations.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={{
                flex: '1 1 280px',
                background: 'rgba(0,0,0,0.45)',
                color: '#fff',
                border: '1px solid var(--border)',
                padding: '0.8rem 0.95rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                letterSpacing: '0.06em',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn-outline btn-outline-cyan" style={{ minWidth: 170 }}>
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>

          <p className="mono" style={{ marginTop: '0.25rem', fontSize: '0.72rem', color: status === 'submitted' ? 'var(--cyan)' : 'rgba(255,255,255,0.6)' }}>
            {status === 'submitted' && 'Subscribed. Confirmation sent successfully.'}
            {status === 'error' && 'Could not subscribe right now. Please try again.'}
            {(status === 'idle' || status === 'loading') && 'No spam. Unsubscribe anytime.'}
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterSection;
