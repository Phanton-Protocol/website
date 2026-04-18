import { useEffect, useRef } from 'react';

const GhostChainVisualizer = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });

    useEffect(() => {
        const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
        const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
        const narrow = typeof window !== 'undefined' && window.innerWidth <= 900;
        if (reduceMotion || coarsePointer || narrow) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let raf;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            buildGrid();
            buildLinks();
        };
        window.addEventListener('resize', resize);

        const onMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', onMouseMove);

        const COLS = 8;
        const ROWS = 5;
        const GHOST_BREAK_RADIUS = 110;
        const LINK_REGEN_MS = 5000;
        const PARTICLE_COUNT = 12;
        const HEX = '0123456789ABCDEF';

        const C_CYAN = '0, 243, 255';
        const C_WHITE = '255, 255, 255';
        const C_GHOST = '0, 243, 255';

        const nodes = [];

        function buildGrid() {
            nodes.length = 0;
            const padX = canvas.width * 0.1;
            const padY = canvas.height * 0.1;
            const gapX = (canvas.width - padX * 2) / (COLS - 1);
            const gapY = (canvas.height - padY * 2) / (ROWS - 1);
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    nodes.push({
                        x: padX + c * gapX + (Math.random() - 0.5) * gapX * 0.25,
                        y: padY + r * gapY + (Math.random() - 0.5) * gapY * 0.25,
                        label: Array.from({ length: 4 }, () => HEX[Math.floor(Math.random() * 16)]).join(''),
                        phase: Math.random() * Math.PI * 2,
                    });
                }
            }
        }

        const links = [];

        function buildLinks() {
            links.length = 0;
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const i = r * COLS + c;
                    if (c < COLS - 1) links.push(newLink(i, i + 1));
                    if (r < ROWS - 1) links.push(newLink(i, i + COLS));
                    if (c < COLS - 1 && r < ROWS - 1 && Math.random() < 0.22)
                        links.push(newLink(i, i + COLS + 1));
                }
            }
        }

        function newLink(a, b) {
            return { a, b, broken: false, brokenAt: 0, particles: [] };
        }

        const trail = [];
        const TRAIL_LEN = 28;
        const ghost = { x: -500, y: -500 };

        function ptSegDist(px, py, ax, ay, bx, by) {
            const dx = bx - ax, dy = by - ay;
            const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
            return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
        }

        function spawnParticles(link) {
            const na = nodes[link.a], nb = nodes[link.b];
            const mx = (na.x + nb.x) / 2, my = (na.y + nb.y) / 2;
            link.particles = Array.from({ length: PARTICLE_COUNT }, () => ({
                x: mx + (Math.random() - 0.5) * 20,
                y: my + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 2.2,
                vy: (Math.random() - 0.5) * 2.2,
                life: 1,
                decay: 0.013 + Math.random() * 0.018,
                r: 1 + Math.random() * 1.5,
            }));
        }

        let t = 0;

        function render() {
            t += 0.016;
            const now = performance.now();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ghost.x += (mouseRef.current.x - ghost.x) * 0.07;
            ghost.y += (mouseRef.current.y - ghost.y) * 0.07;

            trail.unshift({ x: ghost.x, y: ghost.y });
            if (trail.length > TRAIL_LEN) trail.pop();

            links.forEach((link) => {
                const na = nodes[link.a], nb = nodes[link.b];

                if (link.broken && now - link.brokenAt > LINK_REGEN_MS) {
                    link.broken = false;
                    link.particles = [];
                }

                if (!link.broken) {
                    if (ptSegDist(ghost.x, ghost.y, na.x, na.y, nb.x, nb.y) < GHOST_BREAK_RADIUS * 0.55) {
                        link.broken = true;
                        link.brokenAt = now;
                        spawnParticles(link);
                    }
                }

                if (!link.broken) {
                    const g = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
                    g.addColorStop(0, `rgba(${C_CYAN}, 0.05)`);
                    g.addColorStop(0.5, `rgba(${C_CYAN}, 0.20)`);
                    g.addColorStop(1, `rgba(${C_CYAN}, 0.05)`);

                    const pulse = (Math.sin(t * 1.8 + link.a * 0.4) + 1) / 2;
                    ctx.beginPath();
                    ctx.moveTo(na.x, na.y);
                    ctx.lineTo(nb.x, nb.y);
                    ctx.strokeStyle = g;
                    ctx.lineWidth = 0.7 + pulse * 0.5;
                    ctx.stroke();

                    const frac = ((t * 0.35 + link.a * 0.19) % 1);
                    ctx.beginPath();
                    ctx.arc(na.x + (nb.x - na.x) * frac, na.y + (nb.y - na.y) * frac, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${C_CYAN}, ${0.45 + pulse * 0.45})`;
                    ctx.fill();
                } else {
                    const age = Math.min(1, (now - link.brokenAt) / 800);
                    const stub = Math.max(0, 0.22 - age * 0.18);
                    const a = Math.max(0, 0.3 - age * 0.3);

                    ctx.setLineDash([4, 8]);
                    ctx.strokeStyle = `rgba(${C_WHITE}, ${a})`;
                    ctx.lineWidth = 0.6;

                    ctx.beginPath();
                    ctx.moveTo(na.x, na.y);
                    ctx.lineTo(na.x + (nb.x - na.x) * stub, na.y + (nb.y - na.y) * stub);
                    ctx.stroke();

                    ctx.beginPath();
                    ctx.moveTo(nb.x, nb.y);
                    ctx.lineTo(nb.x + (na.x - nb.x) * stub, nb.y + (na.y - nb.y) * stub);
                    ctx.stroke();
                    ctx.setLineDash([]);

                    link.particles.forEach((p) => {
                        p.x += p.vx; p.y += p.vy;
                        p.vx *= 0.97; p.vy *= 0.97;
                        p.life -= p.decay;
                        if (p.life <= 0) return;
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${C_CYAN}, ${p.life * 0.55})`;
                        ctx.fill();
                    });
                }
            });

            nodes.forEach((node) => {
                node.phase += 0.018;
                const glow = (Math.sin(node.phase) + 1) / 2;
                const near = Math.hypot(node.x - ghost.x, node.y - ghost.y) < GHOST_BREAK_RADIUS;

                ctx.beginPath();
                ctx.arc(node.x, node.y, 5.5 + glow * 2, 0, Math.PI * 2);
                ctx.strokeStyle = near
                    ? `rgba(${C_WHITE}, ${0.18 + glow * 0.25})`
                    : `rgba(${C_CYAN},  ${0.08 + glow * 0.12})`;
                ctx.lineWidth = 0.7;
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
                ctx.fillStyle = near
                    ? `rgba(${C_WHITE}, 0.9)`
                    : `rgba(${C_CYAN},  0.55)`;
                ctx.fill();

                ctx.font = '7.5px Public Sans, sans-serif';
                ctx.fillStyle = `rgba(${C_CYAN}, ${0.18 + glow * 0.12})`;
                ctx.fillText(node.label, node.x + 8, node.y + 3);
            });

            trail.forEach((pt, i) => {
                const a = (1 - i / TRAIL_LEN) * 0.07;
                const r = 3 + (1 - i / TRAIL_LEN) * 7;
                ctx.beginPath();
                ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${C_GHOST}, ${a})`;
                ctx.fill();
            });

            const hR = GHOST_BREAK_RADIUS * (0.8 + Math.sin(t * 1.3) * 0.07);
            const hGrd = ctx.createRadialGradient(ghost.x, ghost.y, 0, ghost.x, ghost.y, hR);
            hGrd.addColorStop(0, `rgba(${C_GHOST}, 0.07)`);
            hGrd.addColorStop(0.5, `rgba(${C_GHOST}, 0.035)`);
            hGrd.addColorStop(1, `rgba(${C_GHOST}, 0)`);
            ctx.beginPath();
            ctx.arc(ghost.x, ghost.y, hR, 0, Math.PI * 2);
            ctx.fillStyle = hGrd;
            ctx.fill();

            ctx.save();
            ctx.translate(ghost.x, ghost.y);
            ctx.rotate(t * 0.5);
            ctx.beginPath();
            ctx.arc(0, 0, GHOST_BREAK_RADIUS * 0.55, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${C_WHITE}, ${0.04 + Math.sin(t * 2) * 0.02})`;
            ctx.lineWidth = 0.7;
            ctx.setLineDash([5, 12]);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.restore();

            const cGrd = ctx.createRadialGradient(ghost.x, ghost.y, 0, ghost.x, ghost.y, 20);
            cGrd.addColorStop(0, `rgba(${C_WHITE}, 1)`);
            cGrd.addColorStop(0.4, `rgba(${C_GHOST}, 0.5)`);
            cGrd.addColorStop(1, `rgba(${C_GHOST}, 0)`);
            ctx.beginPath();
            ctx.arc(ghost.x, ghost.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = cGrd;
            ctx.fill();

            raf = requestAnimationFrame(render);
        }

        resize();
        render();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    }, []);

    const reduceMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const coarsePointer = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)')?.matches;
    const narrow = typeof window !== 'undefined' && window.innerWidth <= 900;
    if (reduceMotion || coarsePointer || narrow) return null;

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 1,
                opacity: 0.78,
            }}
        />
    );
};

export default GhostChainVisualizer;
