// Content-Security-Policy for the built site, from the same env the build uses (so the map host, Supabase project
// and the optional CAPTCHA are allowed, and nothing else). Used by scripts/postbuild.mjs and e2e/csp.spec.ts.
const origin = (u) => {
  try { return u ? new URL(u).origin : null } catch { return null }
}

export function buildCsp(env) {
  const supabase = origin(env.VITE_SUPABASE_URL)
  const map = origin(env.VITE_MAP_PMTILES_URL)
  const assets = origin(env.VITE_MAP_ASSETS_URL) ?? 'https://protomaps.github.io'
  const chat = env.VITE_AI_CHAT === 'on'
  const turnstile = chat ? 'https://challenges.cloudflare.com' : null
  // no map file (local only): plain OpenStreetMap tiles
  const osmTiles = map ? null : 'https://tile.openstreetmap.org'
  const list = (...xs) => xs.filter(Boolean).join(' ')
  return [
    `default-src 'self'`,
    `script-src ${list("'self'", turnstile)}`,
    // React and MapLibre set style attributes
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${list("'self'", 'data:', 'blob:', 'https://upload.wikimedia.org', osmTiles)}`,
    `font-src 'self' data:`,
    `connect-src ${list("'self'", supabase, supabase && supabase.replace(/^https:/, 'wss:'), map, assets, osmTiles)}`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `frame-src ${turnstile ?? "'none'"}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join('; ')
}
