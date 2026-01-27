import { motion } from 'framer-motion';
import { EyeOff, Zap, Globe, ShieldCheck } from 'lucide-react';

const benefitList = [
    {
        icon: <EyeOff size={32} className="text-primary-color" />,
        title: "Shadow Execution",
        desc: "Your trades are processed in a shielded internal pool. No mempool exposure, no frontrunning bots."
    },
    {
        icon: <Zap size={32} className="text-secondary-color" />,
        title: "Instant Matching",
        desc: "Proprietary order books match trades internally before ever touching a public DEX."
    },
    {
        icon: <Globe size={32} className="text-accent-color" />,
        title: "Omnichain Flux",
        desc: "Unified privacy layer starting on BSC, with native bridges to Ethereum and Layer 2s."
    },
    {
        icon: <ShieldCheck size={32} className="text-primary-color" />,
        title: "Institutional SDK",
        desc: "Uncompromising privacy for users, with selective compliance keys for regulated entities."
    }
];

const Benefits = () => {
    return (
        <section id="protocol" className="section-padding relative">
            <div className="container">
                <div className="mb-24">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="mono text-primary-color mb-4"
                    >
                        Capabilities
                    </motion.div>
                    <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter max-w-4xl">
                        BUILT FOR THE <span className="gradient-text">SHADOWS.</span>
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {benefitList.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-10 group"
                        >
                            <div className="mb-8 group-hover:scale-110 transition-transform duration-500">
                                {item.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-4 font-display tracking-tight text-white">{item.title}</h3>
                            <p className="text-secondary text-sm leading-relaxed font-light">
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
