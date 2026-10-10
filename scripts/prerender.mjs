// Ultimo passo di `npm run build`: scrive l'HTML statico delle pagine
// pubbliche (home e guida, in italiano e inglese) a partire dal pacchetto
// server di src/entry-server.tsx, piu' sitemap.xml e robots.txt. I motori di
// ricerca e le anteprime dei link leggono cosi' il contenuto senza eseguire
// JavaScript. Le altre rotte usano dist/app.html, il guscio vuoto dell'app
// (vedi le rewrites in vercel.json).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const SITE_URL = 'https://chesshammer.com'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const { render, pages } = await import(
  pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href
)

const template = readFileSync(join(dist, 'index.html'), 'utf8')
writeFileSync(join(dist, 'app.html'), template)

function replaceOnce(html, pattern, replacement, what) {
  if (!pattern.test(html)) throw new Error(`prerender: ${what} non trovato in index.html`)
  return html.replace(pattern, () => replacement)
}

for (const page of pages) {
  const body = render(page.path)
  if (!body.includes('<h1'))
    throw new Error(`prerender: ${page.path} non contiene un <h1>`)
  let html = replaceOnce(
    template,
    /<html lang="[^"]*">/,
    `<html lang="${page.lang}">`,
    '<html lang>',
  )
  html = replaceOnce(html, /<title>[\s\S]*?<\/title>/, page.head, '<title>')
  html = replaceOnce(
    html,
    /<div id="root"><\/div>/,
    `<div id="root">${body}</div>`,
    '#root',
  )
  const file = page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`
  mkdirSync(dirname(join(dist, file)), { recursive: true })
  writeFileSync(join(dist, file), html)
  console.log(
    `prerender: ${page.path} -> dist/${file} (${Math.round(html.length / 1024)} KB)`,
  )
}

const lastmod = new Date().toISOString().slice(0, 10)
const urls = pages
  .map((page) => {
    const links = page.meta.alternates
      .map(
        (a) =>
          `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`,
      )
      .join('\n')
    return `  <url>\n    <loc>${page.meta.canonical}</loc>\n    <lastmod>${lastmod}</lastmod>\n${links}\n  </url>`
  })
  .join('\n')
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
)

// Le pagine dell'app richiedono l'accesso: per un motore di ricerca sono vuote.
const privatePaths = [
  '/dashboard',
  '/train',
  '/sessions',
  '/profile',
  '/faq',
  '/reset-password',
]
writeFileSync(
  join(dist, 'robots.txt'),
  `User-agent: *\nAllow: /\n${privatePaths.map((p) => `Disallow: ${p}`).join('\n')}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`,
)
console.log(`prerender: sitemap.xml (${pages.length} pagine) e robots.txt`)
