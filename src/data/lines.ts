// RONDA rail lines: names, official colours and badge artwork, in one place.
//
// Colours come from the operators' own GTFS feeds (route_color / route_text_color):
//   Prasarana (rapid-rail-kl) and KTMB (ktmb), as loaded into Supabase.
// ERL's GTFS feed has no route_color, so its two colours are marked `colorSource: 'unverified'`
// until ERL confirms them. Don't invent colours for new lines: take them from the operator.
//
// Plain data + string builders (no React), so scripts/export-line-badges.ts can reuse it to
// write public/lines/*.svg for the app and other repos.

export type LineMode = 'MRT' | 'LRT' | 'MONORAIL' | 'BRT' | 'KTM' | 'ETS' | 'ERL' | 'BUS'

export type Line = {
  id: string // stable slug, also the SVG filename
  name: string // what riders see
  mode: LineMode
  code?: string // operator line code where one exists (KGL, PYL, ...)
  color: string // background, #RRGGBB
  textColor: string // glyph + label colour on top of `color`
  colorSource: 'gtfs' | 'unverified'
  gtfs: { feedId: string; routeIds: string[] }
}

export const LINES: Line[] = [
  // Prasarana rapidKL rail (feed rapid-rail-kl)
  { id: 'lrt-ampang', name: 'LRT Ampang Line', mode: 'LRT', code: 'AGL', color: '#E57200', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['AG'] } },
  { id: 'lrt-sri-petaling', name: 'LRT Sri Petaling Line', mode: 'LRT', code: 'SPL', color: '#76232F', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['PH'] } },
  { id: 'lrt-kelana-jaya', name: 'LRT Kelana Jaya Line', mode: 'LRT', code: 'KJL', color: '#D50032', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['KJ'] } },
  { id: 'lrt-shah-alam', name: 'LRT Shah Alam Line', mode: 'LRT', code: 'SAL', color: '#00A9E0', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['SA'] } },
  { id: 'mrt-kajang', name: 'MRT Kajang Line', mode: 'MRT', code: 'KGL', color: '#047940', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['KGL'] } },
  { id: 'mrt-putrajaya', name: 'MRT Putrajaya Line', mode: 'MRT', code: 'PYL', color: '#FFCD00', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['PYL'] } },
  { id: 'monorail', name: 'KL Monorail Line', mode: 'MONORAIL', code: 'MRL', color: '#84BD00', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['MR'] } },
  { id: 'brt-sunway', name: 'BRT Sunway Line', mode: 'BRT', code: 'BRT', color: '#115740', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['BRT'] } },

  // Express Rail Link (feed erl): no route_color in the feed, colours to be confirmed with ERL
  { id: 'erl-klia-ekspres', name: 'ERL KLIA Ekspres', mode: 'ERL', color: '#6B2C91', textColor: '#FFFFFF', colorSource: 'unverified', gtfs: { feedId: 'erl', routeIds: ['KE'] } },
  { id: 'erl-klia-transit', name: 'ERL KLIA Transit', mode: 'ERL', color: '#00A19A', textColor: '#FFFFFF', colorSource: 'unverified', gtfs: { feedId: 'erl', routeIds: ['KT'] } },

  // Keretapi Tanah Melayu (feed ktmb)
  { id: 'ktm-port-klang', name: 'KTM Port Klang Line', mode: 'KTM', color: '#DC2420', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['KA15_KD19'] } },
  { id: 'ktm-seremban', name: 'KTM Seremban Line', mode: 'KTM', color: '#3C5A9F', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['KC05_KB18'] } },
  { id: 'ktm-shuttle-selatan', name: 'KTM Shuttle Selatan (JB Sentral – Paloh)', mode: 'KTM', color: '#0A3D7A', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['SS'] } },
  { id: 'ktm-padang-besar', name: 'KTM Padang Besar Line', mode: 'KTM', color: '#018000', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['100_47300'] } },
  { id: 'ktm-ipoh', name: 'KTM Ipoh Line', mode: 'KTM', color: '#1964B7', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['100_9000'] } },
  { id: 'ktm-ets', name: 'KTM ETS', mode: 'ETS', color: '#FFC72C', textColor: '#000000', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['ETS'] } },
  { id: 'ktm-intercity', name: 'KTM Intercity', mode: 'KTM', color: '#6E6E6E', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['ERT', 'SH', 'ST'] } },
]

export const LINES_BY_ID: Record<string, Line> = Object.fromEntries(LINES.map((l) => [l.id, l]))

