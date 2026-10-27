import { readFileSync } from 'node:fs'
import { test as base, expect, type Page, type Route } from '@playwright/test'

// Mocked backend for end-to-end tests. Search and plan-trip answers were recorded from production (public
// timetable data); live buses are made up. Every request to the fake Supabase host must be handled here:
// anything else is recorded in `unexpected` and fails the test.
const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'))
export const SEARCH = { klcc: fixture('search_klcc.json'), pasarSeni: fixture('search_pasar_seni.json') }
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
  alerts: unknown[] // published service alerts (public.service_alerts)
  calls: { path: string; body: unknown }[]
  unexpected: string[]
}

const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X4lb8AAAAASUVORK5CYII=', 'base64')

async function mockBackend(page: Page): Promise<Backend> {
  const be: Backend = { planTrip: () => ({ json: PLAN }), chat: () => ({ json: CHAT }), deleteAccount: () => ({ json: { deleted: true } }), alerts: [], calls: [], unexpected: [] }
  const json = (route: Route, body: unknown, status = 200) =>
    route.fulfill({ status, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify(body) })

  // anything outside the site and the fake backend: images get a blank picture (trail photos), the rest is
  // blocked, so tests never depend on the internet. Registered first, so the routes below take precedence.
  await page.route((url) => url.hostname !== 'localhost' && url.hostname !== 'e2e.supabase.test', (r) =>
    r.request().resourceType() === 'image' ? r.fulfill({ contentType: 'image/png', body: PNG_1PX }) : r.abort())
  // map tiles: a blank image, never the real tile server
  await page.route('https://tile.openstreetmap.org/**', (r) => r.fulfill({ contentType: 'image/png', body: PNG_1PX }))
  await page.route('https://e2e.supabase.test/**', async (route) => {
    const req = route.request()
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*' } })
    const url = new URL(req.url())
    const body = req.postDataJSON?.() ?? null
    be.calls.push({ path: url.pathname, body })
    switch (url.pathname) {
      case '/rest/v1/rpc/search_stops': {
        const q = String(body?.query ?? '').toLowerCase()
        return json(route, q.includes('kj10') || q.includes('klcc') ? SEARCH.klcc : q.includes('pasar') ? SEARCH.pasarSeni : [])
      }
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
      case '/rest/v1/rpc/bus_routes':
        return json(route, BUS_ROUTES)
      case '/rest/v1/rpc/line_stations':
      case '/rest/v1/rpc/search_route_stops':
      case '/rest/v1/rpc/stops_in_bbox':
        return json(route, [])
      case '/rest/v1/rpc/search_pois': { // our own OpenStreetMap places (hotels ...)
        const q = String(body?.query ?? '').toLowerCase()
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
        if (req.method() === 'PUT') return json(route, { id: '00000000-0000-4000-8000-000000000001', aud: 'authenticated', email: 'tester@example.test',
          app_metadata: { provider: 'email' }, user_metadata: body?.data ?? {}, identities: [{ provider: 'email' }], created_at: '2026-10-01T00:00:00Z' })
        break
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
