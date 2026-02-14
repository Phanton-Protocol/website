import { motion } from 'framer-motion';
import { Send, RefreshCw, CheckCircle } from 'lucide-react';

const steps = [
    {
        icon: <Send size={28} strokeWidth={1.5} />,
        title: "01. DEPOSIT",
        desc: "Assets are moved into the shielded pool using advanced ZK-SNARKs, breaking all on-chain links."
    },
    {
        icon: <RefreshCw size={28} strokeWidth={1.5} />,
        title: "02. SWAP & MATCH",
        desc: "Orders are matched internally within the dark pool, preventing MEV and front-running."
    },
    {
        icon: <CheckCircle size={28} strokeWidth={1.5} />,
        title: "03. SETTLE",
        desc: "Securely withdraw unlinked funds to any destination wallet with 100% mathematical privacy."
    }
];

const Mechanics = () => {
    return (
        <section className="section-padding relative overflow-hidden bg-black/40">
            <div className="container">
                <div className="text-center mb-32 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mono text-primary-color mb-6 flex items-center justify-center gap-3"
                    >
                        OPERATIONAL LOGIC
                    </motion.div>
                    <h2 className="text-6xl md:text-7xl tracking-tightest leading-tight font-display uppercase mb-6">THE <span className="gradient-text">FLOW.</span></h2>
                    <p className="text-secondary text-lg font-light leading-relaxed">
                        A seamless, three-step execution layer designed for absolute discretion.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24 relative">
                    {/* Dash line connector optimization */}
                    <div className="hidden md:block absolute top-[48px] left-[15%] right-[15%] h-[1px] border-t border-dashed border-primary-color/20 z-0" />

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="relative z-10 text-center group"
                        >
                            <div className="w-24 h-24 glass-panel rounded-2xl mx-auto mb-10 flex items-center justify-center border-primary-color/10 bg-black/60 group-hover:border-primary-color/40 group-hover:shadow-[0_0_30px_rgba(0,242,255,0.1)] transition-all duration-500 relative overflow-hidden">
                                <div className="absolute inset-0 bg-primary-color/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="text-primary-color group-hover:text-white transition-colors duration-500 relative z-10">
                                    {step.icon}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black mb-6 font-display tracking-tight text-white italic uppercase">{step.title}</h3>
                            <p className="text-secondary text-xs font-medium leading-relaxed font-mono px-4">
                                {step.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Mechanics;
