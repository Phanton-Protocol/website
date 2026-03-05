import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const faqs = [
  {
    q: "Is Phantom a mixer?",
    a: "No. Phantom is a multi‑asset shielded pool with per‑wallet reporting keys and optional sanctions screening. It is designed for ongoing payroll, treasury, and payout flows, not one‑off anonymization."
  },
  {
    q: "Who can use Phantom?",
    a: "Banks, institutions, traders, and teams. Banks and custodians can offer private settlement; funds and companies can run payroll and treasury; traders can swap with reduced on-chain footprint; teams can pay contractors privately. See the Who it's for section above."
  },
  {
    q: "Who controls the funds?",
    a: "Funds are held in smart contracts on BNB Chain. You control your keys. Relayers cannot move your assets without a valid zero‑knowledge proof generated from your notes."
  },
  {
    q: "How can employees or accountants see history?",
    a: "Each wallet can generate one or more reporting keys. Sharing a key lets an accountant, lawyer, or tax tool see that wallet’s full transaction history, without revealing other users or internal pool details. Keys can be revoked at any time."
  },
  {
    q: "What are the fees?",
    a: "Relayers may charge a small fee to cover gas; swap routing uses a DEX (e.g. PancakeSwap) so you pay normal DEX fees and slippage. There is no protocol fee today. See the Fees section for details."
  },
  {
    q: "What is internal matching?",
    a: "When two users swap in opposite directions, Phantom can match them inside the pool instead of routing through a public DEX — reducing cost and leakage. Internal matching is on the roadmap; currently swaps go through an external DEX."
  },
  {
    q: "How does payroll work on Phantom?",
    a: "A company deposits into the shielded pool, creates a payroll run listing recipients and amounts, and then uses the Withdraw flow to send funds from the pool. The public chain only sees pool interactions, while employees can still export their own histories for taxes."
  },
  {
    q: "What chains are planned?",
    a: "The current implementation targets BNB Chain. The architecture is EVM‑compatible and can be extended to other chains in future iterations."
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
