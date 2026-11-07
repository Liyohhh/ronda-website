import { readFileSync } from 'node:fs'
import { test as base, expect, type Page, type Route } from '@playwright/test'

// Mocked backend for end-to-end tests. Search and plan-trip answers were recorded from production (public
// timetable data); live buses are made up. Every request to the fake Supabase host must be handled here:
// anything else is recorded in `unexpected` and fails the test.
const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'))
const stopRow = (stop_id: string, stop_name: string, category: string, feed_id: string, stop_lat: number, stop_lon: number, route_ids: string[], stop_code: string | null = null) =>
  ({ stop_id, stop_name, category, search: stop_name.toLowerCase(), similarity_score: 1, feed_id, stop_lat, stop_lon, route_ids, stop_code })
export const SEARCH = {
  klcc: fixture('search_klcc.json'),
  pasarSeni: fixture('search_pasar_seni.json'),
  // MRT Maluri and its two bus stops of the same name across the road (shown once)
  maluri: [
    stopRow('KG22', 'MRT Maluri', 'MRT Kajang Line', 'rapid-rail-kl', 3.1236, 101.7276, ['KGL']),
    stopRow('1001', 'MRT Maluri Pintu B', 'BUS T352 · T400', 'rapid-bus-kl', 3.1239, 101.7281, ['T352'], 'KL2001'),
    stopRow('1002', 'MRT Maluri Pintu B', 'BUS T352 · T400', 'rapid-bus-kl', 3.1241, 101.7283, ['T400'], 'KL2002'),
  ],
  // only looks like the mall: the mall itself (search_pois) must come first
  pavilionBusStop: [stopRow('1003', 'Pavilion Bukit Jalil', 'BUS T580', 'rapid-bus-kl', 3.0470, 101.6790, ['T580'], 'KL3001')],
}
export const PLAN = fixture('plan_klcc_pasar_seni.json')
export const TRAILS = fixture('trails.json')
// three mapped places within 300 m (shape of public.places_near)
const near = (osm_id: string, kind: string, name: string, distance_m: number) => ({ osm_id, kind, subkind: null, name, name_en: null, name_ms: null,
  name_zh: null, name_ar: null, lat: 3.158, lon: 101.712, opening_hours: null, distance_m })
// two destinations from a hub (shape of public.hub_destinations)
export const HUB_DESTINATIONS = [
  { dest_slug: 'klcc', dest_name: 'KLCC & Petronas Twin Towers', lat: 3.1589, lon: 101.7133, sort: 1, duration_min: 53, transfers: 1, walk_min: 6,
    fare_amount: 57.1, fare_exact: true, hops: ['ERL KLIA Ekspres / Transit', 'LRT Kelana Jaya Line'], computed_at: '2026-10-14T00:00:00Z' },
  { dest_slug: 'putrajaya', dest_name: 'Putrajaya', lat: 2.9313, lon: 101.6715, sort: 2, duration_min: 17, transfers: 0, walk_min: 2,
    fare_amount: 9.4, fare_exact: true, hops: ['ERL KLIA Ekspres / Transit'], computed_at: '2026-10-14T00:00:00Z' },
]
export const PLACES_NEAR = [near('node/1', 'restaurant', 'Test Kopitiam', 60), near('node/2', 'useful', 'Test Pharmacy', 120), near('way/3', 'park', 'Test Park', 250)] // public.trails_data(), recorded from production
// ai-chat answer in the shape the function returns (made-up place: the cards come from tools in real use)
export const CHAT = {
  reply: 'There is one hotel within 500 m of LRT KLCC.',
  guest: false,
  cards: [{ kind: 'hotel', name: 'Test Hotel', distance_m: 240, walk_min: 3, station: 'LRT KLCC', link: '/?to=LRT%20KLCC&toName=Test%20Hotel' }],
}

// made-up buses near KL Sentral (not real plates)
export const LIVE = {
  vehicles: [
    { vehicle_id: 'TEST001', feed_id: 'rapid-bus-kl', route_id: 'T7890', label: 'T789', colour: '127A78', lat: 3.134, lon: 101.686, bearing: 90, speed_kmh: 22, status: 'on_trip', wheelchair: true, current_stop_id: null, source: 'both', gps_at: new Date().toISOString() },
    { vehicle_id: 'TEST002', feed_id: 'rapid-bus-kl', route_id: '402', label: '402', colour: null, lat: 3.139, lon: 101.69, bearing: 180, speed_kmh: 0, status: 'off_trip', wheelchair: false, current_stop_id: null, source: 'kiosk', gps_at: new Date().toISOString() },
  ],
  // a made-up ETS train in central KL (inside the first map view), about 6 min late
  trains: [
    { vehicle_id: 'KTMB-ETSTEST', train_no: '9999', unit: 'ETSTEST', feed_id: 'ktmb', route_id: 'ETS', line: 'ETS', network: 'KTM ETS', colour: '#FFC72C', headsign: 'KTM/ETS JB Sentral', next_stop: 'KTM/ETS Kluang', delay_secs: 370, lat: 3.145, lon: 101.68, bearing: null, gps_at: new Date().toISOString() },
  ],
  sources: [
    { source: 'official', fetched_at: new Date().toISOString(), ok: true, vehicles: 1 },
    { source: 'kiosk', fetched_at: new Date().toISOString(), ok: true, vehicles: 2 },
  ],
}

