import { motion } from 'framer-motion';
import nadmahLogo from '../assets/nadmah.svg';

export default function BackersPartnersSection() {
  return (
    <section className="section" id="backers-partners">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'grid',
            gap: '1rem',
          }}
        >
          <div className="section-label">Backers & Partners</div>
          <h2 className="display-lg" style={{ marginBottom: '0.25rem' }}>
            Backers & <em>partners.</em>
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '58ch', lineHeight: 1.6 }}>
            Strategic collaborators and supporters shaping Phantom Protocol&apos;s ecosystem, infrastructure, and go-to-market execution.
          </p>
          <div
            style={{
              marginTop: '0.75rem',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <a
              href="https://nadmah.co/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Nadmah website"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                opacity: 1,
              }}
            >
              <img
                src={nadmahLogo}
                alt="Nadmah"
                style={{
                  width: 'clamp(170px, 24vw, 340px)',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
