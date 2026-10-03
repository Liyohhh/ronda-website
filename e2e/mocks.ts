import { readFileSync } from 'node:fs'
import { test as base, expect, type Page, type Route } from '@playwright/test'

// Mocked backend for end-to-end tests. Search and plan-trip answers were recorded from production (public
// timetable data); live buses are made up. Every request to the fake Supabase host must be handled here:
// anything else is recorded in `unexpected` and fails the test.
const fixture = (name: string) => JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'))
export const SEARCH = { klcc: fixture('search_klcc.json'), pasarSeni: fixture('search_pasar_seni.json') }
export const PLAN = fixture('plan_klcc_pasar_seni.json')

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
  calls: { path: string; body: unknown }[]
  unexpected: string[]
}

const PNG_1PX = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X4lb8AAAAASUVORK5CYII=', 'base64')

async function mockBackend(page: Page): Promise<Backend> {
  const be: Backend = { planTrip: () => ({ json: PLAN }), calls: [], unexpected: [] }
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
      case '/rest/v1/rpc/bus_routes':
        return json(route, BUS_ROUTES)
      case '/rest/v1/rpc/search_route_stops':
      case '/rest/v1/rpc/stops_in_bbox':
        return json(route, [])
      case '/functions/v1/geocode':
        return json(route, { results: [], attribution: '© OpenStreetMap contributors' })
      case '/functions/v1/plan-trip': {
        const r = be.planTrip(body)
        return json(route, r.json, r.status ?? 200)
      }
      case '/functions/v1/live':
        if (body?.action === 'vehicles') return json(route, LIVE)
        if (body?.action === 'approaching') return json(route, { buses: [] })
        return json(route, { arrivals: [], supported: false })
    }
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