// Find a line from a GTFS route (e.g. a plan-trip leg's feed + route)
export function lineForRoute(feedId: string, routeId: string): Line | undefined {
  return LINES.find((l) => l.gtfs.feedId === feedId && l.gtfs.routeIds.includes(routeId))
}

// Buses aren't in LINES (hundreds of routes). Their badge uses the route's own GTFS colour when the
// operator publishes one (Rapid KL stage buses do), otherwise RONDA navy (MRT feeder buses, bus stops).
export const BUS_FALLBACK_COLOR = '#002472'

export function busLine(color?: string | null, name = 'Bus'): Line {
  const c = color ? (color.startsWith('#') ? color : `#${color}`) : BUS_FALLBACK_COLOR
  return { id: 'bus', name, mode: 'BUS', color: c.toUpperCase(), textColor: '#FFFFFF', colorSource: color ? 'gtfs' : 'unverified', gtfs: { feedId: '', routeIds: [] } }
}

// Distinct rail lines serving a stop, in LINES order (for interchange stations)
export function linesForStop(feedId: string, routeIds: string[] = []): Line[] {
  return LINES.filter((l) => l.gtfs.feedId === feedId && l.gtfs.routeIds.some((r) => routeIds.includes(r)))
}

// ---------- badge artwork ----------
// 48x48 rounded square in the line colour, a white vehicle glyph and the mode label underneath.

const GLYPHS: Record<'train' | 'monorail' | 'bus' | 'airport', string> = {
  // front of a train: body, windscreen, lights, rails
  train:
    '<rect x="15" y="7" width="18" height="20" rx="4"/><path d="M15 17h18M19 31l-3 3M29 31l3 3"/><circle cx="19.5" cy="22" r="1.2" fill="currentColor" stroke="none"/><circle cx="28.5" cy="22" r="1.2" fill="currentColor" stroke="none"/><path d="M20 11h8"/>',
  // car hanging under / riding on a single beam
  monorail:
    '<path d="M11 8h26"/><rect x="15" y="11" width="18" height="16" rx="4"/><path d="M15 19h18"/><circle cx="19.5" cy="23" r="1.2" fill="currentColor" stroke="none"/><circle cx="28.5" cy="23" r="1.2" fill="currentColor" stroke="none"/><path d="M24 8v3"/>',
  bus:
    '<rect x="14" y="7" width="20" height="21" rx="3.5"/><path d="M14 18h20M18 28v3M30 28v3M18 11h12"/><circle cx="18.5" cy="23" r="1.2" fill="currentColor" stroke="none"/><circle cx="29.5" cy="23" r="1.2" fill="currentColor" stroke="none"/>',
  // KLIA lines: train with a small plane
  airport:
    '<rect x="13" y="12" width="16" height="17" rx="3.5"/><path d="M13 21h16M17 31l-2.5 2.5M25 31l2.5 2.5"/><circle cx="17.5" cy="25" r="1" fill="currentColor" stroke="none"/><circle cx="24.5" cy="25" r="1" fill="currentColor" stroke="none"/><path d="M31 11l6-2.5-1.5 2.5 1.5 2.5z" fill="currentColor"/>',
}

const MODE_GLYPH: Record<LineMode, keyof typeof GLYPHS> = {
  MRT: 'train', LRT: 'train', KTM: 'train', ETS: 'train', ERL: 'airport', MONORAIL: 'monorail', BRT: 'bus', BUS: 'bus',
}

const MODE_LABEL: Record<LineMode, string> = {
  MRT: 'MRT', LRT: 'LRT', KTM: 'KTM', ETS: 'ETS', ERL: 'KLIA', MONORAIL: 'MONORAIL', BRT: 'BRT', BUS: 'BUS',
}

// Standalone SVG markup for a line badge (used by the website component and the file export)
export function lineBadgeSvg(line: Line, opts: { title?: boolean } = {}): string {
  const label = MODE_LABEL[line.mode]
  const fontSize = label.length > 5 ? 5.6 : 7.5
  const title = opts.title === false ? '' : `<title>${escapeXml(line.name)}</title>`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="${escapeXml(line.name)}">` +
    title +
    `<rect width="48" height="48" rx="10" fill="${line.color}"/>` +
    `<g fill="none" stroke="${line.textColor}" color="${line.textColor}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${GLYPHS[MODE_GLYPH[line.mode]]}</g>` +
    `<text x="24" y="43" text-anchor="middle" font-family="Inter, 'Segoe UI', Roboto, Arial, sans-serif" font-size="${fontSize}" font-weight="800" letter-spacing="0.4" fill="${line.textColor}">${label}</text>` +
    `</svg>`
  )
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
}
