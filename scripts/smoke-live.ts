// Read-only smoke test of a deployed RONDA: the site's pages answer, and the public backend calls the site makes
// (station search, trails, a trip plan) work. It never writes anything and never signs in.
//
//   SITE_URL=https://<domain> SUPABASE_URL=https://<ref>.supabase.co SUPABASE_ANON_KEY=<public anon key> \
//     node --experimental-strip-types scripts/smoke-live.ts
//
// The anon key is the public one already shipped in the website; never use the service key here.

const SITE = process.env.SITE_URL ?? 'http://localhost:4173'
const API = process.env.SUPABASE_URL
const KEY = process.env.SUPABASE_ANON_KEY
const PAGES = ['/', '/trails', '/ronda-300', '/help', '/help/general', '/about', '/live', '/credits', '/no-such-page']

let fail = 0
const ok = (c: boolean, msg: string) => { console.log(c ? 'ok  ' : 'FAIL', msg); if (!c) fail++ }
const timed = async <T>(f: () => Promise<T>) => { const t = performance.now(); const v = await f(); return { v, ms: Math.round(performance.now() - t) } }

for (const p of PAGES) {
  const { v: r, ms } = await timed(() => fetch(SITE + p))
  const html = await r.text()
  ok(r.status === 200 && html.includes('<div id="root">'), `page ${p}: ${r.status} in ${ms} ms`)
}
// public/_headers is applied by Cloudflare Pages, so only the hosted site has them
if (SITE.startsWith('https://')) {
  const head = await fetch(SITE + '/')
  ok(head.headers.get('x-content-type-options') === 'nosniff', 'security headers present (nosniff)')
}

if (!API || !KEY) {
  console.log('skip backend checks: set SUPABASE_URL and SUPABASE_ANON_KEY')
} else {
  const rpc = (fn: string, body: unknown) => fetch(`${API}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { apikey: KEY, authorization: `Bearer ${KEY}`, 'content-type': 'application/json' }, body: JSON.stringify(body) })
  const { v: s, ms } = await timed(() => rpc('search_stops', { query: 'klcc' }))
  const stops = (await s.json()) as { stop_name: string; stop_lat: number; stop_lon: number }[]
  ok(s.ok && stops.some((x) => x.stop_name === 'LRT KLCC'), `search_stops("klcc") finds LRT KLCC (${ms} ms)`)
  const typo = (await (await rpc('search_stops', { query: 'pasar sni' })).json()) as { stop_name: string }[]
  ok(typo.some((x) => /Pasar Seni/.test(x.stop_name)), 'search tolerates a typo ("pasar sni")')
  const t = await rpc('trails_data', {})
  const trails = (await t.json()) as { trails: unknown[] }
  ok(t.ok && Array.isArray(trails.trails) && trails.trails.length >= 15, `trails_data: ${trails.trails?.length} trails`)
  const a = stops.find((x) => x.stop_name === 'LRT KLCC')
  if (a) {
    const { v: p, ms: pms } = await timed(() => fetch(`${API}/functions/v1/plan-trip`, { method: 'POST', headers: { apikey: KEY, authorization: `Bearer ${KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ from: { lat: a.stop_lat, lon: a.stop_lon }, to: { lat: 3.13442, lon: 101.68625 } }) }))
    const plan = (await p.json()) as { options?: unknown[] }
    ok(p.ok && (plan.options?.length ?? 0) > 0, `plan-trip LRT KLCC -> LRT KL Sentral: ${plan.options?.length ?? 0} options in ${pms} ms`)
  }
}

console.log(fail ? `\n${fail} check(s) failed` : '\nall checks passed')
process.exit(fail ? 1 : 0)
