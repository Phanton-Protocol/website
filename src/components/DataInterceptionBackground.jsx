import React, { useEffect, useRef } from 'react';

const HEX_CHARS = '0123456789ABCDEF';

class Particle {
    constructor({ canvas, ctx }) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.init();
    }

    init() {
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;
        this.speed = 0.5 + Math.random() * 1.5;
        this.size = 10 + Math.random() * 10;
        this.text = Array.from({ length: 4 }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('');
        this.opacity = Math.random() * 0.2 + 0.05;
        this.isBroken = false;
        this.brokenTimer = 0;
    }

    update() {
        this.x += this.speed;
        if (this.x > this.canvas.width) this.x = -50;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const distance = Math.sqrt((this.x - centerX) ** 2 + (this.y - centerY) ** 2);

        if (distance < 200) {
            if (!this.isBroken) {
                this.isBroken = true;
                this.brokenTimer = 30;
            }
        } else {
            this.isBroken = false;
        }

        if (this.isBroken) {
            if (Math.random() > 0.8) {
                this.text = Array.from({ length: 4 }, () => HEX_CHARS[Math.floor(Math.random() * 16)]).join('');
            }
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.font = `${this.size}px JetBrains Mono`;

        if (this.isBroken) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
            const offsetX = (Math.random() - 0.5) * 10;
            const offsetY = (Math.random() - 0.5) * 10;
            ctx.fillText(this.text, this.x + offsetX, this.y + offsetY);

            ctx.fillStyle = `rgba(0, 229, 255, ${this.opacity * 0.2})`;
            ctx.fillText(this.text, this.x - offsetX, this.y - offsetY);
        } else {
            ctx.fillStyle = `rgba(0, 229, 255, ${this.opacity})`;
            ctx.fillText(this.text, this.x, this.y);
        }
    }
}

const DataInterceptionBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // Particle System Configuration
        const particles = [];
        const particleCount = 40;

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle({ canvas, ctx }));
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw detection zone (subtle circle)
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, 200, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
            ctx.setLineDash([10, 20]);
            ctx.stroke();
            ctx.setLineDash([]);

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: 0.12,
                mixBlendMode: 'screen',
            }}
        />
    );
};

export default DataInterceptionBackground;
