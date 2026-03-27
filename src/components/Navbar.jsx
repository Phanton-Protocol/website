import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DAPP_URL } from '../config';
import logoImg from '../assets/logo.jpg';

const navLinks = [
  { name: 'Who it\'s for', href: '#who-its-for' },
  { name: 'Relayers', href: '#relayers' },
  { name: 'User DApp', href: '#/user' },
  { name: 'Relayer / Staker', href: '#/relayer' },
  { name: 'Build / SDK', href: '#sdk' },
  { name: 'Architecture', href: '#architecture' },
  { name: 'Technology', href: '#technology' },
  { name: 'Privacy', href: '#security' },
  { name: 'Fees', href: '#fees' },
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
                background: scrolled ? 'rgba(10,10,10,0.97)' : 'rgba(10,10,10,0.88)',
                backdropFilter: scrolled ? 'blur(16px)' : 'blur(12px)',
                WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'blur(12px)',
                borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
                transition: 'all 0.4s ease',
            }}
        >
            <div className="container nav-container">
                {/* Logo */}
                <a
                    href="/"
                    className="nav-brand"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', flexShrink: 0 }}
                    onClick={() => window.scrollTo(0, 0)}
                >
                    <img
                        src={logoImg}
                        alt="Phantom Protocol"
                        style={{
                            width: 32,
                            height: 32,
                            objectFit: 'contain',
                            borderRadius: '50%',
                        }}
                    />
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#ffffff',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                    }}>
                        PHANTOM<span style={{ color: 'var(--cyan)' }}>.</span>PROTOCOL
                    </span>
                </a>

                {/* Desktop Links - tighter so all fit on one line */}
                <div className="nav-links hidden-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flex: '1 1 auto', minWidth: 0, maxWidth: '100%' }}>
                    {navLinks.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            className="hover-underline"
                            style={{
                                fontFamily: 'var(--font-mono)',
                                fontSize: '0.6rem',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                color: '#ffffff',
                                fontWeight: 500,
                                textDecoration: 'none',
                                transition: 'color 0.3s',
                                whiteSpace: 'nowrap',
                            }}
                            onMouseEnter={e => e.target.style.color = '#fff'}
                            onMouseLeave={e => e.target.style.color = '#ffffff'}
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                {/* CTA - don't shrink */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }} className="nav-cta">
                    <a
                        href="#"
                        className="btn-outline hidden-mobile"
                        style={{ fontSize: '0.65rem', padding: '0.6rem 1.2rem', color: '#fff', borderColor: 'rgba(255,255,255,0.5)' }}
                    >
                        Read Whitepaper
                    </a>
                    <a
                        href={DAPP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden-mobile"
                        style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.65rem',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            background: 'var(--cyan)',
                            color: '#0a0a0a',
                            padding: '0.6rem 1.2rem',
                            textDecoration: 'none',
                            fontWeight: 600,
                            transition: 'opacity 0.3s, box-shadow 0.3s',
                        }}
                        onMouseEnter={e => { e.target.style.opacity = '0.9'; e.target.style.boxShadow = '0 0 24px rgba(0,229,199,0.35)'; }}
                        onMouseLeave={e => { e.target.style.opacity = '1'; e.target.style.boxShadow = 'none'; }}
                    >
                        Open DApp
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
                                        color: 'rgba(255, 255, 255, 0.95)',
                                        fontWeight: 500,
                                        textDecoration: 'none',
                                    }}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <a
                                href={DAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setOpen(false)}
                                style={{
                                    fontFamily: 'var(--font-mono)',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.15em',
                                    textTransform: 'uppercase',
                                    color: 'var(--cyan)',
                                    textDecoration: 'none',
                                    marginTop: '0.5rem',
                                }}
                            >
                                Open DApp →
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
        .nav-container {
          overflow: visible;
          align-items: center;
          display: flex;
          flex-wrap: nowrap;
          justify-content: space-between;
          gap: 1rem;
        }
        @media (min-width: 1321px) {
          .nav-container { flex-wrap: nowrap; }
          .nav-links {
            overflow-x: auto;
            overscroll-behavior-x: contain;
            scrollbar-width: none;
            -ms-overflow-style: none;
            justify-content: center;
          }
          .nav-links::-webkit-scrollbar { display: none; }
        }
        @media (max-width: 1320px) and (min-width: 769px) {
          .nav-container {
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto;
            grid-template-rows: auto auto;
            gap: 0.65rem 1rem;
            align-items: center;
          }
          .nav-brand { grid-column: 1; grid-row: 1; min-width: 0; }
          .nav-cta { grid-column: 2; grid-row: 1; justify-self: end; }
          .nav-links {
            grid-column: 1 / -1;
            grid-row: 2;
            flex-wrap: wrap;
            justify-content: center;
            gap: 0.65rem 1.1rem !important;
            max-width: 100%;
          }
          .nav-links a { font-size: 0.55rem !important; letter-spacing: 0.08em !important; }
        }
        .nav-links a { overflow: visible; }
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
