import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
    {
        q: "How does Phantom ensure 100% privacy?",
        a: "Phantom combines ZK-SNARKs for ownership verification and FHE for encrypted order matching. This ensures that your identity, assets, and trade amounts never leave the shielded environment."
    },
    {
        q: "Is Phantom Protocol compliant?",
        a: "Yes. Phantom is built for institutional participation. Users hold 'Selective Disclosure Keys' that allow them to share their transaction history with regulators or for tax reporting."
    },
    {
        q: "Differential: Tornado Cash vs Phantom?",
        a: "Tornado Cash is a simple mixer. Phantom is a complete Dark Pool DeFi layer. We support swaps and internal order matching, meaning your liquidity never has to leave the shield."
    },
    {
        q: "What blockchains are supported?",
        a: "Phantom is live on BNB Smart Chain (BSC). We are actively expanding to Ethereum and Polygon via our native encrypted bridges."
    }
];

const FAQ = () => {
    const [openIdx, setOpenIdx] = useState(null);

    return (
        <section id="security" className="section-padding relative">
            <div className="container max-w-4xl">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mono text-primary-color mb-6"
                    >
                        Integrity
                    </motion.div>
                    <h2 className="text-5xl font-extrabold mb-6 font-display tracking-tight">INTEL <span className="gradient-text">FED</span></h2>
                </div>

                <div className="space-y-6">
                    {faqs.map((faq, idx) => (
                        <div
                            key={idx}
                            className="glass rounded-xl border-white/5 overflow-hidden cursor-pointer hover:border-white/10 transition-colors"
                            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                        >
                            <div className="p-10 flex justify-between items-center group">
                                <h3 className="font-bold text-lg md:text-xl tracking-tight pr-8">{faq.q}</h3>
                                <Plus
                                    size={24}
                                    className={`text-primary-color transition-transform duration-500 ease-out ${openIdx === idx ? 'rotate-45 scale-125' : 'group-hover:scale-110'}`}
                                />
                            </div>
                            <motion.div
                                initial={false}
                                animate={{ height: openIdx === idx ? 'auto' : 0, opacity: openIdx === idx ? 1 : 0 }}
                                transition={{ duration: 0.4, ease: "circOut" }}
                                className="overflow-hidden"
                            >
                                <div className="p-10 pt-0 text-secondary text-base leading-relaxed font-light border-t border-white/5">
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
