import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X } from 'lucide-react';
import { useState } from 'react';

const ComingSoonModal = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        setEmail('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#030407]/90 backdrop-blur-md"
                >
                    <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />

                    <motion.div
                        initial={{ scale: 0.95, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.95, y: 20 }}
                        transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.5 }}
                        className="w-full max-w-lg bg-[#0a0c10] border border-white/10 relative overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/[0.02]">
                            <div className="flex items-center gap-3 text-muted mono text-[10px]">
                                <Terminal size={14} className="text-accent-cyan" />
                                PHANTOM_TERMINAL_V1
                            </div>
                            <button
                                onClick={onClose}
                                className="text-secondary hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 md:p-12">
                            <h3 className="text-3xl font-display font-bold uppercase tracking-wide text-white mb-2">
                                TERMINAL <span className="text-secondary italic">LOCKED.</span>
                            </h3>
                            <p className="text-secondary font-light text-sm leading-relaxed mb-8">
                                The mainnet dark pool is currently restricted to whitelisted institutional liquidity providers. General access will open in Phase 02.
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] mono text-muted mb-2 tracking-widest uppercase">
                                        ENTER_CLEARANCE_EMAIL
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#050608] border border-white/10 p-4 text-white text-sm focus:outline-none focus:border-accent-cyan transition-colors font-mono"
                                        placeholder="admin@institution.com"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full btn-minimal text-accent-cyan border-accent-cyan/30 flex justify-center py-4"
                                >
                                    REQUEST_ACCESS »
                                </button>
                            </form>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ComingSoonModal;
