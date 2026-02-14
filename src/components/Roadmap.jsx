import { motion } from 'framer-motion';

const roadmapData = [
    {
        phase: "PHASE 01",
        title: "SHADOW GENESIS",
        status: "COMPLETED",
        items: [
            "Whitepaper Release",
            "Core Privacy Engine (ZK-SNARKs)",
            "Institutional Framework Design",
            "Initial Security Audit"
        ]
    },
    {
        phase: "PHASE 02",
        title: "DARK POOL DEPLOYMENT",
        status: "IN PROGRESS",
        items: [
            "Internal Matching Engine",
            "BSC Mainnet Deployment",
            "Encrypted Bridge Alpha",
            "Selective Disclosure Keys"
        ]
    },
    {
        phase: "PHASE 03",
        title: "OMNICHAIN FLUX",
        status: "UPCOMING",
        items: [
            "Ethereum & Polygon Expansion",
            "DEX Aggregator Integration",
            "Institutional SDK Launch",
            "Governance V1"
        ]
    }
];

const Roadmap = () => {
    return (
        <section id="roadmap" className="section-padding relative bg-white/[0.01]">
            <div className="container">
                <div className="mb-32 text-center mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mono text-primary-color mb-8 flex items-center justify-center gap-3"
                    >
                        <span className="w-8 h-[1px] bg-primary-color/30" />
                        STRATEGIC TIMELINE
                        <span className="w-8 h-[1px] bg-primary-color/30" />
                    </motion.div>
                    <h2 className="text-6xl md:text-7xl tracking-tightest leading-tight font-display uppercase font-black italic">THE <span className="gradient-text">PATH.</span></h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {roadmapData.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-panel p-10 relative overflow-hidden group border-primary-color/5 hover:border-primary-color/20 transition-all duration-500"
                        >
                            <div className="absolute top-0 right-0 p-6 opacity-05 group-hover:opacity-10 transition-opacity font-mono font-black italic">
                                <span className="text-8xl leading-none">{idx + 1}</span>
                            </div>

                            <div className="flex items-center gap-3 mb-8">
                                <div className={`h-1.5 w-1.5 rounded-full ${item.status === 'COMPLETED' ? 'bg-accent-color' : item.status === 'IN PROGRESS' ? 'bg-primary-color animate-pulse shadow-[0_0_10px_rgba(0,242,255,0.5)]' : 'bg-white/20'}`} />
                                <span className="mono text-[10px] tracking-[0.2em] font-bold text-muted">{item.status}</span>
                            </div>

                            <div className="mono text-primary-color text-[11px] mb-2 tracking-widest">{item.phase}</div>
                            <h3 className="text-2xl font-black mb-8 font-display tracking-tight text-white uppercase italic">{item.title}</h3>

                            <ul className="space-y-4">
                                {item.items.map((point, pIdx) => (
                                    <li key={pIdx} className="flex items-start gap-3 text-secondary text-xs font-medium font-mono">
                                        <span className="text-primary-color/40 mt-0.5">»</span>
                                        {point}
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Roadmap;
