import { Link } from 'react-router-dom';
import { EPAPER_PUBLIC_URL } from '../config';

export default function AppPageShell({
  label,
  title,
  subtitle,
  children,
  maxWidth = 720,
  compactTitle = false,
  tradeLandscape = false,
  belowTheFold = null,
}) {
  const headerBlock = (label || title || subtitle) ? (
    <header className={tradeLandscape ? 'app-page__header app-page__header--trade' : 'app-page__header'}>
      {label ? (
        <div className="section-label" style={{ marginBottom: '1rem' }}>
          {label}
        </div>
      ) : null}
      {title ? (
        compactTitle ? (
          <h1 className="app-page__title-compact">{title}</h1>
        ) : (
          <h1 className="display-lg app-page__title">{title}</h1>
        )
      ) : null}
      {subtitle ? (
        <p className={tradeLandscape ? 'app-page__subtitle app-page__subtitle--trade' : 'app-page__subtitle'}>
          {subtitle}
        </p>
      ) : null}
    </header>
  ) : null;

  return (
    <div className="app-page">
      <div
        className={`container app-page__inner${tradeLandscape ? ' app-page__inner--trade-wide' : ''}`}
        style={
          tradeLandscape
            ? { paddingTop: '6.75rem', paddingBottom: 'clamp(2.5rem, 6vw, 4rem)' }
            : { maxWidth, paddingTop: '6.75rem', paddingBottom: 'clamp(2.5rem, 6vw, 4rem)' }
        }
      >
        {tradeLandscape ? (
          <div className="app-page__trade-centered">
            {headerBlock}
            <div className="app-page__body app-page__body--trade">{children}</div>
          </div>
        ) : (
          <>
            {headerBlock}
            <div className="app-page__body">{children}</div>
          </>
        )}
        {belowTheFold ? <div className="app-page__below-fold">{belowTheFold}</div> : null}
        <footer className="app-page__footer mono">
          <Link to="/" className="app-page__footer-link hover-underline">
            Home
          </Link>
          <Link to="/trade" className="app-page__footer-link hover-underline">
            Trade
          </Link>
          <Link to="/user" className="app-page__footer-link hover-underline">
            Full console
          </Link>
          <Link to="/privacy-visibility" className="app-page__footer-link hover-underline">
            Privacy & visibility
          </Link>
          <a href={EPAPER_PUBLIC_URL} className="app-page__footer-link hover-underline">
            E-Paper
          </a>
        </footer>
      </div>
    </div>
  );
}
