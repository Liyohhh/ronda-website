// Content-Security-Policy for the built site, from the same env the build uses (so the map host, Supabase project
// and the optional CAPTCHA are allowed, and nothing else). Used by scripts/postbuild.mjs and e2e/csp.spec.ts.
const origin = (u) => {
  try { return u ? new URL(u).origin : null } catch { return null }
}

export function buildCsp(env) {
  const supabase = origin(env.VITE_SUPABASE_URL)
  const map = origin(env.VITE_MAP_PMTILES_URL)
  const assets = origin(env.VITE_MAP_ASSETS_URL) ?? 'https://protomaps.github.io'
  // Turnstile CAPTCHA: on the sign-in forms when a site key is set, and in the assistant
  const turnstile = env.VITE_CAPTCHA_SITE_KEY || env.VITE_AI_CHAT === 'on' ? 'https://challenges.cloudflare.com' : null
  // no map file (local only): plain OpenStreetMap tiles
  const osmTiles = map ? null : 'https://tile.openstreetmap.org'
  const list = (...xs) => xs.filter(Boolean).join(' ')
  // Cloudflare Web Analytics (switched on for the Pages project; no cookies): its script and where it reports
  const cfScript = 'https://static.cloudflareinsights.com'
  const cfReport = 'https://cloudflareinsights.com'
  return [
    `default-src 'self'`,
    `script-src ${list("'self'", turnstile, cfScript)}`,
    // React and MapLibre set style attributes
    `style-src 'self' 'unsafe-inline'`,
    `img-src ${list("'self'", 'data:', 'blob:', supabase, 'https://upload.wikimedia.org', 'https://live.staticflickr.com', osmTiles)}`,
    `font-src 'self' data:`,
    `connect-src ${list("'self'", cfReport, supabase, supabase && supabase.replace(/^https:/, 'wss:'), map, assets, osmTiles)}`,
    `worker-src 'self' blob:`,
    `child-src 'self' blob:`,
    `frame-src ${turnstile ?? "'none'"}`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
  ].join('; ')
}
