import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';

const comparisonData = [
    { feature: "Shielded Matching", phantom: true, others: false },
    { feature: "Frontrun Protection", phantom: true, others: false },
    { feature: "Institutional Tools", phantom: true, others: false },
    { feature: "Privacy Bridges", phantom: true, others: false },
];

const ComparisonTable = () => {
    return (
        <section className="section-padding relative">
            <div className="container max-w-4xl">
                <div className="text-center mb-24">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mono text-primary-color mb-6"
                    >
                        Competitive Edge
                    </motion.div>
                    <h2 className="text-5xl font-extrabold mb-6 font-display tracking-tightest">THE <span className="gradient-text">GAP.</span></h2>
                    <p className="text-secondary text-sm font-light">How Phantom Protocol renders traditional mixers obsolete.</p>
                </div>

                <div className="glass-card overflow-hidden border-white/5 shadow-2xl">
                    <div className="grid grid-cols-2 p-10 border-b border-white/5 bg-white/[0.01]">
                        <div className="mono text-[11px] text-muted tracking-widest">Protocol Matrix</div>
                        <div className="flex items-center gap-3 font-bold text-primary-color justify-center font-display text-sm tracking-tight">
                            <ShieldCheck size={18} />
                            PHANTOM
                        </div>
                    </div>

                    {comparisonData.map((row, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="grid grid-cols-2 p-10 border-b border-white/[0.02] hover:bg-white/[0.01] transition-colors items-center"
                        >
                            <div className="text-base font-bold tracking-tight text-white">{row.feature}</div>
                            <div className="flex justify-center">
                                <Check size={24} className="text-primary-color" />
                            </div>
                        </motion.div>
                    ))}

                    <div className="p-12 text-center bg-white/[0.01]">
                        <p className="text-[10px] mono text-muted uppercase tracking-[0.4em] mb-6">Strategic Dominance</p>
                        <p className="text-sm italic text-secondary leading-relaxed max-w-lg mx-auto">
                            "Phantom's dark-pool architecture renders traditional link-analysis and predatory MEV attacks mathematically impossible."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ComparisonTable;
