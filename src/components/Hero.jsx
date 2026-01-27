import { motion } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import heroBg from '../assets/hero-bg.png';

const Hero = ({ onOpenDApp }) => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background with slow parallax-style zoom */}
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.35 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute inset-0 z-0"
      >
        <img src={heroBg} alt="Phantom Interface" className="w-full h-full object-cover blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg-color via-transparent to-bg-color" />
      </motion.div>

      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "circOut" }}
        >
          <div className="inline-block mono px-5 py-2 glass rounded-full mb-10 text-primary-color border-primary-color/10">
            THE PRIVACY LAYER FOR DEFI
          </div>

          <h1 className="text-8xl md:text-[160px] mb-8 font-extrabold tracking-tightest leading-[0.9]">
            DEFI <br className="hidden md:block" />
            <span className="gradient-text">SHIELDED.</span>
          </h1>

          <p className="text-secondary text-xl md:text-2xl max-w-2xl mx-auto mb-16 font-light tracking-tight">
            Advanced dark pool architecture for high-stakes finance.
            Trade and transfer with absolute mathematical privacy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={onOpenDApp}
              className="btn-dapp px-12 py-5 text-base"
            >
              LAUNCH DAPP
              <ArrowRight size={20} />
            </button>
            <a href="#protocol" className="btn-outline px-12 py-5 text-base border-white/5 hover:border-white">
              EXPLORE PROTOCOL
            </a>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 15, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-muted/40"
      >
        <ChevronDown size={40} />
      </motion.div>
    </section>
  );
};

export default Hero;
