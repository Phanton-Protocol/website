import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import ComparisonTable from './components/ComparisonTable';
import TechCards from './components/TechCards';
import MetricsVisualizer from './components/MetricsVisualizer';
import NewsSection from './components/NewsSection';
import Mechanics from './components/Mechanics';
import PrivacyExplainer from './components/PrivacyExplainer';
import Roadmap from './components/Roadmap';
import FAQ from './components/FAQ';
import GhostChainVisualizer from './components/GhostChainVisualizer';
import logoUrl from './assets/logo.jpg';

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

      {/* Ghost Chain Visualizer — fixed canvas, z:1 */}
      <GhostChainVisualizer />

      {/* Logo Watermark — fixed, centered, z:0 */}
      <div className="watermark">
        <img src={logoUrl} alt="" aria-hidden="true" draggable="false" />
      </div>

      {/* Page content — z:10 */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        <Navbar />

        <Hero />
        <Benefits />
        <ComparisonTable />
        <TechCards />
        <MetricsVisualizer />
        <NewsSection />
        <Mechanics />
        <PrivacyExplainer />
        <Roadmap />
        <FAQ />

        {/* Footer */}
        <footer
          className="section"
          style={{ paddingTop: '3rem', paddingBottom: '3rem' }}
        >
          <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              © 2026 Phantom Protocol — <span style={{ color: 'var(--cyan)' }}>Mathematical Privacy.</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="https://x.com/Phantompro_" target="_blank" rel="noreferrer" className="hover-underline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.3s' }}>X / Twitter</a>
              <a href="https://github.com/phantomproto" target="_blank" rel="noreferrer" className="hover-underline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.3s' }}>GitHub</a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default App;
