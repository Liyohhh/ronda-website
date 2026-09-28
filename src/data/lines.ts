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
// Same icons as the RONDA app: a white vehicle glyph on a circle in the line colour.
// Glyphs are Flutter's icons, 24x24: Material Icons (Apache License 2.0) and, for KTM, Cupertino Icons
// tram_fill (MIT, outline taken from cupertino_icons 1.0.9).

const GLYPHS: Record<'train' | 'railway' | 'bus' | 'subway' | 'tram', string> = {
  train: 'M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z', // Icons.train
  railway: 'M12,2C8,2,4,2.5,4,6v9.5C4,17.43,5.57,19,7.5,19L6,20v1h12v-1l-1.5-1c1.93,0,3.5-1.57,3.5-3.5 V6C20,2.5,16.42,2,12,2z M12,16c-0.83,0-1.5-0.67-1.5-1.5S11.17,13,12,13s1.5,0.67,1.5,1.5S12.83,16,12,16z M18,10H6V7h12V10z', // Icons.directions_railway_filled
  bus: 'M12,2C8,2,4,2.5,4,6v9.5c0,0.95,0.38,1.81,1,2.44V20c0,0.55,0.45,1,1,1h1c0.55,0,1-0.45,1-1 v-1h8v1c0,0.55,0.45,1,1,1h1c0.55,0,1-0.45,1-1v-2.06c0.62-0.63,1-1.49,1-2.44V6C20,2.5,16.42,2,12,2z M8.5,16 C7.67,16,7,15.33,7,14.5S7.67,13,8.5,13s1.5,0.67,1.5,1.5S9.33,16,8.5,16z M15.5,16c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5 s1.5,0.67,1.5,1.5S16.33,16,15.5,16z M18,10H6V7h12V10z', // Icons.directions_bus_filled
  subway: 'M12,2C8,2,4,2.5,4,6v9.5C4,17.43,5.57,19,7.5,19L6,20v1h12v-1l-1.5-1c1.93,0,3.5-1.57,3.5-3.5V6C20,2.5,16.42,2,12,2z M8.5,16C7.67,16,7,15.33,7,14.5S7.67,13,8.5,13s1.5,0.67,1.5,1.5S9.33,16,8.5,16z M11,10H6V7h5V10z M15.5,16 c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5s1.5,0.67,1.5,1.5S16.33,16,15.5,16z M18,10h-5V7h5V10z', // Icons.directions_subway_filled
  tram: 'M4.688 22.969 L7.312 18.797 Q7.125 18.75 6.797 18.75 Q6.469 18.75 6.328 18.703 Q4.453 18.469 4.312 16.359 Q4.031 12.984 4.031 9.562 Q4.031 6.047 4.312 2.672 Q4.453 0.609 6.328 0.375 Q9.328 0.0 12.047 0.0 Q14.672 0.0 17.672 0.375 Q19.547 0.609 19.688 2.672 Q19.969 6.047 19.969 9.562 Q19.969 12.984 19.688 16.359 Q19.547 18.469 17.672 18.703 Q17.531 18.75 17.203 18.75 Q16.875 18.75 16.688 18.797 L19.312 22.969 Q19.453 23.156 19.453 23.438 Q19.453 24.0 18.891 24.0 Q18.469 24.0 18.281 23.672 L18.0 23.109 L6.047 23.109 L5.719 23.672 Q5.531 24.0 5.109 24.0 Q4.547 24.0 4.547 23.438 Q4.547 23.156 4.688 22.969ZM7.547 4.594 L16.453 4.594 Q17.438 4.594 17.438 3.609 Q17.438 2.578 16.453 2.578 L7.547 2.578 Q6.562 2.578 6.562 3.609 Q6.562 4.594 7.547 4.594ZM12.0 12.141 Q14.484 12.141 16.969 11.812 Q17.531 11.719 17.625 11.156 Q17.719 10.125 17.719 9.188 Q17.719 8.25 17.625 7.219 Q17.531 6.609 16.969 6.516 Q14.766 6.281 12.0 6.281 Q9.281 6.281 7.078 6.516 Q6.469 6.562 6.375 7.219 Q6.328 7.734 6.328 9.188 Q6.328 10.641 6.375 11.156 Q6.469 11.766 7.078 11.812 Q10.453 12.141 12.0 12.141ZM8.531 13.594 Q7.922 13.594 7.476 14.039 Q7.031 14.484 7.031 15.141 Q7.031 15.75 7.453 16.195 Q7.875 16.641 8.532 16.641 Q9.188 16.641 9.633 16.195 Q10.078 15.75 10.078 15.14 Q10.078 14.531 9.633 14.062 Q9.188 13.594 8.531 13.594ZM15.516 16.641 Q16.125 16.641 16.57 16.195 Q17.016 15.75 17.016 15.141 Q17.016 14.484 16.57 14.039 Q16.125 13.594 15.515 13.594 Q14.906 13.594 14.438 14.062 Q13.969 14.531 13.969 15.14 Q13.969 15.75 14.414 16.195 Q14.859 16.641 15.516 16.641ZM11.859 19.031 Q9.703 19.031 8.625 18.938 L7.969 20.016 L16.031 20.016 L15.375 18.938 Q14.203 19.031 11.859 19.031ZM6.656 22.078 L17.344 22.078 L16.688 21.047 L7.312 21.047 L6.656 22.078Z', // CupertinoIcons.tram_fill (train on rails)
}

// which glyph each mode uses in the app
const MODE_GLYPH: Record<LineMode, keyof typeof GLYPHS> = {
  LRT: 'train', MRT: 'train', MONORAIL: 'railway', BRT: 'bus', BUS: 'bus', KTM: 'tram', ERL: 'subway', ETS: 'subway',
}

// Standalone SVG markup for a line badge (used by the website component and the file export)
export function lineBadgeSvg(line: Line, opts: { title?: boolean } = {}): string {
  const title = opts.title === false ? '' : `<title>${escapeXml(line.name)}</title>`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="${escapeXml(line.name)}">` +
    title +
    `<circle cx="24" cy="24" r="24" fill="${line.color}"/>` +
    `<path transform="translate(11 11) scale(1.0833)" fill="${line.textColor}" d="${GLYPHS[MODE_GLYPH[line.mode]]}"/>` +
    `</svg>`
  )
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
}
