import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'Architecture', href: '#architecture' },
  { name: 'Technology', href: '#technology' },
  { name: 'Privacy & keys', href: '#security' },
  { name: 'Roadmap', href: '#roadmap' },
];

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 200,
                padding: scrolled ? '1rem 0' : '1.75rem 0',
                background: scrolled ? 'rgba(10,10,10,0.9)' : 'transparent',
                backdropFilter: scrolled ? 'blur(20px)' : 'none',
                borderBottom: scrolled ? '1px solid var(--border)' : 'none',
                transition: 'all 0.4s ease',
            }}
        >
            <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Logo Mark */}
                <a
                    href="/"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
                    onClick={() => window.scrollTo(0, 0)}
                >
                    <div style={{
                        width: 28, height: 28,
                        border: '1px solid var(--cyan)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--cyan)' }} />
                    </div>
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: 'var(--text-primary)',
                    }}>
                        PHANTOM<span style={{ color: 'var(--cyan)' }}>.</span>PROTOCOL
                    </span>
                </a>

                {/* Desktop Links */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }} className="hidden-mobile">
                    {navLinks.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="hover-underline"
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.65rem',
                                letterSpacing: '0.12em',
                                textTransform: 'uppercase',
                                color: 'var(--text-secondary)',
                                textDecoration: 'none',
                                transition: 'color 0.3s',
                            }}
                            onMouseEnter={e => e.target.style.color = '#fff'}
                            onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <a
                        href="#"
                        className="btn-outline hidden-mobile"
                        style={{ fontSize: '0.65rem', padding: '0.6rem 1.2rem' }}
                    >
                        Read Whitepaper
                    </a>
                    <button
                        style={{
                            display: 'none',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#fff',
                            padding: '0.5rem',
                        }}
                        className="show-mobile"
                        onClick={() => setOpen(!open)}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            <span style={{ display: 'block', width: 22, height: 1, background: '#fff', transition: 'transform 0.3s', transform: open ? 'translateY(6px) rotate(45deg)' : 'none' }} />
                            <span style={{ display: 'block', width: 22, height: 1, background: '#fff', opacity: open ? 0 : 1, transition: 'opacity 0.3s' }} />
                            <span style={{ display: 'block', width: 22, height: 1, background: '#fff', transition: 'transform 0.3s', transform: open ? 'translateY(-6px) rotate(-45deg)' : 'none' }} />
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            background: 'rgba(10,10,10,0.97)',
                            borderTop: '1px solid var(--border)',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="container" style={{ padding: '2rem var(--pad)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {navLinks.map(link => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.8rem',
                                        letterSpacing: '0.15em',
                                        textTransform: 'uppercase',
                                        color: 'var(--text-secondary)',
                                        textDecoration: 'none',
                                    }}
                                >
                                    {link.name}
                                </a>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile   { display: block !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
        </motion.nav>
    );
};

export default Navbar;
