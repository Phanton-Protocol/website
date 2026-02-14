import { motion } from 'framer-motion';
import { EyeOff, Zap, Globe, ShieldCheck } from 'lucide-react';

const benefitList = [
    {
        icon: <EyeOff size={32} strokeWidth={1.5} />,
        title: "PRIVATE EXECUTION",
        desc: "Trades are processed within a shielded internal pool. Zero mempool exposure, zero frontrunning bots."
    },
    {
        icon: <Zap size={32} strokeWidth={1.5} />,
        title: "INSTANT SETTLEMENT",
        desc: "Proprietary order books match trades internally before they touch fragmented public liquidity."
    },
    {
        icon: <Globe size={32} strokeWidth={1.5} />,
        title: "OMNICHAIN FLUX",
        desc: "Unified privacy layer starting on BSC, with native bridges to Ethereum and emerging Layer 2s."
    },
    {
        icon: <ShieldCheck size={32} strokeWidth={1.5} />,
        title: "COMPLIANCE FRAMEWORK",
        desc: "Uncompromising privacy for users, with selective viewing keys for institutional reporting needs."
    }
];

const Benefits = () => {
    return (
        <section id="protocol" className="section-padding relative border-y border-white/5 bg-white/[0.01]">
            <div className="container">
                <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>

                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="mono text-primary-color mb-6 flex items-center gap-3"
                        >
                            <span className="w-8 h-[1px] bg-primary-color" />
                            CORE CAPABILITIES
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl tracking-tighter uppercase leading-tight font-display font-black">
                            TERMINAL <span className="gradient-text italic">POWER.</span>
                        </h2>
                    </div>
                    <div className="md:mb-4 text-muted mono text-xs tracking-widest max-w-[200px]">
                        ENGINEERED FOR SUPREME DISCRETION
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefitList.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            className="glass-card p-10 group flex flex-col border-white/5 hover:border-primary-color/20 transition-all duration-500 bg-black/40 backdrop-blur-xl rounded-2xl"
                        >
                            <div className="mb-10 text-primary-color group-hover:scale-110 group-hover:text-white transition-all duration-500 origin-left">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-black mb-4 font-display tracking-tight text-white uppercase italic">{item.title}</h3>
                            <p className="text-secondary text-xs leading-relaxed font-medium font-mono opacity-80">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Benefits;