// bus routes for the Lines tab (shape of public.bus_routes())
export const BUS_ROUTES = [
  { feed_id: 'rapid-bus-kl', route_id: 'T3520', code: 'T352', name: 'Pandan Perdana - Taman Muda', colour: '127A78' },
  { feed_id: 'rapid-bus-mrtfeeder', route_id: '21007', code: 'T410', name: 'MRT Taman Connaught - Taman Connaught (Barat)', colour: null },
  { feed_id: 'rapid-bus-kl', route_id: '402', code: '402', name: 'Hab Lebuh Pudu - Taman Bukit Indah', colour: 'E57200' },
]

export type Backend = {
  planTrip: (body: Record<string, unknown>) => { status?: number; json: unknown }
  chat: (body: Record<string, unknown>) => { status?: number; json: unknown }
  deleteAccount: () => { status?: number; json: unknown }
  signIn: (body: Record<string, unknown>) => { status?: number; json: unknown } // POST /auth/v1/token (email + password)
  signUp: (body: Record<string, unknown>) => { status?: number; json: unknown }
  alerts: unknown[] // published service alerts (public.service_alerts)
  calls: { path: string; body: unknown }[]
  unexpected: string[]
}

// made-up account for sign-in tests (the same one the account tests put in storage)
export const TEST_USER = { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', role: 'authenticated', email: 'tester@example.test',
  app_metadata: { provider: 'email' }, user_metadata: { full_name: 'Test Rider' }, identities: [{ provider: 'email' }], created_at: '2026-10-01T00:00:00Z' }
export const testSession = () => ({ access_token: 'e2e-access-token', refresh_token: 'e2e-refresh-token', token_type: 'bearer', expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600, user: TEST_USER })

const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X4lb8AAAAASUVORK5CYII=', 'base64')

