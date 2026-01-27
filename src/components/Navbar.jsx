import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const Navbar = ({ onOpenDApp }) => {
    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-[60] py-8"
        >
            <div className="container">
                <div className="glass px-10 py-5 rounded-full flex items-center justify-between border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary-color/10 p-2.5 rounded-lg border border-primary-color/20">
                            <Shield size={22} className="text-primary-color" />
                        </div>
                        <span className="font-extrabold tracking-tighter text-2xl font-display">PHANTOM</span>
                    </div>

                    <div className="hidden lg:flex items-center gap-12">
                        {['Protocol', 'Technology', 'Security', 'Roadmap'].map((item) => (
                            <a
                                key={item}
                                href={`#${item.toLowerCase()}`}
                                className="text-xs font-bold mono text-secondary hover:text-white transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-8">
                        <a href="https://phantomproto.com/docs" className="hidden sm:block text-xs font-bold mono text-secondary hover:text-white transition-colors">
                            Whitepaper
                        </a>
                        <button
                            onClick={onOpenDApp}
                            className="btn-dapp px-8 py-3.5"
                        >
                            LAUNCH DAPP
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
