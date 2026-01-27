import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bell } from 'lucide-react';

const ComingSoonModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative glass-card p-12 max-w-lg w-full text-center border-primary-color/20 overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-color to-transparent" />

                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 text-muted hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="mb-8 p-6 rounded-full glass border-primary-color/10 w-fit mx-auto">
                            <Bell size={40} className="text-primary-color" />
                        </div>

                        <h2 className="text-3xl font-extrabold mb-4 tracking-tight">DAPP ARRIVING <span className="gradient-text">SOON</span></h2>
                        <p className="text-secondary text-sm mb-10 leading-relaxed">
                            The Phantom Protocol DApp is currently undergoing final security audits
                            to ensure absolute transaction privacy.
                        </p>

                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter your email for early access"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-6 py-4 text-sm focus:outline-none focus:border-primary-color/50 transition-all"
                                />
                            </div>
                            <button className="btn-dapp w-full justify-center">
                                NOTIFY ME
                                <Send size={16} />
                            </button>
                        </div>

                        <p className="mt-8 text-[10px] mono text-muted uppercase">
                            Join 5,000+ early adopters in the shadows.
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ComingSoonModal;
