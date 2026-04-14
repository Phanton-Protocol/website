export const blogPosts = [
  {
    slug: 'what-is-phantom-protocol',
    title: 'What is Phantom Protocol? A plain-English guide',
    excerpt: 'A simple breakdown of shielded pools, notes, relayers, and what privacy actually means in practice.',
    date: 'APR 07, 2026',
    readTime: '6 min read',
    category: 'ANNOUNCEMENT',
    description: 'Understand Phantom Protocol in plain language: shielded notes, relayers, and privacy boundaries explained for builders and operators.',
    intro: 'Most blockchain tools are transparent by default. That is great for auditability, but it can be painful for teams and traders who do not want every movement exposed in real time. Phantom Protocol is designed to solve that tension: keep public settlement, but reduce unnecessary data exposure.',
    sections: [
      {
        heading: 'The short version',
        body: 'Phantom uses a shielded pool model. You deposit funds into the pool, receive private notes, and later spend those notes with zero-knowledge proofs. On-chain observers can verify correctness without seeing your full balance history.',
      },
      {
        heading: 'What is hidden and what stays public',
        body: 'Inside the pool, note relationships are hidden behind commitments and nullifiers. At the protocol edges, some things are still public by design: deposits are public funding events, and withdrawals expose recipient and amount when assets leave privacy space.',
      },
      {
        heading: 'Where relayers fit in',
        body: 'Relayers submit transactions so users do not have to broadcast directly from the same wallet identity every time. This improves operational privacy and UX, and with multi-relayer failover, improves service continuity when one endpoint is unavailable.',
      },
    ],
  },
  {
    slug: 'private-defi-for-teams',
    title: 'Private DeFi for teams: treasury, payroll, and execution',
    excerpt: 'How teams can move from fully public on-chain operations to controlled confidentiality without losing settlement.',
    date: 'APR 07, 2026',
    readTime: '7 min read',
    category: 'PRODUCT',
    description: 'How teams can run treasury and payroll operations with stronger confidentiality while keeping on-chain settlement and controls.',
    intro: 'Teams that operate on-chain quickly run into a real problem: everyone can see balances, transfer timing, and counterparties. That can leak negotiation power, salary information, and strategy. Private DeFi infrastructure helps teams keep operations sane while still settling on-chain.',
    sections: [
      {
        heading: 'Treasury operations without broadcasting every move',
        body: 'With shielded note transitions, treasury managers can rebalance and route liquidity without exposing every internal step to external observers. This can reduce signaling risk during large or sensitive moves.',
      },
      {
        heading: 'Payroll workflows with practical privacy boundaries',
        body: 'Payroll-style flows can be orchestrated as batches of standard withdrawals. Internally, note history can remain private; externally, final payouts remain verifiable. This gives a better balance between confidentiality and accounting requirements.',
      },
      {
        heading: 'Operational controls still matter',
        body: 'Privacy does not replace governance. Teams still need approval workflows, key management, rate limits, and policy checks. The strongest setups combine cryptography with disciplined operational controls and monitoring.',
      },
    ],
  },
  {
    slug: 'relayer-failover-explained',
    title: 'Relayer failover explained: what happens when one relayer goes down',
    excerpt: 'A practical explanation of automatic relayer fallback and why it matters for uptime and operations.',
    date: 'APR 07, 2026',
    readTime: '5 min read',
    category: 'USE CASE',
    description: 'How automatic relayer failover works in Phantom Protocol frontend flows and why it improves reliability.',
    intro: 'A single relayer is a single point of operational failure. If that relayer is down, users cannot submit transactions through it. The right answer is failover: attempt primary relayer first, then automatically retry on healthy secondary relayers.',
    sections: [
      {
        heading: 'What failover does',
        body: 'When a request fails due to network issues or retriable server errors, the client can automatically try the next configured relayer endpoint. Users do not need to manually switch URLs every time.',
      },
      {
        heading: 'What failover does not do',
        body: 'Failover does not change cryptographic validity rules. Proofs still need to verify, and non-retriable errors like invalid input should fail fast. The goal is reliability, not bypassing protocol checks.',
      },
      {
        heading: 'Best practice in production',
        body: 'Run at least two relayer backends in separate infrastructure zones, monitor health continuously, and keep endpoint rotation simple for clients. Reliability is a protocol-adjacent product feature users feel immediately.',
      },
    ],
  },
];
