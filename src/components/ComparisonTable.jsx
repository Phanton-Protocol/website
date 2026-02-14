import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';

const comparisonData = [
    { feature: "SHIELDED MATCHING engine", phantom: true },
    { feature: "NATIVE FRONTRUN PROTECTION", phantom: true },
    { feature: "INSTITUTIONAL COMPLIANCE SDK", phantom: true },
    { feature: "CROSS-CHAIN PRIVACY BRIDGES", phantom: true },
    { feature: "ZERO MEMPOOL EXPOSURE", phantom: true },
];

const ComparisonTable = () => {
    return (
        <section className="section-padding relative overflow-hidden">
            <div className="container">
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mono text-primary-color mb-8 flex items-center justify-center gap-3"
                    >
                        <span className="w-8 h-[1px] bg-primary-color/40" />
                        COMPETITIVE ADVANTAGE
                        <span className="w-8 h-[1px] bg-primary-color/40" />
                    </motion.div>
                    <h2 className="text-6xl md:text-7xl tracking-tightest leading-tight font-display uppercase">THE <span className="gradient-text">PRIVACY GAP.</span></h2>
                    <p className="text-secondary text-lg mt-8 font-light max-w-2xl mx-auto">
                        Phantom Protocol renders traditional link-analysis and predatory MEV attacks mathematically impossible.
                    </p>
                </div>

                <div className="glass-panel overflow-hidden border-primary-color/10 shadow-3xl bg-black/40 backdrop-blur-xl">
                    <div className="grid grid-cols-2 p-10 border-b border-primary-color/10 bg-primary-color/5">
                        <div className="mono text-[10px] text-primary-color/60 tracking-[0.3em] font-black">SYSTEM_CAPABILITY</div>
                        <div className="flex items-center gap-3 font-black text-primary-color justify-center font-display text-sm tracking-widest uppercase italic">
                            <ShieldCheck size={18} strokeWidth={2.5} />
                            PHANTOM_CORE
                        </div>
                    </div>

                    {comparisonData.map((row, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="grid grid-cols-2 p-8 border-b border-white/5 hover:bg-primary-color/5 transition-all items-center group"
                        >
                            <div className="text-xs md:text-sm font-bold tracking-widest text-secondary group-hover:text-white transition-colors uppercase font-mono">
                                [ {row.feature} ]
                            </div>
                            <div className="flex justify-center">
                                <div className="w-8 h-8 rounded-lg bg-primary-color/10 flex items-center justify-center border border-primary-color/20 group-hover:border-primary-color/50 transition-all">
                                    <Check size={16} className="text-primary-color" strokeWidth={3} />
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <div className="p-16 text-center bg-black/60 relative overflow-hidden">
                        <div className="absolute inset-0 bg-primary-color/[0.03] pointer-events-none" />
                        <p className="text-[10px] mono text-primary-color/40 uppercase tracking-[0.5em] mb-8 font-black">// PROTOCOL_STATUS: DOMINANT</p>
                        <blockquote className="text-xl italic text-secondary leading-relaxed max-w-2xl mx-auto font-medium font-mono">
                            "The industry's first dark-pool native layer designed for institutional liquidity and absolute user discretion."
                        </blockquote>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ComparisonTable;
