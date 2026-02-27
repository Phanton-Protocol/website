import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const faqs = [
    {
        q: "How does Phantom obscure liquidity?",
        a: "Phantom leverages a specialized implementation of Fully Homomorphic Encryption (FHE) combined with ZK-SNARKs. This allows the network nodes to continuously compute trade matching algorithms on ciphertexts without ever decrypting the underlying order values or sender identities."
    },
    {
        q: "Is the network vulnerable to MEV?",
        a: "No. By design, mempool data is entirely opaque to validators. There is zero informational asymmetry to exploit, rendering traditional MEV strategies (sandwiching, front-running) impossible."
    },
    {
        q: "What chains are supported?",
        a: "The v1 architecture natively bridges Ethereum Mainnet and Binance Smart Chain, utilizing a synchronized state-relay model. Future phases will integrate Polygon, Arbitrum, and custom app-chains."
    },
    {
        q: "How can institutions audit the pool?",
        a: "Phantom introduces 'Selective Disclosure Keys' (SDKs). These cryptographic viewing keys permit authorized entities (e.g., regulators, internal auditors) to decrypt specific historical transaction flows without compromising global network anonymity."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <section className="section" id="faq">
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) minmax(300px, 2fr)', gap: '4rem', alignItems: 'start' }}>
                    <div>
                        <div className="section-label">Directive Queries</div>
                        <h2 className="display-lg">
                            Frequent<br /><em>inquiries.</em>
                        </h2>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {faqs.map((faq, idx) => (
                            <div
                                key={idx}
                                style={{
                                    borderTop: idx === 0 ? '1px solid var(--border)' : '1px solid rgba(255,255,255,0.03)',
                                }}
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '2.5rem 0',
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        textAlign: 'left'
                                    }}
                                >
                                    <h3 style={{
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '1.4rem',
                                        fontWeight: 400,
                                        color: openIndex === idx ? 'var(--cyan)' : '#fff',
                                        transition: 'color 0.3s'
                                    }}>
                                        {faq.q}
                                    </h3>
                                    <div style={{ color: 'var(--cyan)', fontSize: '1.5rem', fontWeight: 300 }}>
                                        {openIndex === idx ? '−' : '+'}
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {openIndex === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <div style={{
                                                paddingBottom: '2.5rem',
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.95rem',
                                                lineHeight: 1.7,
                                                maxWidth: '650px'
                                            }}>
                                                {faq.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                        <div className="divider" />
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    #faq .container > div {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </section>
    );
};

export default FAQ;
