export const SITE_ORIGIN = 'https://phantomproto.com'

export const PRERENDER_STATIC_ROUTES = [
  {
    path: '/',
    title: 'Phantom Protocol | Compliant Privacy Infrastructure for Global Finance',
    description:
      'Phantom Protocol delivers Confidentiality as a Service (CaaS) using FHE + ZK-SNARKs. Private trading, encrypted enterprise payroll, and institutional shadow ledger for banks. Privacy by Proof. Invisible by Design.',
  },
  {
    path: '/trade',
    title: 'Phantom Trade Console | Shielded Deposit, Swap, Withdraw',
    description:
      'Use the Phantom trade console for shielded deposits, private swaps, and withdrawals on BNB Chain.',
  },
  {
    path: '/e-paper',
    title: 'Phantom Protocol E-Paper | Phantom Protocol',
    description:
      'Phantom Protocol specifies a shielded pool with commitments, nullifiers, Merkle membership, and Groth16-verified join-split transitions.',
  },
  {
    path: '/relayer',
    title: 'Become a Phantom Relayer | Staking and Node Participation',
    description:
      'Stake protocol tokens, run a relayer node, and claim distributed rewards in the Phantom relayer network.',
  },
  {
    path: '/enterprise',
    title: 'Phantom Enterprise Suite | Payroll, Compliance, Governance',
    description:
      'Enterprise-facing flows for private payroll, compliance-ready reporting, and governance operations in Phantom Protocol.',
  },
  {
    path: '/enterprise/payroll',
    title: 'Phantom Enterprise Payroll | Batch payouts and approvals',
    description:
      'Create, approve, and execute payroll runs against the Phantom enterprise API with idempotency and audit-friendly workflows.',
  },
  {
    path: '/enterprise/compliance',
    title: 'Phantom Enterprise Compliance | Screening and reporting keys',
    description:
      'Compliance demos: wallet screening decisions, tax reporting keys, and structured audit exports for enterprise operators.',
  },
  {
    path: '/enterprise/governance',
    title: 'Phantom Enterprise Governance | Proposals and votes',
    description:
      'Governance workspace for proposals, votes, and protocol parameter discussions in the Phantom enterprise suite.',
  },
  {
    path: '/enterprise/audit',
    title: 'Phantom Enterprise Audit | Event stream and controls',
    description:
      'Review enterprise audit events and operational controls surfaced by the Phantom relayer dashboard.',
  },
  {
    path: '/phantom-protocol',
    title: 'What is Phantom Protocol? | Private DeFi Layer',
    description:
      'Learn how Phantom Protocol works: shielded notes, relayers, and private execution with compliance-ready reporting controls.',
  },
  {
    path: '/private-defi',
    title: 'Private DeFi Infrastructure | Phantom Protocol',
    description:
      'Private DeFi infrastructure for institutions, teams, and power users. Execute shielded pool operations while preserving operational confidentiality.',
  },
  {
    path: '/shielded-pool-bnb',
    title: 'Shielded Pool on BNB Chain | Phantom Protocol',
    description:
      'Explore Phantom Protocol shielded pool design on BNB Chain, including deposit, swap, and withdrawal lifecycle with private notes.',
  },
  {
    path: '/blog',
    title: 'Phantom Protocol Blog | Private DeFi Explained',
    description:
      'Human-friendly articles on Phantom Protocol, private DeFi architecture, relayers, shielded pools, and enterprise use cases.',
  },
  {
    path: '/privacy-visibility',
    title: 'Privacy & visibility | Phantom Protocol',
    description:
      'What stays private in the shielded pool versus what may be visible on-chain when interacting with AMM routing.',
  },
  {
    path: '/onepager',
    title: 'Phantom Protocol One Pager',
    description: 'Investor one pager for Phantom Protocol.',
  },
]

export function pathToHtmlFilename(pathname) {
  const trimmed = String(pathname || '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/{2,}/g, '/')
  if (!trimmed) return 'index.html'
  return `${trimmed.replace(/\//g, '__')}.html`
}
