import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const Navbar = ({ onOpenDApp }) => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] py-6"
        >
            <div className="container">
                <div className="glass-panel px-6 py-3 flex items-center justify-between border-primary-color/10 shadow-3xl bg-black/60 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary-color/5 p-1.5 rounded border border-primary-color/20">
                            <Shield size={18} className="text-primary-color" />
                        </div>
                        <span className="font-black tracking-widest text-lg font-display uppercase italic">PHANTOM<span className="text-primary-color">_</span></span>
                    </div>

                    <div className="hidden lg:flex items-center gap-10">
                        {['Protocol', 'Technology', 'Security', 'Roadmap'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-[11px] font-bold mono text-secondary hover:text-white transition-colors tracking-widest"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <a href="https://phantomproto.com/docs" className="hidden sm:block text-[11px] font-bold mono text-secondary hover:text-white transition-colors tracking-widest">
                            WHITEPAPER
                        </a>
                        <button
                            onClick={onOpenDApp}
                            className="btn-primary py-2.5 px-6 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase"
                        >
                            LAUNCH_TERMINAL
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
