import { motion, useScroll, useSpring } from 'framer-motion';
import BackgroundLogo from './components/BackgroundLogo';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import TechCards from './components/TechCards';
import ComparisonTable from './components/ComparisonTable';
import Mechanics from './components/Mechanics';
import FAQ from './components/FAQ';
import Roadmap from './components/Roadmap';
import ComingSoonModal from './components/ComingSoonModal';
import { useEffect, useState } from 'react';

function App() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [particles, setParticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const p = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${20 + Math.random() * 30}s`,
      size: `${Math.random() * 2 + 1}px`
    }));
    setParticles(p);
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <main className="relative bg-color min-h-screen selection:bg-primary-color/30 overflow-x-hidden">
      <BackgroundLogo />
      <div className="bg-glow" />
      <div className="grid-bg" />
      <div className="scanline" />
      <div className="noise-overlay" />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size,
              position: 'absolute',
              background: '#fff',
              borderRadius: '50%',
              opacity: 0.1,
              animation: 'float-up linear infinite'
            }}
          />
        ))}
      </div>

      <motion.div className="fixed top-0 left-0 right-0 h-[3px] bg-primary-color z-[100] origin-left shadow-[0_0_15px_rgba(0,242,255,0.5)]" style={{ scaleX }} />

      <Navbar onOpenDApp={toggleModal} />

      <div className="relative z-10">
        <Hero onOpenDApp={toggleModal} />

        <div className="space-y-0">
          <Benefits />
          <ComparisonTable />
          <TechCards />
          <Mechanics />
          <Roadmap />
          <FAQ />
        </div>

        {/* Footer Final CTA */}
        <section className="section-padding container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-16 md:p-24 text-center relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-color/30 to-transparent" />

            <h2 className="text-6xl md:text-8xl mb-8 tracking-tightest leading-none font-display uppercase font-black italic">
              GO <span className="gradient-text">SHADOW.</span>
            </h2>
            <p className="text-secondary text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-light leading-relaxed">
              The foundational backbone for private Decentralized Finance.
              Secure your liquidity in the world's most advanced dark pool.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <button onClick={toggleModal} className="btn-primary">LAUNCH TERMINAL</button>
              <a href="https://x.com/Phantompro_" target="_blank" rel="noreferrer" className="btn-secondary">JOIN COMMUNITY</a>
            </div>
          </motion.div>

          <footer className="mt-40 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-muted text-[12px] mono">
            <div className="opacity-60 italic">© 2026 PHANTOM PROTOCOL. ALL PRIVACY RESERVED.</div>
            <div className="flex gap-10 font-bold tracking-widest">
              <a href="https://x.com/Phantompro_" target="_blank" rel="noreferrer" className="hover:text-primary-color transition-colors">TWITTER</a>
              <a href="https://github.com/phantomproto" className="hover:text-primary-color transition-colors">GITHUB</a>
              <a href="https://phantomproto.com/docs" className="hover:text-primary-color transition-colors">DOCUMENTATION</a>
            </div>
            <div className="text-secondary font-bold tracking-widest">PHANTOMPROTO.COM</div>
          </footer>
        </section>
      </div>

      <ComingSoonModal isOpen={isModalOpen} onClose={toggleModal} />

      <style>{`
        @keyframes float-up {
          0% { transform: translateY(110vh) scale(0.5); opacity: 0; }
          20% { opacity: 0.15; }
          80% { opacity: 0.15; }
          100% { transform: translateY(-10vh) scale(1.2); opacity: 0; }
        }
      `}</style>
    </main>
  );
}

export default App;
