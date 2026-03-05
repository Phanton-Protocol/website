import { motion } from 'framer-motion';

const Mechanics = () => {
    return (
        <section className="section" id="architecture">
            <div className="container">
                <div style={{ marginBottom: '4rem' }}>
                    <div className="section-label">System Mechanics</div>
                    <h2 className="display-lg">
                        End to<br /><em>end.</em>
                    </h2>
                </div>

                <div className="card" style={{ padding: '4rem', background: '#0a0a0a' }}>
                    <motion.div
                        className="mono"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1 }}
                        style={{ display: 'grid', gap: '3rem', color: 'var(--text-secondary)' }}
                    >
                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--cyan)' }}>01</div>
                            <div style={{ flexGrow: 1, paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 500 }}>Deposit into the shielded pool.</div>
                                <div style={{ textTransform: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>A company or user deposits assets from a public wallet into the Phantom pool. On-chain you only see a single deposit; inside Phantom it becomes a private note that tracks balance, asset and owner, without linking to the public address.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--cyan)' }}>02</div>
                            <div style={{ flexGrow: 1, paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 500 }}>Generate proofs, not traces.</div>
                                <div style={{ textTransform: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>When you swap, withdraw, or run payroll, Phantom generates a Groth16 proof that your balances and Merkle path are valid. Validators can verify the math, but never see who you paid, how much you swapped, or what your total balance is.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--cyan)' }}>03</div>
                            <div style={{ flexGrow: 1, paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 500 }}>Distribute to wallets or banks.</div>
                                <div style={{ textTransform: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>For payroll or payouts, Phantom can send directly to employee wallets or route flows toward off‑ramp partners. Each employee can generate their own reporting key, so HR and accountants can see history without exposing the rest of your books.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--cyan)' }}>04</div>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 500 }}>Internal matching (roadmap).</div>
                                <div style={{ textTransform: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>When two users want to swap in opposite directions (e.g. USDT for BNB), Phantom can match them inside the pool without routing through a public DEX. That reduces cost and leakage. Internal matching is in development; today swaps go through an external DEX.</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Mechanics;
