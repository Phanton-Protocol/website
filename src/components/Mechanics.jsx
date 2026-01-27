import { motion } from 'framer-motion';
import { Send, RefreshCw, CheckCircle } from 'lucide-react';

const steps = [
    {
        icon: <Send size={24} className="text-[#00f2ff]" />,
        title: "1. Deposit",
        desc: "Move assets into the shielded pool using ZK-SNARKs."
    },
    {
        icon: <RefreshCw size={24} className="text-[#8a2be2]" />,
        title: "2. Swap & Match",
        desc: "Trade internally with zero slippage and total privacy."
    },
    {
        icon: <CheckCircle size={24} className="text-[#ff00ea]" />,
        title: "3. Settle",
        desc: "Withdraw unlinked funds to any destination wallet."
    }
];

const Mechanics = () => {
    return (
        <section className="section-padding relative">
            <div className="container">
                <div className="text-center mb-20">
                    <h2 className="text-4xl font-extrabold mb-4">THE <span className="gradient-text">FLOW</span></h2>
                    <p className="text-gray text-sm">Invisible execution, instant settlement.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                    {/* Dash line connector */}
                    <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] border-t border-dashed border-white/20 z-0" />

                    {steps.map((step, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.2 }}
                            className="relative z-10 text-center"
                        >
                            <div className="w-24 h-24 glass rounded-full mx-auto mb-8 flex items-center justify-center border-primary-color/20 bg-black shadow-2xl">
                                {step.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                            <p className="text-gray text-sm font-light">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Mechanics;
