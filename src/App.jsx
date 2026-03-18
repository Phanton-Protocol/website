import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import WhoCanUseIt from './components/WhoCanUseIt';
import Benefits from './components/Benefits';
import ComparisonTable from './components/ComparisonTable';
import TechCards from './components/TechCards';
import SDKSection from './components/SDKSection';
import MetricsVisualizer from './components/MetricsVisualizer';
import NewsSection from './components/NewsSection';
import Mechanics from './components/Mechanics';
import RelayersSection from './components/RelayersSection';
import PrivacyExplainer from './components/PrivacyExplainer';
import FeesSection from './components/FeesSection';
import Roadmap from './components/Roadmap';
import FAQ from './components/FAQ';
import DAppSection from './components/DAppSection';
import ProtocolUserDapp from './components/ProtocolUserDapp';
import GhostChainVisualizer from './components/GhostChainVisualizer';
import DataInterceptionBackground from './components/DataInterceptionBackground';
import logoUrl from './assets/logo.jpg';
import { SOCIAL_LINKS } from './config';

function UserDappPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ paddingTop: '6rem' }}>
        <div className="section">
          <div className="container">
            <ProtocolUserDapp />
            <div style={{ marginTop: "2rem" }}>
              <DAppSection />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RelayerStakerPage() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <section className="section" style={{ paddingTop: '7rem' }}>
        <div className="container">
          <div className="section-label">Relayers / Stakers</div>
          <h2 className="display-lg">Operator dashboard</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--body-size)', fontWeight: 500, lineHeight: 'var(--body-line)', maxWidth: 720, marginTop: '1rem' }}>
            This is the relayer/staker view. For relayer health, validator status, and staking actions, use the dedicated dashboard app.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1.25rem' }}>
            <a className="btn-outline" href="http://localhost:5177/" target="_blank" rel="noreferrer">Open local operator dashboard</a>
            <a className="btn-outline" href="https://phantom-protocol.onrender.com" target="_blank" rel="noreferrer">Open hosted operator dashboard</a>
          </div>
          <p className="mono" style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '1rem' }}>
            Tip: locally, the operator dashboard may run on a different port (e.g. 5177). Use the URL printed by its dev server.
          </p>
        </div>
      </section>
    </div>
  );
}

function LandingPage({ mousePos, isHovering, handleMouseMove }) {
  return (
    <main
      className={isHovering ? 'cursor-hover' : ''}
      onMouseMove={handleMouseMove}
      style={{ position: 'relative', minHeight: '100vh' }}
    >
      {/* Custom Cursor */}
      <div className="cursor-dot" style={{ left: mousePos.x, top: mousePos.y }} />
      <div className="cursor-ring" style={{ left: mousePos.x, top: mousePos.y }} />

      {/* Encryption / chain data layer (hex particles, interception zone) */}
      <DataInterceptionBackground />

      {/* Interactive lines background (nodes, links, mouse breaks links) */}
      <GhostChainVisualizer />

      {/* Logo Watermark — fixed, centered, z:0 */}
      <div className="watermark">
        <img src={logoUrl} alt="" aria-hidden="true" draggable="false" />
      </div>

      {/* Page content — z:10 */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />

        <Hero />
        <WhoCanUseIt />
        <Benefits />
        <ComparisonTable />
        <TechCards />
        <SDKSection />
        <MetricsVisualizer />
        <NewsSection />
        <Mechanics />
        <RelayersSection />
        <DAppSection />
        <PrivacyExplainer />
        <FeesSection />
        <Roadmap />
        <FAQ />

        {/* Footer */}
        <footer
          className="section"
          style={{ paddingTop: '3rem', paddingBottom: '3rem' }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--label-size)', fontWeight: 500, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              © 2026 Phantom Protocol — <span style={{ color: 'var(--cyan)' }}>Mathematical Privacy.</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem 2rem', justifyContent: 'flex-end' }}>
              {SOCIAL_LINKS.map(({ name, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-underline"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--label-size)', fontWeight: 500, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.3s' }}
                >
                  {name}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

function App() {
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <Routes>
      <Route path="/" element={<LandingPage mousePos={mousePos} isHovering={isHovering} handleMouseMove={handleMouseMove} />} />
      <Route path="/user" element={<UserDappPage />} />
      <Route path="/relayer" element={<RelayerStakerPage />} />
    </Routes>
  );
}

export default App;
