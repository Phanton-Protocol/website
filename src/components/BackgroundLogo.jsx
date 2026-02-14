import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BackgroundLogo = () => {
    const nodes = useMemo(() => [
        { x: 15, y: 20 },
        { x: 85, y: 15 },
        { x: 75, y: 75 },
        { x: 20, y: 80 },
        { x: 50, y: 50 }, // Center
        { x: 10, y: 45 },
        { x: 90, y: 55 },
        { x: 40, y: 15 },
        { x: 60, y: 85 },
    ], []);

    const connections = [
        [0, 4], [1, 4], [2, 4], [3, 4],
        [0, 5], [3, 5], [1, 6], [2, 6],
        [5, 4], [6, 4], [7, 4], [8, 4]
    ];

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 1 }}>
            {/* Intensified Connection Chains */}
            <svg className="absolute inset-0 w-full h-full">
                {connections.map(([startIdx, endIdx], i) => (
                    <motion.line
                        key={i}
                        x1={`${nodes[startIdx].x}%`}
                        y1={`${nodes[startIdx].y}%`}
                        x2={`${nodes[endIdx].x}%`}
                        y2={`${nodes[endIdx].y}%`}
                        stroke="#00f2ff"
                        strokeWidth="2"
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: [0, 0.5, 0.5, 0],
                            strokeWidth: [1, 3, 1]
                        }}
                        transition={{
                            duration: 4 + Math.random() * 4,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeInOut"
                        }}
                    />
                ))}
                {/* Visual nodes at connection points */}
                {nodes.map((node, i) => (
                    <motion.circle
                        key={i}
                        cx={`${node.x}%`}
                        cy={`${node.y}%`}
                        r="3"
                        fill="#00f2ff"
                        animate={{ r: [2, 5, 2], opacity: [0.3, 0.8, 0.3] }}
                        transition={{ duration: 3 + Math.random() * 2, repeat: Infinity }}
                    />
                ))}
            </svg>

            {/* Ultra-Visible Background Logo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60">
                <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="relative"
                >
                    <svg
                        width="600"
                        height="600"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ filter: 'drop-shadow(0 0 30px rgba(0, 242, 255, 0.8))' }}
                    >
                        <path
                            d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z"
                            stroke="#00f2ff"
                            strokeWidth="1"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path d="M12 8V16" stroke="#00f2ff" strokeWidth="1" strokeLinecap="round" />
                        <path d="M8 12H16" stroke="#00f2ff" strokeWidth="1" strokeLinecap="round" />
                    </svg>

                    {/* Strong Pulse Glow */}
                    <motion.div
                        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full bg-[#00f2ff] blur-[100px]"
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default BackgroundLogo;
