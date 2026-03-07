import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const faqs = [
  {
    q: "Is Phantom a mixer?",
    a: "No. Phantom is a multi‑asset shielded pool with per‑wallet reporting keys and optional sanctions screening. It is designed for ongoing payroll, treasury, and payout flows, not one‑off anonymization."
  },
  {
    q: "Who can use Phantom?",
    a: "Banks, institutions, traders, and teams. Use cases include private payroll, treasury rebalancing, and — via FHE internal matching — liquidating token or LP positions without any public price impact. See the Who it's for section above."
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
    a: "Deposit: $2 in BNB per deposit. Swap via PancakeSwap: 0.1%. Swap when matched inside the shielded pool (internal match): 0.2%. Relayers may also charge a small fee; it’s shown in the DApp before you confirm."
  },
  {
    q: "How does internal matching work without an order book?",
    a: "Internal matching is OTC-style: there is no public order book. In the DApp you type the price you want to buy or sell at. Your order is stored encrypted. When someone comes with the opposite side (e.g. you want to sell BNB for USDT at X, they want to buy BNB for USDT at a compatible price), you're matched and the swap settles inside the shielded pool. Nobody sees the full book; the matcher only learns that a match exists and executes it."
  },
  {
    q: "Can teams sell tokens without moving the price?",
    a: "Yes. With FHE-based internal matching (in development), teams and DAOs can liquidate token or LP positions by matching with a counterparty inside the shielded pool. The order never hits the public order book, so there is no visible price impact and no slippage from the public market — a major use case for treasury exits and rebalancing."
  },
  {
    q: "How does FHE order and price matching work?",
    a: "OTC-style: you type the price you want to buy or sell at. Your order is encrypted (FHE). When someone submits the opposite side at a compatible price, the matcher runs on ciphertext and confirms the match; only the settlement is revealed. So the price is defined by you and the counterparty — when your price and theirs cross, you match. No public book."
  },
  {
    q: "What is internal matching?",
    a: "OTC-style matching inside the shielded pool. You set your price (buy or sell); when a counterparty submits an opposite order at a compatible price, you match. No public order book — orders are encrypted; when someone comes, the trade is settled privately. If no one matches, your swap can route through the DEX instead."
  },
  {
    q: "How does payroll work on Phantom?",
    a: "A company deposits into the shielded pool, creates a payroll run listing recipients and amounts, and then uses the Withdraw flow to send funds from the pool. The public chain only sees pool interactions, while employees can still export their own histories for taxes."
  },
  {
    q: "What chains are planned?",
    a: "The current implementation targets BNB Chain. The architecture is EVM‑compatible and can be extended to other chains in future iterations."
  },
  {
    q: "Can I build my own app on Phantom?",
    a: "Yes. Phantom provides an SDK and APIs so you can build on-chain contracts, messaging apps, treasury tools, and more. Use the relayer API for proofs and submissions (quote, intent, swap, deposit, withdraw, merkle), and our contract interfaces (ShieldedPool, NoteStorage, SwapAdaptor, RelayerStaking) to integrate with the pool. See the Build / SDK section and GitHub for code and patterns."
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
                                                color: '#fff',
                                                fontSize: 'var(--body-size)',
                                                fontWeight: 500,
                                                lineHeight: 'var(--body-line)',
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
