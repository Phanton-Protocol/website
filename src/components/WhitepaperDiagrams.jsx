import React from 'react';
import { motion } from 'framer-motion';

const canAnimateDiagrams = () => {
    if (typeof window === 'undefined') return true;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches;
    const narrow = window.innerWidth <= 900;
    return !(reduceMotion || coarsePointer || narrow);
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

const WhitepaperDiagramFrame = ({ children, ...motionProps }) => (
    <motion.div className="whitepaper-diagram-frame" {...motionProps}>
        {children}
    </motion.div>
);

const SvgBackgroundGrid = () => (
    <>
        <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
    </>
);

const ShadowAddress = ({ x: px, y: py, label = "SHADOW", color = "var(--cyan)", dur = "20s" }) => {
    const x = Number(px), y = Number(py);
    const animated = canAnimateDiagrams();
    return (
        <motion.g variants={itemVariants} style={{ transformOrigin: `${x}px ${y}px` }}>
            <text x={x} y={y - 5} fill="#fff" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" style={{ letterSpacing: '0.05em' }}>{label}</text>
            <text x={x} y={y + 8} fill={color} fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" style={{ letterSpacing: '0.05em' }}>ADDRESS</text>
        </motion.g>
    )
};

const TechBox = ({ x: px, y: py, w: pw, h: ph, title, subtitle, isDashed = false, color = "var(--cyan)" }) => {
    const x = Number(px), y = Number(py), w = Number(pw), h = Number(ph);
    return (
        <motion.g variants={itemVariants}>
            <rect x={x} y={y} width={w} height={h} fill="rgba(0,0,0,0.6)" stroke={isDashed ? color : `rgba(255,255,255,0.15)`} strokeWidth="1.5" strokeDasharray={isDashed ? "4 4" : "none"} rx="4" />
            <rect x={x} y={y} width="4" height={h} fill={color} rx="2" style={{ filter: 'none' }} />
            <text x={x + w / 2} y={subtitle ? y + h / 2 - 4 : y + h / 2 + 4} fill="#fff" fontFamily="var(--font-mono)" fontSize="12" textAnchor="middle">{title}</text>
            {subtitle && <text x={x + w / 2} y={y + h / 2 + 12} fill={color} fontFamily="var(--font-system)" fontSize="10" textAnchor="middle">{subtitle}</text>}
        </motion.g>
    )
};

const UserIcon = ({ x: px, y: py, label, label2, color = "var(--cyan)" }) => {
    const x = Number(px), y = Number(py);
    return (
        <motion.g variants={itemVariants}>
            <text x={x} y={y + 4} fill="#fff" fontFamily="var(--font-mono)" fontSize="11" fontWeight="bold" textAnchor="middle">USER</text>
            <text x={x} y={y + 48} fill="rgba(255,255,255,0.8)" fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle">{label}</text>
            {label2 && <text x={x} y={y + 65} fill={color} fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle">{label2}</text>}
        </motion.g>
    )
};

const CloudAPI = ({ x: px, y: py, label, subtitle, color = "var(--cyan)" }) => {
    const x = Number(px), y = Number(py);
    return (
        <motion.g variants={itemVariants}>
            <path d={`M ${x} ${y + 10} C ${x - 20} ${y + 10}, ${x - 20} ${y - 20}, ${x} ${y - 20} C ${x + 10} ${y - 40}, ${x + 50} ${y - 40}, ${x + 60} ${y - 20} C ${x + 80} ${y - 20}, ${x + 80} ${y + 10}, ${x + 60} ${y + 10} Z`} fill={`${color.replace('1)', '0.1)')}`} stroke={color} strokeWidth="1.5" style={{ filter: 'none' }} />
            <text x={x + 30} y={y - 12} fill="#fff" fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold" textAnchor="middle">{label}</text>
            {subtitle && <text x={x + 30} y={y + 2} fill={color} fontFamily="var(--font-system)" fontSize="10" textAnchor="middle">{subtitle}</text>}
        </motion.g>
    )
};

const Connection = ({ start, points, end, label, labelYOffset = -8, labelX, labelY, style = "solid", color = "var(--cyan)", dur = "3s", delay = 0 }) => {
    const d = `M ${start.x} ${start.y} ${points.map(p => `L ${p.x} ${p.y}`).join(' ')} L ${end.x} ${end.y}`;
    const animated = canAnimateDiagrams();
    return (
        <motion.g variants={itemVariants}>
            <motion.path d={d} fill="none" stroke={color} strokeWidth={style === "dashed" ? "1.5" : "1.5"} strokeDasharray={style === "dashed" ? "4,4" : "0"} initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 0.6 }} viewport={{ once: true }} transition={{ duration: 1.5, delay }} />
            {animated && style === "solid" && (
                <motion.circle r="3" fill="#fff" style={{ filter: 'none' }}>
                    <animateMotion dur={dur} repeatCount="indefinite" path={d} begin={`${delay}s`} />
                </motion.circle>
            )}
            {label && (
                <text
                    x={labelX ?? (Number(start.x) + Number(end.x)) / 2}
                    y={labelY ?? ((Number(start.y) + Number(end.y)) / 2 + Number(labelYOffset))}
                    fill={color}
                    fontFamily="var(--font-system)"
                    fontSize="11"
                    textAnchor="middle"
                    stroke="rgba(5,5,5,0.92)"
                    strokeWidth="4"
                    paintOrder="stroke"
                >
                    {label}
                </text>
            )}
        </motion.g>
    );
};

