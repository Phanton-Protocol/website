import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function seoHtmlInputs() {
  const dir = resolve(__dirname, 'generated-seo')
  if (!existsSync(dir)) return {}
  const files = readdirSync(dir).filter((f) => f.endsWith('.html'))
  return Object.fromEntries(
    files.map((f) => {
      const key = `seo-${f.replace(/\.html$/, '')}`
      return [key, resolve(dir, f)]
    }),
  )
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...seoHtmlInputs(),
      },
    },
  },
})