async function mockBackend(page: Page): Promise<Backend> {
  const be: Backend = { planTrip: () => ({ json: PLAN }), chat: () => ({ json: CHAT }), deleteAccount: () => ({ json: { deleted: true } }),
    signIn: () => ({ json: testSession() }),
    // email confirmation on: a new user and no session until the link in the email is opened
    signUp: (b) => ({ json: { ...TEST_USER, email: b.email, user_metadata: (b.data as object) ?? {}, confirmation_sent_at: new Date().toISOString() } }),
    alerts: [], calls: [], unexpected: [] }
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) })

  // anything outside the site and the fake backend: images get a blank picture (trail photos), the rest is
  // blocked, so tests never depend on the internet. Registered first, so the routes below take precedence.
  await page.route((url) => url.hostname !== 'localhost' && url.hostname !== 'e2e.supabase.test', (r) =>
    r.request().resourceType() === 'image' ? r.fulfill({ contentType: 'image/png', body: PNG_1PX }) : r.abort())
  // map tiles: a blank image, never the real tile server. This image does not decode, so every tile fails to load:
  // the maps must still finish loading (see drawAgainOnError in src/services/mapStyle.ts)
  await page.route('https://tile.openstreetmap.org/**', (r) => r.fulfill({ contentType: 'image/png', body: PNG_1PX }))
  await page.route('https://e2e.supabase.test/**', async (route) => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } })
    const url = new URL(req.url())
    // JSON bodies are kept for the tests to check; file uploads (form data) are not JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any
    try { body = req.postDataJSON?.() ?? null } catch { body = null }
    be.calls.push({ path: url.pathname, body })
    switch (url.pathname) {
      case '/rest/v1/rpc/search_stops': {
        const q = String(body?.query ?? '').toLowerCase()
        // the database fixes typos itself: "mrrt mluri" finds MRT Maluri (search_fix below says so)
        if (q.includes('mluri') || q.includes('maluri')) return json(route, SEARCH.maluri)
        if (q.includes('pavilion')) return json(route, SEARCH.pavilionBusStop)
        return json(route, q.includes('kj10') || q.includes('klcc') ? SEARCH.klcc : q.includes('pasar') ? SEARCH.pasarSeni : [])
      }
      case '/rest/v1/rpc/record_search_pick': // counts what people pick; nothing comes back
        return route.fulfill({ status: 204, body: '' })
      case '/rest/v1/rpc/search_fix': // the search as the database understood it, null when unchanged
        return json(route, ({ 'mrrt mluri': 'mrt maluri', 'pavilion kl': 'pavilion kuala lumpur' } as Record<string, string>)[String(body?.query ?? '').toLowerCase()] ?? null)
      case '/rest/v1/rpc/trails_data':
        return json(route, TRAILS)
      case '/rest/v1/rpc/trail_route': // no walking route in the tests: the trail map stays hidden (no map tiles needed)
        return json(route, { start: null, end: null, stops: [], legs: [] })
      case '/rest/v1/hubs': { // one arrival hub (maybeSingle asks for an object)
        const one = (req.headers()['accept'] ?? '').includes('object')
        const hub = { slug: 'klia1', name: 'KLIA Terminal 1', lat: 2.7547, lon: 101.7046 }
        return json(route, url.searchParams.get('slug') === 'eq.klia1' || !url.searchParams.get('slug') ? (one ? hub : [hub]) : (one ? null : []))
      }
      case '/rest/v1/hub_destinations':
        return json(route, HUB_DESTINATIONS)
      case '/rest/v1/rpc/nearest_transit': // Home "Near you" line
        return json(route, [
          { feed_id: 'rapid-rail-kl', stop_id: 'KG18A', name: 'MRT Bukit Bintang', lat: 3.1465, lon: 101.7109, is_rail: true, distance_m: 144, route_ids: ['KGL'], code: null, routes: null },
          { feed_id: 'rapid-bus-kl', stop_id: '1000958', name: 'MRT Bukit Bintang/Hsbc', lat: 3.1477, lon: 101.7108, is_rail: false, distance_m: 29, route_ids: ['U4000'], code: 'KL86', routes: ['400', '420'] },
        ])
      case '/rest/v1/rpc/places_near': // OpenStreetMap places around a station (RONDA 300 page)
        return json(route, PLACES_NEAR)
      case '/rest/v1/rpc/admin_dashboard': { // admin dashboard numbers (the database refuses non-admins; the page asks only on /admin)
        const series = (count: number, unit: number) => Array.from({ length: count }, (_, i) => ({ d: new Date(Date.UTC(2026, 9, 1) + i * unit * 86400000).toISOString(), n: 40 + i, s: 10 + (i % 4) }))
        return json(route, { active_today: 69, active_week: 240, active_month: 820, active_today_prev: 60, active_week_prev: 220, active_month_prev: 700, signed_in_today: 18,
          stickiness: 0.13, active_daily: series(30, 1), active_weekly: series(12, 7), active_monthly: series(12, 30),
          cohorts: [{ w: '2026-10-05', n: 300, w1: 41, w2: 27, w4: null }, { w: '2026-10-12', n: 320, w1: 44, w2: null, w4: null }],
          busy_hours: [{ dow: 1, h: 8, n: 30 }, { dow: 1, h: 18, n: 28 }, { dow: 6, h: 12, n: 12 }],
          top_trips: [{ from: 'LRT Gombak', to: 'KL Sentral', n: 21 }], hot_stations: [{ s: 'LRT Titiwangsa', n: 26 }, { s: 'LRT Gombak', n: 14 }],
          top_searches: [{ q: 'klcc', n: 12 }, { q: 'pavilion', n: 8 }], no_result_searches: [{ q: 'ikea cheras', n: 4 }],
          live_shares: 9, live_shares_prev: 6, live_share_minutes: 20, platforms: [{ p: 'android', n: 50 }, { p: 'web', n: 19 }], languages: [{ l: 'en', n: 40 }, { l: 'ms', n: 29 }],
          funnel: { search: 156, plan: 120, open: 80, share: 9 }, places: [{ id: 'chinatown1974', name: 'Chinatown 1974', views: 30, go: 7 }], trails: [{ slug: 'heritage', views: 12 }],
          alert_reach: [{ id: 'a1', title: 'LRT Kelana Jaya: trains turn back at Ampang Park', n: 52, first: '2026-10-28T08:00:00' }],
          accounts: 42, accounts_new_week: 5, countries: [{ c: 'MY', n: 30 }, { c: 'SG', n: 7 }, { c: null, n: 5 }] })
      }
      // anonymous usage events (services/analytics.ts): accepted, nothing back
      case '/rest/v1/analytics_events':
        return route.fulfill({ status: 201, headers: { 'access-control-allow-origin': '*' }, body: '' })
      case '/rest/v1/rpc/bus_routes':
        return json(route, BUS_ROUTES)
      case '/rest/v1/rpc/line_stations':
      case '/rest/v1/rpc/search_route_stops':
      case '/rest/v1/rpc/stops_in_bbox':
        return json(route, [])
      case '/rest/v1/rpc/search_pois': { // our own OpenStreetMap places (hotels ...)
        const q = String(body?.query ?? '').toLowerCase()
        if (q.includes('pavilion')) return json(route, [{ name: 'Pavilion Kuala Lumpur', detail: 'Mall', lat: 3.1489, lon: 101.7133, kind: 'mall', osm: 'way/2' }])
        return json(route, q.includes('hyatt') ? [{ name: 'Grand Hyatt', detail: 'Hotel', lat: 3.1536, lon: 101.7121, kind: 'building', osm: 'way/1' }] : [])
      }
      case '/functions/v1/geocode':
        return json(route, { results: [], attribution: '© OpenStreetMap contributors' })
      case '/functions/v1/plan-trip': {
        const r = be.planTrip(body)
        return json(route, r.json, r.status ?? 200)
      }
      case '/functions/v1/ai-chat': {
        const r = be.chat(body)
        return json(route, r.json, r.status ?? 200)
      }
      case '/functions/v1/delete-account': {
        const r = be.deleteAccount()
        return json(route, r.json, r.status ?? 200)
      }
      // account changes (name / password): echo a user back, as Supabase Auth does
      case '/auth/v1/user':
        if (req.method() === 'GET') return json(route, TEST_USER) // who the token belongs to (after an email link)
        if (req.method() === 'PUT') return json(route, { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', email: 'tester@example.test',
          app_metadata: { provider: 'email' }, user_metadata: body?.data ?? {}, identities: [{ provider: 'email' }], created_at: '2026-10-01T00:00:00Z' })
        break
      case '/auth/v1/token': {
        const r = be.signIn(body)
        return json(route, r.json, r.status ?? 200)
      }
      case '/auth/v1/signup': {
        const r = be.signUp(body)
        return json(route, r.json, r.status ?? 200)
      }
      case '/auth/v1/logout':
        return route.fulfill({ status: 204, headers: { 'access-control-allow-origin': '*' } })
      case '/functions/v1/live':
        if (body?.action === 'vehicles') return json(route, LIVE)
        if (body?.action === 'approaching') return json(route, { buses: [] })
        return json(route, { arrivals: [], supported: false })
    }
    // rail station positions (RONDA 300 map preview); positions from public.stops
    if (url.pathname === '/rest/v1/stops') return json(route, [
      { feed_id: 'rapid-rail-kl', stop_id: 'KG16', stop_name: 'Pasar Seni', stop_lat: 3.142293265, stop_lon: 101.6955642 },
      { feed_id: 'rapid-rail-kl', stop_id: 'KJ10', stop_name: 'KLCC', stop_lat: 3.158935, stop_lon: 101.713287 },
    ])
    // where two hand-picked trail places near KLCC are (RONDA picks on the RONDA 300 map; both have photos)
    if (url.pathname === '/rest/v1/trail_places') return json(route, [
      { id: 'klccPark', lat: 3.1553, lon: 101.7146 },
      { id: 'petrosains', lat: 3.1579, lon: 101.7119 },
    ])
    // profile pictures: upload / replace / remove in the avatars bucket, and the public picture itself (1 px PNG)
    if (url.pathname.startsWith('/storage/v1/object/public/avatars/')) return route.fulfill({ status: 200, contentType: 'image/png', headers: { 'access-control-allow-origin': '*' },
      body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64') })
    if (url.pathname.startsWith('/storage/v1/object/avatars')) return json(route, req.method() === 'DELETE' ? [] : { Key: url.pathname.replace('/storage/v1/object/', '') })
    // operator service alerts in force (none unless a test sets them)
    if (url.pathname === '/rest/v1/service_alerts') return json(route, be.alerts)
    // plain table reads (bus route list etc.): empty
    if (url.pathname.startsWith('/rest/v1/') && req.method() === 'GET') return json(route, [])
    if (url.pathname.startsWith('/auth/v1/')) return json(route, {})
    be.unexpected.push(`${req.method()} ${url.pathname}`)
    return json(route, { error: 'not mocked' }, 500)
  })
  return be
}

// `backend` fixture: mocks installed before the page loads; fails the test on unmocked calls or page errors
export const test = base.extend<{ backend: Backend; pageErrors: string[] }>({
  pageErrors: async ({ page }, use) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await use(errors)
    expect(errors, 'uncaught errors in the page').toEqual([])
  },
  backend: async ({ page, pageErrors }, use) => {
    void pageErrors
    const be = await mockBackend(page)
    await use(be)
    expect(be.unexpected, 'requests the mocks do not handle').toEqual([])
  },
})
export { expect }
