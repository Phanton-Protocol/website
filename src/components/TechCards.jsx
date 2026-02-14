import { motion } from 'framer-motion';
import { Shield, Zap, Lock } from 'lucide-react';

const techItems = [
    {
        icon: <Shield size={32} strokeWidth={1.5} />,
        title: "ZK-SNARKs",
        desc: "Mathematically proven privacy. Your assets and identity remain unlinked and invisible on-chain."
    },
    {
        icon: <Lock size={32} strokeWidth={1.5} />,
        title: "THRESHOLD FHE",
        desc: "Fully Homomorphic Encryption allows us to process orders without ever decrypting sensitive data."
    },
    {
        icon: <Zap size={32} strokeWidth={1.5} />,
        title: "DARK MATCHING",
        desc: "Proprietary matching engine that happens entirely off-mempool, preventing predatory MEV attacks."
    }
];

const TechCards = () => {
    return (
        <section id="technology" className="section-padding relative">
            <div className="container">
                <div className="mb-32 text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mono text-primary-color mb-8 flex items-center justify-center gap-3"
                    >
                        <span className="w-12 h-[1px] bg-primary-color/30" />
                        TECHNICAL FOUNDATION
                        <span className="w-12 h-[1px] bg-primary-color/30" />
                    </motion.div>
                    <h2 className="text-6xl md:text-7xl tracking-tight leading-tight font-display uppercase font-black">CORE <span className="gradient-text italic">PRIMITIVES.</span></h2>
                    <p className="text-secondary text-lg mt-8 font-light max-w-xl mx-auto">
                        We combine bleeding-edge cryptography with optimized matching logic to redefine privacy in DeFi.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 mx-auto">
                    {techItems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15 }}
                            className="text-center group"
                        >
                            <div className="w-24 h-24 mx-auto mb-10 rounded-2xl flex items-center justify-center border border-primary-color/10 bg-black/40 backdrop-blur-xl group-hover:border-primary-color/40 transition-all duration-700 relative overflow-hidden group-hover:shadow-[0_0_40px_rgba(0,242,255,0.1)]">
                                <div className="absolute inset-0 bg-primary-color/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="text-primary-color group-hover:text-white transition-colors duration-500 relative z-10">
                                    {item.icon}
                                </div>
                            </div>
                            <div className="mono text-[10px] text-primary-color/40 mb-3 tracking-[0.2em] font-black uppercase italic">PRIMITIVE_ID: {idx.toString().padStart(2, '0')}</div>
                            <h3 className="text-2xl font-black mb-6 font-display tracking-tight text-white uppercase italic">{item.title}</h3>
                            <p className="text-secondary text-xs leading-relaxed font-medium font-mono px-4 opacity-70">
                                {item.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechCards;
