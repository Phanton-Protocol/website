import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bell } from 'lucide-react';

const ComingSoonModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 sm:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative glass-panel p-10 md:p-14 max-w-xl w-full text-center border-primary-color/20 overflow-hidden shadow-3xl bg-black/90 backdrop-blur-3xl"
                    >
                        {/* Status bar */}
                        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-color to-transparent" />

                        <button
                            onClick={onClose}
                            className="absolute top-8 right-8 text-muted hover:text-white transition-colors"
                        >
                            <span className="mono text-[10px] mr-2">CLOSE[X]</span>
                        </button>

                        <div className="mb-10 w-20 h-20 rounded-2xl bg-primary-color/5 border border-primary-color/20 flex items-center justify-center mx-auto relative group">
                            <div className="absolute inset-0 bg-primary-color/10 animate-ping rounded-2xl opacity-20" />
                            <Bell size={32} className="text-primary-color relative z-10" strokeWidth={1.5} />
                        </div>

                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight font-display uppercase italic text-white">TERMINAL <span className="gradient-text">PENDING_</span></h2>
                        <p className="text-secondary text-sm mb-12 leading-relaxed font-medium font-mono max-w-md mx-auto opacity-70">
                            The Phantom Protocol DApp is currently undergoing institutional security audits to ensure absolute transaction integrity.
                        </p>

                        <div className="flex flex-col gap-4 max-w-sm mx-auto">
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="ENTER_INSTITUTIONAL_EMAIL"
                                    className="w-full bg-black border border-white/10 rounded-lg px-6 py-4 text-xs focus:outline-none focus:border-primary-color/40 transition-all font-mono tracking-widest uppercase text-white"
                                />
                            </div>
                            <button className="btn-primary w-full justify-center py-4 text-xs font-black uppercase tracking-[0.3em] font-mono">
                                NOTIFY_CONNECTION
                            </button>
                        </div>

                        <div className="mt-12 flex items-center justify-center gap-4 opacity-30">
                            <div className="h-[1px] w-12 bg-primary-color" />
                            <p className="text-[10px] mono uppercase tracking-[0.4em] font-black text-white">
                                5,000+ ADOPTERS_SECURED
                            </p>
                            <div className="h-[1px] w-12 bg-primary-color" />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ComingSoonModal;
