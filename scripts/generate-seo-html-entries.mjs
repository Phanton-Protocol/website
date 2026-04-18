import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, unlinkSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PRERENDER_STATIC_ROUTES, SITE_ORIGIN, pathToHtmlFilename } from '../src/seo/prerenderMeta.js'
import { blogPosts } from '../src/data/blogPosts.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')
const generatedDir = join(rootDir, 'generated-seo')
const indexPath = join(rootDir, 'index.html')

function escapeAttr(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

function applyPageMeta(html, { path, title, description }) {
  const canonical =
    path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${String(path).replace(/\/$/, '')}`
  const ogDesc =
    path === '/'
      ? 'Shielded pools, relayer execution, and privacy-preserving DeFi for institutions, teams, and traders—settlement with stronger confidentiality.'
      : description
  const twDesc =
    path === '/'
      ? 'Private DeFi infrastructure: shielded pools, relayer execution, treasury and enterprise workflows.'
      : description

  let out = html
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`)
  out = out.replace(/<meta name="title" content="[^"]*"/, `<meta name="title" content="${escapeAttr(title)}"`)
  out = out.replace(/<meta name="description" content="[^"]*"/, `<meta name="description" content="${escapeAttr(description)}"`)
  out = out.replace(/<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${escapeAttr(canonical)}"`)
  out = out.replace(/<link rel="alternate" hreflang="en" href="[^"]*"/, `<link rel="alternate" hreflang="en" href="${escapeAttr(canonical)}"`)
  out = out.replace(/<link rel="alternate" hreflang="x-default" href="[^"]*"/, `<link rel="alternate" hreflang="x-default" href="${escapeAttr(canonical)}"`)

  out = out.replace(/<meta property="og:url" content="[^"]*"/, `<meta property="og:url" content="${escapeAttr(canonical)}"`)
  out = out.replace(/<meta property="og:title" content="[^"]*"/, `<meta property="og:title" content="${escapeAttr(title)}"`)
  out = out.replace(/<meta property="og:description" content="[^"]*"/, `<meta property="og:description" content="${escapeAttr(ogDesc)}"`)
  out = out.replace(/<meta property="og:image:alt" content="[^"]*"/, `<meta property="og:image:alt" content="${escapeAttr(title)}"`)

  out = out.replace(/<meta name="twitter:url" content="[^"]*"/, `<meta name="twitter:url" content="${escapeAttr(canonical)}"`)
  out = out.replace(/<meta name="twitter:title" content="[^"]*"/, `<meta name="twitter:title" content="${escapeAttr(title)}"`)
  out = out.replace(/<meta name="twitter:description" content="[^"]*"/, `<meta name="twitter:description" content="${escapeAttr(twDesc)}"`)
  out = out.replace(/<meta name="twitter:image:alt" content="[^"]*"/, `<meta name="twitter:image:alt" content="${escapeAttr(title)}"`)

  const ldMatch = out.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/)
  if (ldMatch) {
    try {
      const data = JSON.parse(ldMatch[1])
      const graph = data['@graph']
      if (Array.isArray(graph)) {
        const wp = graph.find((x) => x && x['@type'] === 'WebPage')
        if (wp) {
          wp['@id'] = `${canonical}#webpage`
          wp.url = canonical
          wp.name = title
          wp.description = description
        }
      }
      const serialized = JSON.stringify(data)
      out = out.replace(ldMatch[0], `<script type="application/ld+json">\n      ${serialized}\n    </script>`)
    } catch {
      /* keep original ld+json if parse fails */
    }
  }

  return out
}

function syncVercelRewrites(pages) {
  const vercelPath = join(rootDir, 'vercel.json')
  const cfg = JSON.parse(readFileSync(vercelPath, 'utf8'))
  const seoRewrites = pages.map((p) => {
    const destFile = pathToHtmlFilename(p.path)
    return { source: p.path, destination: `/generated-seo/${destFile}` }
  })
  cfg.rewrites = [...seoRewrites, { source: '/(.*)', destination: '/index.html' }]
  writeFileSync(vercelPath, JSON.stringify(cfg, null, 2) + '\n')
}

function main() {
  mkdirSync(generatedDir, { recursive: true })
  if (existsSync(generatedDir)) {
    for (const f of readdirSync(generatedDir)) {
      if (f.endsWith('.html')) {
        try {
          unlinkSync(join(generatedDir, f))
        } catch {
          /* noop */
        }
      }
    }
  }

  const baseHtml = readFileSync(indexPath, 'utf8')
  const blogRoutes = blogPosts.map((p) => ({
    path: `/blog/${p.slug}`,
    title: p.title,
    description: p.description,
  }))
  const pages = [...PRERENDER_STATIC_ROUTES, ...blogRoutes]

  for (const p of pages) {
    const name = pathToHtmlFilename(p.path)
    const outFile = join(generatedDir, name)
    const next = applyPageMeta(baseHtml, p)
    writeFileSync(outFile, next)
  }

  syncVercelRewrites(pages)
  console.log(`[seo] wrote ${pages.length} prerender HTML shells into generated-seo/ and synced vercel.json rewrites`)
}

main()
