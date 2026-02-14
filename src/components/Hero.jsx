import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';

const Hero = ({ onOpenDApp }) => {
  return (
    <section className="relative min-h-[95vh] flex items-center justify-center overflow-hidden py-24">
      {/* Visual background element */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[600px] h-[600px] bg-primary-color/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[500px] h-[500px] bg-secondary-color/10 rounded-full blur-[120px]" />
        <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary-color/[0.03] rounded-full blur-[150px]" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 mono px-4 py-2 glass-panel mb-10 text-primary-color border-primary-color/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-color opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-color"></span>
            </span>
            THE PRIVACY BACKBONE FOR DEFI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-7xl md:text-[140px] mb-8 tracking-tightest leading-[0.8] font-display uppercase font-black"
          >
            <div className="relative inline-block glitch-hover cursor-default">
              PHANTOM
            </div>
            <br />
            <span className="gradient-text italic relative inline-block glitch-hover cursor-default">
              PROTOCOL
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-secondary text-xl md:text-2xl max-w-3xl mx-auto mb-16 font-light tracking-tight leading-relaxed font-mono"
          >
            {"> "} Institutional-grade dark pool architecture for the modern financial stack.
            Trade, swap, and transfer with absolute mathematical privacy.
            <span className="animate-pulse">_</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <button
              onClick={onOpenDApp}
              className="btn-primary"
            >
              LAUNCH TERMINAL
              <ArrowRight size={20} />
            </button>
            <a href="#protocol" className="btn-secondary">
              EXPLORE PROTOCOL
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="mt-24 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-40 grayscale hover:grayscale-0 transition-all font-mono"
          >
            <div className="text-[10px] flex items-center justify-center gap-2 mono-tag">
              <span>[ ZK-PROOFS ]</span>
            </div>
            <div className="text-[10px] flex items-center justify-center gap-2 mono-tag">
              <span>[ MEV-SHIELD ]</span>
            </div>
            <div className="text-[10px] flex items-center justify-center gap-2 mono-tag">
              <span>[ FHE-MATCH ]</span>
            </div>
            <div className="text-[10px] flex items-center justify-center gap-2 mono-tag">
              <span>[ DARK-POOL ]</span>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-muted"
      >
        <ChevronDown size={32} strokeWidth={1.5} className="opacity-30" />
      </motion.div>
    </section>
  );
};

export default Hero;