// Cryptographic Note — diamond shape, represents a user's encrypted commitment
const NoteNode = ({ x: px, y: py, color = "var(--cyan)" }) => {
    const x = Number(px), y = Number(py), s = 28;
    return (
        <motion.g variants={itemVariants}>
            {/* Diamond */}
            <polygon points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`}
                fill={`${color.replace('1)', '0.08)')}`}
                stroke={color} strokeWidth="1.5"
                strokeDasharray="3 3"
                style={{ filter: 'none' }} />
            <text x={x} y={y - 3} fill="#fff" fontFamily="var(--font-mono)" fontSize="10" fontWeight="bold" textAnchor="middle">NOTE</text>
            <text x={x} y={y + 11} fill={color} fontFamily="var(--font-system)" fontSize="9" textAnchor="middle">Encrypted</text>
        </motion.g>
    )
};


export const MasterPhantomDiagram = () => {
    const colors = {
        cyan: "rgba(158, 164, 170, 1)",
        rose: "rgba(244, 63, 94, 1)",
        purple: "rgba(168, 85, 247, 1)",
        yellow: "rgba(234, 179, 8, 1)",
        blue: "rgba(59, 130, 246, 1)",
        green: "rgba(34, 197, 94, 1)"
    };

    // Measured shield geometry: single source of truth for symmetric crest layout.
    const shieldCx = 820;
    const shieldTop = 130;
    const shieldTipY = 796;
    const shieldBasePath = "M 150,20 L 350,20 C 370,20 380,30 380,50 L 380,350 L 250,450 L 120,350 L 120,50 C 120,30 130,20 150,20 Z";
    const shieldOuterTransform = "translate(270 99) scale(2.2 1.55)";
    const shieldInnerTransform = "translate(300 115) scale(2.08 1.47)";

    return (
        <WhitepaperDiagramFrame initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
            <svg width="100%" height="auto" viewBox="0 0 1550 850" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
                <SvgBackgroundGrid />

                {/* Legend */}
                <motion.rect variants={itemVariants} x="20" y="20" width="240" height="90" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.1)" rx="4" />
                <motion.g variants={itemVariants}>
                    <text x="35" y="40" fill="#fff" fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold">LEGEND</text>
                    <path d="M 35 55 L 65 55" stroke="var(--cyan)" strokeWidth="1.5" strokeDasharray="4,4" />
                    <text x="75" y="58" fill="rgba(255,255,255,0.7)" fontFamily="var(--font-system)" fontSize="11">Protected Tracking</text>

                    <path d="M 35 75 L 65 75" stroke={colors.rose} strokeWidth="1.5" />
                    <text x="75" y="78" fill="rgba(255,255,255,0.7)" fontFamily="var(--font-system)" fontSize="11">External / Unshielded</text>

                    <circle cx="50" cy="98" r="8" fill="rgba(0,0,0,0.8)" stroke="rgba(158, 164, 170,0.8)" strokeDasharray="2 2" />
                    <text x="75" y="101" fill="rgba(255,255,255,0.7)" fontFamily="var(--font-system)" fontSize="11">Temporary Note</text>
                </motion.g>

                {/* External Router / Pancakeswap (Top boundary OUTSIDE Phantom Pool) */}
                <motion.g variants={itemVariants}>
                    <rect x="680" y="15" width="350" height="70" fill="rgba(244, 63, 94, 0.05)" stroke={colors.rose} strokeWidth="1" strokeDasharray="4 4" rx="8" />
                    <text x="855" y="33" fill={colors.rose} fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle" letterSpacing="0.1em">EXTERNAL L1/L2</text>
                </motion.g>
                {/* Relayer and Pancakeswap side by side, aligned inside the boundary */}
                <TechBox x="695" y="42" w="90" h="32" title="Relayer" color={colors.blue} />
                <Connection start={{ x: 785, y: 58 }} points={[]} end={{ x: 810, y: 58 }} color={colors.rose} />
                <TechBox x="810" y="42" w="110" h="32" title="Pancakeswap" color={colors.rose} />

                {/* Line from Phantom Pool shield top edge up to the external Relayer */}
                <Connection start={{ x: 770, y: shieldTop + 18 }} points={[{ x: 770, y: 58 }]} end={{ x: 785, y: 58 }} label="Swap Request" labelYOffset={-12} style="dashed" color={colors.blue} />

                {/* PHANTOM POOL SHIELD */}
                <motion.g variants={itemVariants}>
                    {/* Inner glowing dash line */}
                    <path d={shieldBasePath} transform={shieldInnerTransform} fill="none" stroke="rgba(158, 164, 170, 0.4)" strokeWidth="1" strokeDasharray="6 4" />
                    {/* Outer solid panel */}
                    <path d={shieldBasePath} transform={shieldOuterTransform} fill="rgba(158, 164, 170,0.03)" stroke={colors.cyan} strokeWidth="2" style={{ filter: 'none' }} />
                    <text x="820" y="170" fill={colors.cyan} fontFamily="var(--font-editorial)" fontSize="26" textAnchor="middle" letterSpacing="0.1em">PHANTOM POOL</text>
                </motion.g>

                {/* Inside Pool Logic */}
                <TechBox x="620" y="255" w="250" h="62" title="Internal Matching Engine" subtitle="e.g. BNB ↔ USDT (Anonymous)" color={colors.purple} />
                <TechBox x="620" y="375" w="250" h="62" title="Request External Swap" subtitle="Handled privately by Relayer" color={colors.blue} />


                {/* LEFT SIDE INPUTS */}
                <UserIcon x="90" y="290" label="Retail User" label2="+$2 fee" color={colors.cyan} />
                {/* User Note (Retail) */}
                <NoteNode x="90" y="390" color={colors.cyan} />
                {/* User → Note (encrypted) */}
                <Connection start={{ x: 90, y: 320 }} points={[]} end={{ x: 90, y: 362 }} style="dashed" color={colors.cyan} label="" />
                {/* Note → Chainalysis (encrypted payload) */}
                <Connection start={{ x: 118, y: 390 }} points={[]} end={{ x: 180, y: 390 }} style="dashed" label="Encrypted Data" labelX={145} labelY={372} color={colors.cyan} />

                <motion.rect variants={itemVariants} x="40" y="555" width="100" height="60" fill="rgba(0,0,0,0.6)" stroke={colors.yellow} strokeWidth="1.5" rx="4" />
                <motion.rect variants={itemVariants} x="40" y="555" width="4" height="60" fill={colors.yellow} rx="2" style={{ filter: 'none' }} />
                <motion.g variants={itemVariants}>
                    <text x="90" y="580" fill="#fff" fontFamily="var(--font-mono)" fontSize="12" textAnchor="middle">Company</text>
                    <text x="90" y="598" fill={colors.yellow} fontFamily="var(--font-system)" fontSize="10" textAnchor="middle">(Payroll / B2B)</text>
                </motion.g>
                {/* Company Note */}
                <NoteNode x="90" y="660" color={colors.yellow} />
                {/* Company → Note (encrypted) */}
                <Connection start={{ x: 90, y: 615 }} points={[]} end={{ x: 90, y: 632 }} style="dashed" color={colors.yellow} label="" />
                {/* Note → Chainalysis (encrypted payload) */}
                <Connection start={{ x: 118, y: 660 }} points={[]} end={{ x: 180, y: 660 }} style="dashed" label="Encrypted Data" labelX={145} labelY={642} color={colors.yellow} />

                {/* Chainalysis APIs (Screening) - adjusted Y to align with notes */}
                <CloudAPI x="200" y="390" label="Chainalysis" subtitle="API Screening" color={colors.rose} />
                <CloudAPI x="200" y="660" label="Chainalysis" subtitle="API Screening" color={colors.rose} />

                {/* Pass -> Shadow Addresses */}
                <ShadowAddress x="370" y="390" color={colors.cyan} />
                <ShadowAddress x="370" y="660" color={colors.yellow} />

                {/* Shadow -> Relayer */}
                <TechBox x="450" y="370" w="80" h="40" title="Relayer" color={colors.cyan} />
                <TechBox x="450" y="640" w="80" h="40" title="Relayer" color={colors.yellow} />

                {/* Connections (Inputs -> Pool) */}
                <Connection start={{ x: 260, y: 390 }} points={[]} end={{ x: 335, y: 390 }} label="Pass" labelX={300} labelY={372} color={colors.green} />
                <Connection start={{ x: 230, y: 435 }} points={[{ x: 230, y: 470 }, { x: 90, y: 470 }]} end={{ x: 90, y: 425 }} label="Fail -> Returns Funds" labelX={170} labelY={452} color={colors.rose} dur="4s" />
                <Connection start={{ x: 405, y: 390 }} points={[]} end={{ x: 450, y: 390 }} color={colors.cyan} />
                <Connection start={{ x: 530, y: 390 }} points={[]} end={{ x: 520, y: 390 }} color={colors.cyan} />

                <Connection start={{ x: 260, y: 660 }} points={[]} end={{ x: 335, y: 660 }} label="Pass" labelX={300} labelY={642} color={colors.green} />
                <Connection start={{ x: 230, y: 705 }} points={[{ x: 230, y: 740 }, { x: 90, y: 740 }]} end={{ x: 90, y: 700 }} label="Fail -> Break" labelX={165} labelY={724} color={colors.rose} dur="4s" />
                <Connection start={{ x: 405, y: 660 }} points={[]} end={{ x: 450, y: 660 }} color={colors.yellow} />
                <Connection start={{ x: 530, y: 660 }} points={[]} end={{ x: 520, y: 660 }} color={colors.yellow} />




                {/* Pool → Note return: encrypted updated note data flows back from pool to user/company */}
                <Connection start={{ x: 520, y: 415 }} points={[{ x: 90, y: 415 }]} end={{ x: 90, y: 418 }} style="dashed" label="↩ Encrypted Note" labelX={305} labelY={442} color={colors.cyan} dur="4s" delay={0.5} />
                <Connection start={{ x: 520, y: 685 }} points={[{ x: 90, y: 685 }]} end={{ x: 90, y: 688 }} style="dashed" label="↩ Encrypted Note" labelX={305} labelY={712} color={colors.yellow} dur="4s" delay={0.8} />


                <TechBox x="930" y="260" w="150" h="54" title="Withdraw Req." subtitle="User A" color={colors.green} />
                <TechBox x="930" y="410" w="150" h="54" title="Withdraw Req." subtitle="Company Vendor" color={colors.yellow} />
                <TechBox x="930" y="560" w="150" h="54" title="Withdraw Req." subtitle="User B" color={colors.cyan} />

                {/* Admin Approval Gate — Company Vendor only */}
                <Connection start={{ x: 1080, y: 437 }} points={[]} end={{ x: 1090, y: 437 }} style="dashed" color={colors.yellow} />
                <motion.g variants={itemVariants}>
                    <polygon points="1090,411 1126,411 1140,425 1140,455 1126,469 1090,469 1076,455 1076,425" fill="rgba(234,179,8,0.1)" stroke={colors.yellow} strokeWidth="1.5" style={{ filter: 'none' }} />
                    <text x="1108" y="437" fill="#fff" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle" fontWeight="bold">ADMIN</text>
                    <text x="1108" y="453" fill={colors.yellow} fontFamily="var(--font-system)" fontSize="9" textAnchor="middle">APPROVAL</text>
                </motion.g>
                <Connection start={{ x: 1140, y: 437 }} points={[]} end={{ x: 1148, y: 437 }} color={colors.yellow} />



                {/* Pool bounds at 1120. Shadow addresses strictly outside to sever link */}
                <Connection start={{ x: 1080, y: 287 }} points={[]} end={{ x: 1140, y: 287 }} color={colors.green} />
                {/* Company vendor path now routes through Admin Approval gate above, not a direct connection */}
                <Connection start={{ x: 1080, y: 587 }} points={[]} end={{ x: 1140, y: 587 }} color={colors.cyan} />

                <ShadowAddress x="1175" y="287" label="1-TIME SA" color={colors.green} dur="10s" />
                <ShadowAddress x="1175" y="437" label="1-TIME SA" color={colors.yellow} dur="12s" />
                <ShadowAddress x="1175" y="587" label="1-TIME SA" color={colors.cyan} dur="14s" />

                {/* Independent Relayers */}
                <Connection start={{ x: 1210, y: 287 }} points={[]} end={{ x: 1250, y: 287 }} color={colors.green} />
                <Connection start={{ x: 1210, y: 437 }} points={[]} end={{ x: 1250, y: 437 }} color={colors.yellow} />
                <Connection start={{ x: 1210, y: 587 }} points={[]} end={{ x: 1250, y: 587 }} color={colors.cyan} />

                <TechBox x="1250" y="267" w="80" h="40" title="Relayer" color={colors.green} />
                <TechBox x="1250" y="417" w="80" h="40" title="Relayer" color={colors.yellow} />
                <TechBox x="1250" y="567" w="80" h="40" title="Relayer" color={colors.cyan} />

                {/* Independent Wallet Off-ramps */}
                <Connection start={{ x: 1330, y: 287 }} points={[]} end={{ x: 1370, y: 287 }} label="Private" color={colors.green} />
                <Connection start={{ x: 1330, y: 437 }} points={[]} end={{ x: 1370, y: 437 }} label="Private" color={colors.yellow} />
                <Connection start={{ x: 1330, y: 587 }} points={[]} end={{ x: 1370, y: 587 }} label="Private" color={colors.cyan} />

                <TechBox x="1370" y="267" w="130" h="40" title="User Wallet A" color={colors.green} />
                <TechBox x="1370" y="417" w="130" h="40" title="Company Vendor" color={colors.yellow} />
                <TechBox x="1370" y="567" w="130" h="40" title="User Wallet B" color={colors.cyan} />

            </svg>
        </WhitepaperDiagramFrame>
    );
};

export const CommitmentFormulaDiagram = () => (
    <WhitepaperDiagramFrame initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
        <svg width="100%" height="auto" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <SvgBackgroundGrid />
            <motion.g variants={itemVariants}>
                <text x="30" y="40" fill="rgba(255,255,255,0.3)" fontFamily="var(--font-mono)" fontSize="12" letterSpacing="0.2em">FORMULA_EXEC :: COMMITMENT DERIVATION</text>
            </motion.g>

            <TechBox x="50" y="80" w="140" h="60" title="assetId" subtitle="Token mapping" />
            <TechBox x="200" y="80" w="140" h="60" title="v" subtitle="Amount" />
            <TechBox x="350" y="80" w="140" h="60" title="ρ" subtitle="Entropy" />
            <TechBox x="500" y="80" w="140" h="60" title="owner" subtitle="Public keys" />

            <TechBox x="250" y="190" w="190" h="70" title="H( ... )" subtitle="MiMC / Poseidon Cryptographic Hash" />

            <TechBox x="700" y="130" w="220" h="90" title="cm (Commitment)" subtitle="Bytes32 Payload stored On-Chain" />

            <Connection start={{ x: 120, y: 140 }} points={[{ x: 120, y: 160 }, { x: 345, y: 160 }]} end={{ x: 345, y: 190 }} />
            <Connection start={{ x: 270, y: 140 }} points={[{ x: 270, y: 160 }, { x: 345, y: 160 }]} end={{ x: 345, y: 190 }} delay={0.2} />
            <Connection start={{ x: 420, y: 140 }} points={[{ x: 420, y: 160 }, { x: 345, y: 160 }]} end={{ x: 345, y: 190 }} delay={0.4} />
            <Connection start={{ x: 570, y: 140 }} points={[{ x: 570, y: 160 }, { x: 345, y: 160 }]} end={{ x: 345, y: 190 }} delay={0.6} />

            <Connection
                start={{ x: 440, y: 225 }}
                points={[{ x: 600, y: 225 }, { x: 600, y: 175 }]}
                end={{ x: 700, y: 175 }}
                label="Derivation Mapping"
                labelX={520}
                labelY={205}
                delay={1}
            />
        </svg>
    </WhitepaperDiagramFrame>
);

export const NullifierFormulaDiagram = () => (
    <WhitepaperDiagramFrame initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
        <svg width="100%" height="auto" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
            <SvgBackgroundGrid />
            <motion.g variants={itemVariants}>
                <text x="30" y="40" fill="rgba(255,255,255,0.3)" fontFamily="var(--font-mono)" fontSize="12" letterSpacing="0.2em">FORMULA_EXEC :: NULLIFIER GENERATION</text>
            </motion.g>

            <TechBox x="50" y="80" w="180" h="70" title="sk_nf (Secret)" subtitle="User Spending Key" />
            <TechBox x="250" y="80" w="180" h="70" title="ρ (Entropy)" subtitle="Note randomness linking to cm" />
            <TechBox x="450" y="80" w="180" h="70" title="domain" subtitle="Context separator (e.g. chain_id)" />

            <TechBox x="260" y="200" w="160" h="70" title="PRF( ... )" subtitle="Pseudo-random Fn Eval" />

            <TechBox x="720" y="140" w="220" h="90" title="nf (Nullifier)" subtitle="Prevents double spends in Shielded Pool" />

            <Connection start={{ x: 140, y: 150 }} points={[{ x: 140, y: 175 }, { x: 340, y: 175 }]} end={{ x: 340, y: 200 }} />
            <Connection start={{ x: 340, y: 150 }} points={[{ x: 340, y: 175 }]} end={{ x: 340, y: 200 }} delay={0.2} />
            <Connection start={{ x: 540, y: 150 }} points={[{ x: 540, y: 175 }, { x: 340, y: 175 }]} end={{ x: 340, y: 200 }} delay={0.4} />

            <Connection
                start={{ x: 420, y: 235 }}
                points={[{ x: 600, y: 235 }, { x: 600, y: 185 }]}
                end={{ x: 720, y: 185 }}
                label="evaluate_prf"
                labelX={545}
                labelY={215}
                delay={0.8}
            />
        </svg>
    </WhitepaperDiagramFrame>
);

const BankNode = ({ x: px, y: py, label, color = "var(--cyan)", active = false }) => {
    const x = Number(px), y = Number(py), s = 24;
    const animated = canAnimateDiagrams();
    return (
        <motion.g variants={itemVariants}>
            {active && (
                <circle cx={x} cy={y} r={s + 12} fill="none" stroke={color} strokeWidth="1.5" strokeDasharray="2 4" opacity="0.8">
                    {animated && <animateTransform attributeName="transform" type="rotate" from={`0 ${x} ${y}`} to={`360 ${x} ${y}`} dur="5s" repeatCount="indefinite" />}
                </circle>
            )}
            <polygon points={`${x},${y-s} ${x+s-4},${y-s/2} ${x+s-4},${y+s/2} ${x},${y+s} ${x-s+4},${y+s/2} ${x-s+4},${y-s/2}`} fill={`${color.replace('1)', '0.05)')}`} stroke={color} strokeWidth="1.5" style={{ filter: 'none' }} />
            <circle cx={x} cy={y} r={s - 8} fill="none" stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.4">
                {animated && <animateTransform attributeName="transform" type="rotate" from={`360 ${x} ${y}`} to={`0 ${x} ${y}`} dur="10s" repeatCount="indefinite" />}
            </circle>
            <text x={x} y={y + 5} fill="#fff" fontFamily="var(--font-mono)" fontSize="14" fontWeight="bold" textAnchor="middle">{label}</text>
        </motion.g>
    )
};

export const PhantomBankSystemDiagram = () => {
    const animated = canAnimateDiagrams();
    const colors = {
        cyan: "rgba(158, 164, 170, 1)",
        rose: "rgba(244, 63, 94, 1)",
        purple: "rgba(168, 85, 247, 1)",
        yellow: "rgba(234, 179, 8, 1)",
        blue: "rgba(59, 130, 246, 1)",
        green: "rgba(34, 197, 94, 1)",
        white: "rgba(255, 255, 255, 0.9)"
    };

    return (
        <WhitepaperDiagramFrame initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
            <svg width="100%" height="auto" viewBox="0 0 1550 850" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
                <SvgBackgroundGrid />

                <motion.g variants={itemVariants}>
                    <rect x="50" y="30" width="200" height="50" fill="rgba(158, 164, 170, 0.05)" stroke={colors.cyan} strokeWidth="1" strokeDasharray="4 4" rx="8" />
                    <text x="150" y="60" fill={colors.cyan} fontFamily="var(--font-mono)" fontSize="18" textAnchor="middle" letterSpacing="0.1em">★ ON-CHAIN ★</text>
                </motion.g>

                <UserIcon x="250" y="150" label="Client" color={colors.cyan} />
                
                <Connection start={{ x: 250, y: 180 }} points={[]} end={{ x: 250, y: 220 }} color={colors.cyan} />
                
                <TechBox x="100" y="220" w="300" h="64" title="User Wallet = User Account Number" subtitle="Mapped Securely via CREATE2 Contract" color={colors.cyan} />

                <Connection start={{ x: 250, y: 280 }} points={[]} end={{ x: 250, y: 380 }} style="dashed" label="Transaction" labelX={292} labelY={330} color={colors.cyan} />

                <CloudAPI x="250" y="400" label="Chainalysis" subtitle="AML/KYC Screening" color={colors.rose} />

                <Connection start={{ x: 190, y: 400 }} points={[{ x: 100, y: 400 }]} end={{ x: 100, y: 450 }} color={colors.rose} label="Not Clean -> Stop" labelX={152} labelY={385} dur="4s" />
                <motion.g variants={itemVariants}>
                    <text x="100" y="470" fill={colors.rose} fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold" textAnchor="middle">PROCEDURE STOP</text>
                </motion.g>

                <Connection start={{ x: 250, y: 420 }} points={[]} end={{ x: 250, y: 520 }} color={colors.green} label="✓ Clean" labelX={286} labelY={468} />

                <motion.g variants={itemVariants}>
                    <rect x="100" y="520" width="400" height="280" fill="rgba(59, 130, 246, 0.03)" stroke={colors.blue} strokeWidth="2" strokeDasharray="10 5" rx="12" style={{ filter: 'none' }} />
                    <rect x="104" y="524" width="392" height="272" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1" rx="8" />
                    <text x="300" y="555" fill={colors.blue} fontFamily="var(--font-editorial)" fontSize="24" textAnchor="middle" letterSpacing="0.1em">BANK 1 POOL</text>
                    <text x="300" y="578" fill="rgba(255,255,255,0.6)" fontFamily="var(--font-system)" fontSize="12" textAnchor="middle">Every user has their different encrypted node</text>
                    <circle cx="300" cy="680" r="30" fill="rgba(59, 130, 246, 0.1)" stroke={colors.blue} strokeWidth="1" strokeDasharray="3 3">
                        {animated && <animateTransform attributeName="transform" type="rotate" from="0 300 680" to="360 300 680" dur="20s" repeatCount="indefinite" />}
                    </circle>
                    <circle cx="300" cy="680" r="15" fill={colors.blue} style={{ filter: 'none' }} />
                    <text x="300" y="684" fill="#fff" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle">ROOT</text>
                    <path d="M300 680 L180 620 M300 680 L300 595 M300 680 L420 620 M300 680 L180 740 M300 680 L300 765 M300 680 L420 740" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
                </motion.g>

                <BankNode x="180" y="620" label="1" color={colors.blue} />
                <BankNode x="300" y="612" label="2" color={colors.blue} />
                <BankNode x="420" y="620" label="3" color={colors.blue} />
                <BankNode x="180" y="740" label="4" color={colors.blue} />
                <BankNode x="300" y="765" label="5" color={colors.blue} />
                <BankNode x="420" y="740" label="6" color={colors.cyan} active={true} />

                <motion.g variants={itemVariants}>
                    <rect x="650" y="520" width="300" height="280" fill="rgba(34, 197, 94, 0.03)" stroke={colors.green} strokeWidth="2" strokeDasharray="10 5" rx="12" style={{ filter: 'none' }} />
                    <rect x="654" y="524" width="292" height="272" fill="none" stroke="rgba(34, 197, 94, 0.1)" strokeWidth="1" rx="8" />
                    <text x="800" y="555" fill={colors.green} fontFamily="var(--font-editorial)" fontSize="24" textAnchor="middle" letterSpacing="0.1em">BANK 2</text>
                    <path d="M800 620 L730 730 L870 730 Z" fill="rgba(34, 197, 94, 0.05)" stroke="rgba(34, 197, 94, 0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
                </motion.g>

                <BankNode x="800" y="620" label="A" color={colors.green} />
                 <BankNode x="730" y="730" label="B" color={colors.green} />
                 <BankNode x="870" y="730" label="C" color={colors.green} />

                <Connection start={{ x: 500, y: 680 }} points={[]} end={{ x: 650, y: 680 }} style="dashed" label="Inter-bank transfer" labelX={575} labelY={710} color={colors.white} />

                <motion.g variants={itemVariants}>
                    <rect x="750" y="100" width="350" height="150" fill="rgba(168, 85, 247, 0.05)" stroke={colors.purple} strokeWidth="2" rx="12" style={{ filter: 'none' }} />
                    <text x="925" y="160" fill={colors.purple} fontFamily="var(--font-editorial)" fontSize="28" textAnchor="middle" letterSpacing="0.1em">STATE BANK</text>
                    <text x="925" y="190" fill="rgba(255,255,255,0.7)" fontFamily="var(--font-system)" fontSize="14" textAnchor="middle">Global Auditing & Regulations</text>
                    <rect x="865" y="210" width="120" height="20" fill="rgba(255,255,255,0.1)" rx="10" />
                    <text x="925" y="224" fill="#fff" fontFamily="var(--font-mono)" fontSize="10" textAnchor="middle">ENCRYPTED VAULT</text>
                </motion.g>

                <Connection start={{ x: 450, y: 520 }} points={[{ x: 450, y: 300 }, { x: 750, y: 300 }]} end={{ x: 750, y: 220 }} style="dashed" label="Encrypted Data Reporting" labelX={600} labelY={286} color={colors.cyan} dur="5s" />
                
                <Connection start={{ x: 860, y: 520 }} points={[]} end={{ x: 860, y: 250 }} style="dashed" label="Encrypted Data Reporting" labelX={960} labelY={350} color={colors.green} dur="5s" delay={1} />


                <motion.g variants={itemVariants}>
                    <rect x="1150" y="400" width="350" height="120" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)" rx="8" />
                    <text x="1180" y="440" fill="#fff" fontFamily="var(--font-system)" fontSize="18" fontWeight="300" width="310">
                        <tspan x="1180" dy="0">User can Accept & Receive</tspan>
                        <tspan x="1180" dy="30">Crypto Directly on Bank</tspan>
                        <tspan x="1180" dy="30" fill={colors.cyan} fontWeight="bold">without 3rd Party.</tspan>
                    </text>
                    
                    <rect x="1150" y="550" width="350" height="120" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.1)" rx="8" />
                    <text x="1180" y="590" fill="#fff" fontFamily="var(--font-system)" fontSize="18" fontWeight="300">
                        <tspan x="1180" dy="0">Banks Can Verify Crypto</tspan>
                        <tspan x="1180" dy="30">transactions Through</tspan>
                        <tspan x="1180" dy="30" fill={colors.purple} fontWeight="bold">encrypted nodes if needed.</tspan>
                    </text>

                </motion.g>

            </svg>
        </WhitepaperDiagramFrame>
    );
};

export const RelayerSystemDiagram = () => {
    const colors = {
        cyan: "rgba(158, 164, 170, 1)",
        rose: "rgba(244, 63, 94, 1)",
        purple: "rgba(168, 85, 247, 1)",
        yellow: "rgba(234, 179, 8, 1)",
        blue: "rgba(59, 130, 246, 1)",
        green: "rgba(34, 197, 94, 1)",
        white: "rgba(255, 255, 255, 0.9)"
    };

    return (
        <WhitepaperDiagramFrame initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }}>
            <svg width="100%" height="auto" viewBox="0 0 1400 850" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
                <SvgBackgroundGrid />

                <motion.g variants={itemVariants}>
                    <rect x="50" y="30" width="300" height="50" fill="rgba(168, 85, 247, 0.05)" stroke={colors.purple} strokeWidth="1" strokeDasharray="4 4" rx="8" />
                    <text x="200" y="60" fill={colors.purple} fontFamily="var(--font-mono)" fontSize="18" textAnchor="middle" letterSpacing="0.1em">★ RELAYER NETWORK ★</text>
                </motion.g>

                <UserIcon x="150" y="150" label="Client" color={colors.cyan} />
                
                {/* Vertical flow to CA */}
                <Connection start={{ x: 150, y: 180 }} points={[]} end={{ x: 150, y: 250 }} color={colors.cyan} label="Payment Request" labelYOffset={-10} />

                <CloudAPI x="150" y="270" label="Chainalysis" subtitle="Screening" color={colors.rose} />

                <Connection start={{ x: 90, y: 270 }} points={[{ x: 40, y: 270 }]} end={{ x: 40, y: 350 }} color={colors.rose} label="Not Clean" labelYOffset={-10} />
                <motion.g variants={itemVariants}>
                    <text x="40" y="370" fill={colors.rose} fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold" textAnchor="middle">STOP</text>
                </motion.g>

                <Connection start={{ x: 150, y: 290 }} points={[]} end={{ x: 150, y: 400 }} color={colors.green} label="✓ Clean" labelYOffset={0} />

                <TechBox x="50" y="400" w="200" h="64" title="Shadow Address" subtitle="Transient Path" color={colors.green} />

                {/* Clean orthogonal flow from Shadow to Relayers bypassing Pool */}
                <Connection start={{ x: 250, y: 430 }} points={[{ x: 280, y: 430 }, { x: 280, y: 200 }, { x: 900, y: 200 }]} end={{ x: 900, y: 250 }} color={colors.yellow} label="Encrypted Interception Data" labelX={590} labelY={190} style="dashed" dur="6s" />

                <Connection start={{ x: 250, y: 430 }} points={[]} end={{ x: 350, y: 430 }} color={colors.cyan} style="dashed" dur="3s" />

                <motion.g variants={itemVariants}>
                    <rect x="350" y="350" width="250" height="160" fill="rgba(59, 130, 246, 0.05)" stroke={colors.blue} strokeWidth="2" rx="12" style={{ filter: 'none' }} />
                    <text x="475" y="420" fill={colors.blue} fontFamily="var(--font-editorial)" fontSize="24" textAnchor="middle" letterSpacing="0.1em">PHANTOM POOL</text>
                </motion.g>

                <Connection start={{ x: 600, y: 390 }} points={[]} end={{ x: 800, y: 390 }} color={colors.yellow} style="dashed" label="Transaction Encrypted Data" labelYOffset={-10} dur="4s" />
                <Connection start={{ x: 600, y: 470 }} points={[]} end={{ x: 800, y: 470 }} color={colors.yellow} style="dashed" label="Verify ZK Proofs" labelYOffset={-10} dur="4s" />

                <motion.g variants={itemVariants}>
                    <rect x="800" y="250" width="400" height="350" fill="rgba(234, 179, 8, 0.05)" stroke={colors.yellow} strokeWidth="2" strokeDasharray="10 5" rx="12" style={{ filter: 'none' }} />
                    <text x="1000" y="300" fill={colors.yellow} fontFamily="var(--font-editorial)" fontSize="28" textAnchor="middle" letterSpacing="0.1em">RELAYER NETWORK</text>
                    <text x="1000" y="325" fill="rgba(255,255,255,0.7)" fontFamily="var(--font-system)" fontSize="14" textAnchor="middle">Validation & Gas Abstraction</text>

                    <text x="1000" y="365" fill={colors.cyan} fontFamily="var(--font-mono)" fontSize="14" textAnchor="middle">REQUEST TYPES CHECKED:</text>
                    
                    <path d="M800 390 L820 390 L820 410 L840 410" fill="none" stroke={colors.yellow} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                    <path d="M800 390 L820 390 L820 410 L920 410" fill="none" stroke={colors.yellow} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                    <path d="M800 390 L820 390 L820 410 L990 410" fill="none" stroke={colors.yellow} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
                    <path d="M800 390 L820 390 L820 410 L1080 410" fill="none" stroke={colors.yellow} strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />

                    <rect x="840" y="395" width="70" height="30" fill="rgba(0,0,0,0.5)" stroke="rgba(158, 164, 170,0.4)" rx="4" />
                    <text x="875" y="414" fill="#fff" fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle">Deposit</text>

                    <rect x="920" y="395" width="60" height="30" fill="rgba(0,0,0,0.5)" stroke="rgba(158, 164, 170,0.4)" rx="4" />
                    <text x="950" y="414" fill="#fff" fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle">Swap</text>

                    <rect x="990" y="395" width="80" height="30" fill="rgba(0,0,0,0.5)" stroke="rgba(158, 164, 170,0.4)" rx="4" />
                    <text x="1030" y="414" fill="#fff" fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle">Int. Match</text>

                    <rect x="1080" y="395" width="70" height="30" fill="rgba(0,0,0,0.5)" stroke="rgba(158, 164, 170,0.4)" rx="4" />
                    <text x="1115" y="414" fill="#fff" fontFamily="var(--font-mono)" fontSize="11" textAnchor="middle">Withdraw</text>
                    
                    <rect x="850" y="470" width="300" height="40" fill="rgba(0,0,0,0.5)" stroke="rgba(255,255,255,0.1)" rx="8" />
                    <text x="1000" y="495" fill={colors.green} fontFamily="var(--font-mono)" fontSize="14" textAnchor="middle" fontWeight="bold">✓ APPROVE / OP_REJECT</text>
                </motion.g>

                <Connection start={{ x: 800, y: 560 }} points={[{ x: 700, y: 560 }]} end={{ x: 700, y: 680 }} color={colors.white} label="Relayers Pay Native Gas Fees" labelYOffset={-10} dur="3s" />
                
                <TechBox x="600" y="680" w="200" h="64" title="Blockchain Network" subtitle="Execution (Gas Covered)" color={colors.white} />

                <Connection start={{ x: 475, y: 510 }} points={[{ x: 475, y: 620 }, { x: 1000, y: 620 }]} end={{ x: 1000, y: 600 }} color={colors.cyan} label="Phantom Refunds Gas Deducted From Pool" labelYOffset={15} dur="5s" style="dashed" />

            </svg>
        </WhitepaperDiagramFrame>
    );
};
