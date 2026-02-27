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
                                <div style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 500 }}>Commitment insertion.</div>
                                <div style={{ textTransform: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>The relayer submits a Pedersen commitment — a sealed cryptographic representation of the deposit amount — into the shielded pool's Merkle tree. The commitment is publicly verifiable as existing in the tree, but carries no information about its value.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--cyan)' }}>02</div>
                            <div style={{ flexGrow: 1, paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
                                <div style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 500 }}>Encrypted note issuance.</div>
                                <div style={{ textTransform: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>The pool generates and returns a private receipt — an encrypted note containing asset type, amount, blinding factor, and viewing key. This note is the sole instrument of ownership. Only the depositor can decrypt it.</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--cyan)' }}>03</div>
                            <div style={{ flexGrow: 1 }}>
                                <div style={{ color: '#fff', marginBottom: '0.5rem', fontWeight: 500 }}>Gas refund execution.</div>
                                <div style={{ textTransform: 'none', fontFamily: 'var(--font-body)', lineHeight: 1.6 }}>The relayer's gas costs are automatically reimbursed from the pool balance. Relayers operate at zero economic loss, ensuring consistent availability and preventing fee-based censorship of transactions.</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Mechanics;
