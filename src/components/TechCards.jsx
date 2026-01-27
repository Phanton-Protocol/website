import { motion } from 'framer-motion';
import { Shield, Zap, Lock } from 'lucide-react';

const techItems = [
    {
        icon: <Shield size={32} className="text-primary-color" />,
        title: "zk-SNARKs",
        desc: "Mathematically proven privacy. Your assets and identity remain unlinked and invisible on-chain."
    },
    {
        icon: <Lock size={32} className="text-secondary-color" />,
        title: "THRESHOLD FHE",
        desc: "Fully Homomorphic Encryption allows us to process orders without ever seeing the data."
    },
    {
        icon: <Zap size={32} className="text-accent-color" />,
        title: "DARK MATCHING",
        desc: "Proprietary order matching that happens entirely in the shadows, preventing MEV attacks."
    }
];

const TechCards = () => {
    return (
        <section id="technology" className="section-padding relative">
            <div className="container">
                <div className="mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mono text-primary-color mb-6"
                    >
                        Technical Foundation
                    </motion.div>
                    <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">CRYPTO <span className="gradient-text">PRIMITIVES</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    {techItems.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="text-center group"
                        >
                            <div className="w-24 h-24 glass mx-auto mb-10 rounded-2xl flex items-center justify-center border-white/5 group-hover:border-primary-color/40 transition-all duration-500 shadow-2xl">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-6 font-display tracking-tight text-white">{item.title}</h3>
                            <p className="text-secondary text-sm font-light leading-relaxed px-6">
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
