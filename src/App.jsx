import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import TechCards from './components/TechCards';
import ComparisonTable from './components/ComparisonTable';
import Mechanics from './components/Mechanics';
import FAQ from './components/FAQ';
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
    const p = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 12}s`,
      duration: `${15 + Math.random() * 25}s`,
      size: `${1 + Math.random() * 2}px`
    }));
    setParticles(p);
  }, []);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  return (
    <main className="relative bg-color min-h-screen">
      <div className="bg-glow" />
      <div className="floating-particles">
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              width: p.size,
              height: p.size
            }}
          />
        ))}
      </div>

      <motion.div className="fixed top-0 left-0 right-0 h-[2px] bg-primary-color z-[100] origin-left" style={{ scaleX }} />

      <Navbar onOpenDApp={toggleModal} />

      <Hero onOpenDApp={toggleModal} />

      <Benefits />

      <ComparisonTable />

      <TechCards />

      <Mechanics />

      <FAQ />

      <ComingSoonModal isOpen={isModalOpen} onClose={toggleModal} />

      {/* Footer Final CTA */}
      <section className="section-padding container">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-24 text-center border-white/5 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-color/20 to-transparent" />

          <h2 className="text-6xl md:text-8xl mb-10 font-extrabold tracking-tightest leading-none font-display">
            GO <span className="gradient-text">SHADOW.</span>
          </h2>
          <p className="text-secondary text-xl mb-14 max-w-2xl mx-auto font-light leading-relaxed">
            The definitive foundational backbone for private Decentralized Finance.
            Secure your liquidity in the world's most advanced dark pool.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            <button onClick={toggleModal} className="btn-dapp px-14 py-5 text-base">LAUNCH DAPP</button>
            <a href="https://x.com/Phantompro_" target="_blank" rel="noreferrer" className="btn-outline px-14 py-5 text-base shadow-xl">TERMINAL X</a>
          </div>
        </motion.div>

        <footer className="mt-32 pt-16 flex flex-col md:flex-row justify-between items-center gap-12 text-muted text-[11px] mono">
          <div className="opacity-40">© 2025 PHANTOM PROTOCOL. ALL PRIVACY RESERVED.</div>
          <div className="flex gap-12 font-bold tracking-widest">
            <a href="https://x.com/Phantompro_" target="_blank" rel="noreferrer" className="hover:text-primary-color transition-colors">TWITTER</a>
            <a href="https://github.com/phantomproto" className="hover:text-primary-color transition-colors">GITHUB</a>
            <a href="https://phantomproto.com/docs" className="hover:text-primary-color transition-colors">DOCS</a>
          </div>
          <div className="text-primary-color font-black tracking-widest text-[12px]">PHANTOMPROTO.COM</div>
        </footer>
      </section>
    </main>
  );
}

export default App;
