import { motion } from 'framer-motion';

const NewsSection = () => {
    const newsItems = [
        {
            title: "Phantom V1 Alfa Live on Testnet",
            date: "FEB 24, 2026",
            category: "ANNOUNCEMENT",
            excerpt: "The first iteration of our dark pool matching engine is now open for rigorous stress testing by whitelisted institutional actors."
        },
        {
            title: "Strategic Partnership with Nexus Privacy",
            date: "FEB 20, 2026",
            category: "ECOSYSTEM",
            excerpt: "Integrating massive FHE-powered oracle solutions to completely eradicate cross-chain data latency."
        },
        {
            title: "Redefining MEV Resistance",
            date: "FEB 15, 2026",
            category: "RESEARCH",
            excerpt: "Our latest research paper on utilizing ZK-SNARK constructs to entirely excise toxic order flow from the liquidity pool."
        }
    ];

    return (
        <section className="section" id="news">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <div className="section-label">System Intel</div>
                        <h2 className="display-lg">
                            Latest<br /><em>broadcasts.</em>
                        </h2>
                    </div>
                    <a href="#" className="btn-outline">
                        View All Logs
                    </a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {newsItems.map((news, idx) => (
                        <motion.a
                            href="#"
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.6 }}
                            className="hover-underline"
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(120px, 1fr) 3fr',
                                gap: '2rem',
                                padding: '2.5rem 0',
                                borderTop: idx === 0 ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.03)',
                                textDecoration: 'none',
                                color: 'var(--text-primary)',
                                alignItems: 'start'
                            }}
                        >
                            <div className="mono text-muted">
                                <span style={{ color: 'var(--cyan)', display: 'block', marginBottom: '0.25rem' }}>[{news.category}]</span>
                                {news.date}
                            </div>
                            <div>
                                <h3 style={{
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '1.75rem',
                                    fontWeight: 400,
                                    marginBottom: '1rem',
                                }}>
                                    {news.title}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '600px' }}>
                                    {news.excerpt}
                                </p>
                            </div>
                        </motion.a>
                    ))}
                    <div className="divider" />
                </div>
            </div>
        </section>
    );
};

export default NewsSection;
