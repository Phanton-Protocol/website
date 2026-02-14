import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        q: "HOW DOES PHANTOM ENSURE 100% PRIVACY?",
        a: "Phantom combines ZK-SNARKs for ownership verification and FHE (Fully Homomorphic Encryption) for encrypted order matching. This ensures that your identity, assets, and trade amounts never leave the shielded environment."
    },
    {
        q: "IS PHANTOM PROTOCOL COMPLIANT?",
        a: "Yes. Phantom is engineered for institutional participation. Users hold 'Selective Disclosure Keys' that allow them to share their transaction history with regulators or for tax reporting without compromising their overall anonymity."
    },
    {
        q: "DIFFERENTIAL: TORNADO CASH VS PHANTOM?",
        a: "Tornado Cash is a simple mixer. Phantom is a complete Dark Pool DeFi layer. We support internal swaps and order matching, meaning your liquidity remains protected within the shield indefinitely."
    },
    {
        q: "WHAT BLOCKCHAINS ARE SUPPORTED?",
        a: "Phantom is currently live on BNB Smart Chain (BSC). We are actively expanding to Ethereum and Polygon via our native encrypted bridges to provide a unified privacy layer across multiple networks."
    }
];

const FAQ = () => {
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <section id="security" className="section-padding relative">
            <div className="container">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mono text-primary-color mb-8 flex items-center justify-center gap-3"
                    >
                        <span className="w-8 h-[1px] bg-primary-color/30" />
                        SYSTEM INTEGRITY
                        <span className="w-8 h-[1px] bg-primary-color/30" />
                    </motion.div>
                    <h2 className="text-6xl md:text-7xl tracking-tightest leading-tight font-display uppercase font-black italic">INTEL <span className="gradient-text">FED.</span></h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className={`glass-panel border-primary-color/5 overflow-hidden cursor-pointer hover:border-primary-color/20 transition-all duration-500 bg-black/40 backdrop-blur-xl ${openIdx === idx ? 'border-primary-color/30 bg-primary-color/5' : ''}`}
                            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                        >
                            <div className="p-8 md:p-10 flex justify-between items-center group">
                                <h3 className="font-black text-lg md:text-xl tracking-tight pr-8 font-display uppercase italic text-white/90 group-hover:text-white transition-colors">
                                    {"> "} {faq.q}
                                </h3>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-500 font-mono ${openIdx === idx ? 'bg-primary-color text-black rotate-45' : 'bg-white/5 text-primary-color group-hover:bg-primary-color/20'}`}>
                                    <Plus size={18} strokeWidth={3} />
                                </div>
                            </div>
                            <motion.div
                                initial={false}
                                animate={{ height: openIdx === idx ? 'auto' : 0, opacity: openIdx === idx ? 1 : 0 }}
                                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                                className="overflow-hidden"
                            >
                                <div className="p-8 md:p-10 pt-0 text-secondary text-sm leading-relaxed font-medium font-mono border-t border-white/5 opacity-80">
                                    {faq.a}
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQ;
