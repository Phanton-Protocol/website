import { useState } from 'react';
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
import GhostChainVisualizer from './components/GhostChainVisualizer';
import DataInterceptionBackground from './components/DataInterceptionBackground';
import logoUrl from './assets/logo.jpg';
import { SOCIAL_LINKS } from './config';

function App() {
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

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

export default App;
