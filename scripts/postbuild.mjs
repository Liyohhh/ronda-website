// After `vite build`: add the Content-Security-Policy to dist/_headers (Cloudflare Pages), write the trail texts
// for the mobile apps (dist/data/trail-texts.json) and, when SITE_URL is set (the real domain), write
// dist/sitemap.xml and point robots.txt at it.
//   SITE_URL=https://<domain> npm run build
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { loadEnv } from 'vite'
import { buildCsp } from './csp.mjs'

const OUT = process.argv[2] ?? 'dist'
const env = { ...loadEnv('production', process.cwd(), 'VITE_'), ...process.env }

// 1. CSP under the "/*" block of _headers
const headersFile = `${OUT}/_headers`
if (existsSync(headersFile)) {
  const csp = buildCsp(env)
  const text = readFileSync(headersFile, 'utf8').replace(/\r\n/g, '\n')
  const out = text.includes('Content-Security-Policy:')
    ? text.replace(/ {2}Content-Security-Policy:.*\n/, `  Content-Security-Policy: ${csp}\n`)
    : text.replace(/^\/\*\n/m, `/*\n  Content-Security-Policy: ${csp}\n`)
  writeFileSync(headersFile, out)
  console.log('CSP added to _headers')
}

// 2. trail and place texts for the mobile apps (the database holds the trail structure only; the words live in
//    src/i18n/translations.ts): /data/trail-texts.json = { en: { trail_<key>_name, trail_<key>_desc, place_<id>, trailCat_<c> }, ms, zh, ar }
mkdirSync(`${OUT}/data`, { recursive: true })
const texts = execFileSync(process.execPath, ['--experimental-strip-types', '--no-warnings', '--input-type=module', '-e',
  `import('./src/i18n/translations.ts').then(({ translations }) => { const out = {}; for (const [l, t] of Object.entries(translations)) out[l] = Object.fromEntries(Object.entries(t).filter(([k]) => /^(trail_|place_|trailCat_)/.test(k))); process.stdout.write(JSON.stringify(out)) })`], { encoding: 'utf8' })
writeFileSync(`${OUT}/data/trail-texts.json`, texts)
console.log(`trail-texts.json: ${Object.keys(JSON.parse(texts).en).length} texts x 4 languages`)

// 3. sitemap (public pages only; trails from the database when reachable)
const site = (env.SITE_URL ?? '').replace(/\/$/, '')
if (site) {
  const pages = ['/', '/trails', '/ronda-300', '/live', '/about', '/services', '/help', '/help/payments', '/help/general', '/help/policies', '/credits']
  try {
    const r = await fetch(`${env.VITE_SUPABASE_URL}/rest/v1/rpc/trails_data`, {
      method: 'POST',
      headers: { apikey: env.VITE_SUPABASE_ANON_KEY, authorization: `Bearer ${env.VITE_SUPABASE_ANON_KEY}`, 'content-type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(8000),
    })
    const d = await r.json()
    // the Arabic-only trail category is not listed (its pages show only in Arabic)
    for (const t of d.trails ?? []) if (t.category !== 'halal-fine-dining') pages.push(`/trails/${t.slug}`)
  } catch {
    console.warn('sitemap: trails not reachable, listing the main pages only')
  }
  const today = new Date().toISOString().slice(0, 10)
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${site}${p}</loc><lastmod>${today}</lastmod></url>`).join('\n')}\n</urlset>\n`
  writeFileSync(`${OUT}/sitemap.xml`, xml)
  const robots = `${OUT}/robots.txt`
  if (existsSync(robots) && !readFileSync(robots, 'utf8').includes('Sitemap:')) writeFileSync(robots, readFileSync(robots, 'utf8').trimEnd() + `\nSitemap: ${site}/sitemap.xml\n`)
  console.log(`sitemap.xml: ${pages.length} pages`)
}
