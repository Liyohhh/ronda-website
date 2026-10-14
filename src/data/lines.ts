// RONDA rail lines: names, official colours and badge artwork, in one place.
//
// Colours: `colorSource: 'operator'` = the line icons on Prasarana's own site (myrapid.com.my line pages: Rapid KL
//   lines, KTM Port Klang and Seremban Lines, KLIA Ekspres and KLIA Transit; sampled from the icon files 15 Oct 2026);
//   `'gtfs'` = the operator's GTFS feed (route_color) for lines MyRapid does not show (other KTMB lines, BRT).
// Don't invent colours for new lines: take them from the operator.
// Icons: the 11 lines on MyRapid's legend use Prasarana's own icon files (public/lines/myrapid, downloaded from
//   myrapid.com.my 15 Oct 2026 at the owner's request; listed for the operator permission letter). Other lines use our
//   own drawing in the same style (lineBadgeSvg).
//
// Plain data + string builders (no React), so scripts/export-line-badges.ts can reuse it to
// write public/lines/*.svg for the app and other repos.

export type LineMode = 'MRT' | 'LRT' | 'MONORAIL' | 'BRT' | 'KTM' | 'ETS' | 'ERL' | 'BUS'

export type Line = {
  id: string // stable slug, also the SVG filename
  name: string // what riders see
  short?: string // tile label in the line picker ("Kelana Jaya"); a proper noun, not translated. Every rail line has one
  mode: LineMode
  code?: string // operator line code where one exists (KGL, PYL, ...)
  color: string // background, #RRGGBB
  textColor: string // glyph + label colour on top of `color`
  colorSource: 'operator' | 'gtfs' | 'unverified'
  icon?: string // the operator's own line icon (public/lines/myrapid), shown instead of our drawing
  gtfs: { feedId: string; routeIds: string[] }
}

export const LINES: Line[] = [
  // Prasarana rapidKL rail (feed rapid-rail-kl)
  { id: 'lrt-ampang', name: 'LRT Ampang Line', short: 'Ampang', mode: 'LRT', code: 'AGL', color: '#EB7203', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/lrt-ampang.png', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['AG'] } },
  { id: 'lrt-sri-petaling', name: 'LRT Sri Petaling Line', short: 'Sri Petaling', mode: 'LRT', code: 'SPL', color: '#7A212E', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/lrt-sri-petaling.png', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['PH'] } },
  { id: 'lrt-kelana-jaya', name: 'LRT Kelana Jaya Line', short: 'Kelana Jaya', mode: 'LRT', code: 'KJL', color: '#DD0330', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/lrt-kelana-jaya.png', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['KJ'] } },
  { id: 'lrt-shah-alam', name: 'LRT Shah Alam Line', short: 'Shah Alam', mode: 'LRT', code: 'SAL', color: '#00A7E0', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/lrt-shah-alam.png', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['SA'] } },
  { id: 'mrt-kajang', name: 'MRT Kajang Line', short: 'Kajang', mode: 'MRT', code: 'KGL', color: '#047835', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/mrt-kajang.png', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['KGL'] } },
  { id: 'mrt-putrajaya', name: 'MRT Putrajaya Line', short: 'Putrajaya', mode: 'MRT', code: 'PYL', color: '#FCD330', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/mrt-putrajaya.png', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['PYL'] } },
  { id: 'monorail', name: 'KL Monorail Line', short: 'Monorail', mode: 'MONORAIL', code: 'MRL', color: '#80BD01', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/monorail.png', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['MR'] } },
  { id: 'brt-sunway', name: 'BRT Sunway Line', short: 'BRT Sunway', mode: 'BRT', code: 'BRT', color: '#115740', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['BRT'] } },

  // Express Rail Link (feed erl): no route_color in the feed, colours to be confirmed with ERL
  { id: 'erl-klia-ekspres', name: 'ERL KLIA Ekspres', short: 'KLIA Ekspres', mode: 'ERL', color: '#7B4199', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/erl-klia-ekspres.png', gtfs: { feedId: 'erl', routeIds: ['KE'] } },
  { id: 'erl-klia-transit', name: 'ERL KLIA Transit', short: 'KLIA Transit', mode: 'ERL', color: '#00A9A7', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/erl-klia-transit.png', gtfs: { feedId: 'erl', routeIds: ['KT'] } },

  // Keretapi Tanah Melayu (feed ktmb)
  { id: 'ktm-port-klang', name: 'KTM Port Klang Line', short: 'Port Klang', mode: 'KTM', color: '#EE3124', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/ktm-port-klang.png', gtfs: { feedId: 'ktmb', routeIds: ['KA15_KD19'] } },
  { id: 'ktm-seremban', name: 'KTM Seremban Line', short: 'Seremban', mode: 'KTM', color: '#0067B1', textColor: '#FFFFFF', colorSource: 'operator', icon: '/lines/myrapid/ktm-seremban.png', gtfs: { feedId: 'ktmb', routeIds: ['KC05_KB18'] } },
  { id: 'ktm-shuttle-selatan', name: 'KTM Shuttle Selatan (JB Sentral – Paloh)', short: 'Shuttle Selatan', mode: 'KTM', color: '#0A3D7A', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['SS'] } },
  { id: 'ktm-padang-besar', name: 'KTM Padang Besar Line', short: 'Padang Besar', mode: 'KTM', color: '#018000', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['100_47300'] } },
  { id: 'ktm-ipoh', name: 'KTM Ipoh Line', short: 'Ipoh', mode: 'KTM', color: '#1964B7', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['100_9000'] } },
  { id: 'ktm-ets', name: 'KTM ETS', short: 'ETS', mode: 'ETS', color: '#FFC72C', textColor: '#000000', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['ETS'] } },
  { id: 'ktm-intercity', name: 'KTM Intercity', short: 'Intercity', mode: 'KTM', color: '#6E6E6E', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'ktmb', routeIds: ['ERT', 'SH', 'ST'] } },
]

export const LINES_BY_ID: Record<string, Line> = Object.fromEntries(LINES.map((l) => [l.id, l]))

// Rail lines grouped for the line picker (headings translated by `key`)
export const LINE_GROUPS: { key: 'linesGroupRapid' | 'linesGroupKtm' | 'linesGroupAirport'; ids: string[] }[] = [
  { key: 'linesGroupRapid', ids: ['lrt-ampang', 'lrt-sri-petaling', 'lrt-kelana-jaya', 'lrt-shah-alam', 'mrt-kajang', 'mrt-putrajaya', 'monorail', 'brt-sunway'] },
  { key: 'linesGroupKtm', ids: ['ktm-port-klang', 'ktm-seremban', 'ktm-ets', 'ktm-intercity', 'ktm-padang-besar', 'ktm-ipoh', 'ktm-shuttle-selatan'] },
  { key: 'linesGroupAirport', ids: ['erl-klia-ekspres', 'erl-klia-transit'] },
]

// Find a line from a GTFS route (e.g. a plan-trip leg's feed + route)
export function lineForRoute(feedId: string, routeId: string): Line | undefined {
  return LINES.find((l) => l.gtfs.feedId === feedId && l.gtfs.routeIds.includes(routeId))
}

// ---------- line search (fuzzy: tolerates typos and partial words) ----------

// Other names riders use for a line
const LINE_ALIASES: Record<string, string[]> = {
  'lrt-kelana-jaya': ['klj', 'kj', 'gombak putra heights'],
  'lrt-ampang': ['agl'],
  'lrt-sri-petaling': ['spl', 'puchong'],
  'lrt-shah-alam': ['lrt3', 'klang bandar utama johan setia'],
  'mrt-kajang': ['sbk', 'sungai buloh kajang', 'mrt1'],
  'mrt-putrajaya': ['ssp', 'sungai buloh serdang putrajaya', 'mrt2'],
  monorail: ['monorel', 'mono', 'mrl'],
  'brt-sunway': ['sunway bus rapid'],
  'erl-klia-ekspres': ['airport express klia2 lapangan terbang'],
  'erl-klia-transit': ['airport putrajaya cyberjaya lapangan terbang'],
  'ktm-port-klang': ['komuter commuter pelabuhan klang tanjung malim'],
  'ktm-seremban': ['komuter commuter batu caves tampin'],
  'ktm-shuttle-selatan': ['komuter johor paloh'],
  'ktm-padang-besar': ['komuter utara butterworth'],
  'ktm-ipoh': ['komuter utara butterworth'],
  'ktm-ets': ['electric train service intercity'],
  'ktm-intercity': ['ekspres rakyat timuran tebrau shuttle'],
}

const words = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)

// Damerau-Levenshtein distance (a swap of two letters counts as one typo)
function editDistance(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
    }
  return d[a.length][b.length]
}

// typos allowed for a typed word of this length
const allowed = (n: number) => (n <= 3 ? 0 : n <= 6 ? 1 : 2)

// how well one typed word fits a word of the line (0 = exact / prefix); Infinity = no match
function wordScore(typed: string, word: string) {
  if (word.startsWith(typed)) return 0
  if (/\d/.test(typed)) return Infinity // numbers (bus codes, "Seksyen 7") must match exactly, no typos
  const full = editDistance(typed, word)
  const prefix = typed.length < word.length ? editDistance(typed, word.slice(0, typed.length)) : full
  const best = Math.min(full, prefix + 0.5)
  return best <= allowed(typed.length) + 0.5 ? best : Infinity
}

// Smart match of a search against any text (help questions, names): every typed word must fit some word
// of the text, typos allowed except in numbers. Lower = better; null = no match.
export function smartScore(query: string, text: string): number | null {
  const typed = words(query), vocab = words(text)
  if (!typed.length) return 0
  let score = 0
  for (const t of typed) {
    score += Math.min(...vocab.map((w) => wordScore(t, w)))
    if (score === Infinity) return null
  }
  return score
}

// "T 789", "t789", "bus T789", "T0789" -> "T789" (leading zeros dropped, as in the database's route_code_key)
const codeKey = (s: string) => s.toUpperCase().replace(/\bBUS\b/g, '').replace(/[^A-Z0-9]/g, '').replace(/^([A-Z]+)0+(\d)/, '$1$2')

// A route code typed on its own ("T789", "789", "T78", "400", "KGL"): exact code first, then codes that
// start with it, then the number without its letters (789 -> T789), then a code one character shorter than
// what was typed (T4113 -> T411). null = not a code search for this line.
function codeScore(typed: string, code: string) {
  const c = codeKey(code)
  if (!typed || !c) return null
  if (c === typed) return -3
  const digits = c.replace(/^[A-Z]+/, '')
  if (/^\d+$/.test(typed) && digits === typed) return -2.5
  if (c.startsWith(typed)) return -2 + (c.length - typed.length) * 0.01
  if (/^\d+$/.test(typed) && digits.startsWith(typed)) return -1.5 + (digits.length - typed.length) * 0.01
  // one character too many ("T4113" -> T411): offer the nearest real code rather than nothing
  if (typed.length === c.length + 1 && typed.startsWith(c)) return -0.5
  return null
}

// Lines matching a search, best first: a route code match wins, otherwise every typed word must fit some
// word of the line (typos allowed, except in numbers). `extra` = bus routes from the database; rail lines
// win ties, and the list stops at 40.
export function matchLines(query: string, extra: Line[] = []): Line[] {
  const typed = words(query)
  if (!typed.length) return []
  const all = [...LINES, ...extra]
  const qc = codeKey(query)
  const scored: { line: Line; score: number }[] = []
  for (const l of all) {
    const cs = l.code ? codeScore(qc, l.code) : null
    if (cs !== null) {
      scored.push({ line: l, score: cs })
      continue
    }
    const vocab = words([l.name, l.code ?? '', l.mode, l.id, ...(LINE_ALIASES[l.id] ?? [])].join(' '))
    let score = 0
    for (const t of typed) {
      score += Math.min(...vocab.map((w) => wordScore(t, w)))
      if (score === Infinity) break
    }
    if (score !== Infinity) scored.push({ line: l, score })
  }
  return scored.sort((a, b) => a.score - b.score || all.indexOf(a.line) - all.indexOf(b.line)).slice(0, 40).map((s) => s.line)
}

// Buses aren't in LINES (hundreds of routes). Their badge uses the route's own GTFS colour when the
// operator publishes one (Rapid KL stage buses do), otherwise RONDA navy (MRT feeder buses, bus stops).
export const BUS_FALLBACK_COLOR = '#1F2F5C'

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

const GLYPHS: Record<'bus', string> = {
  bus: 'M12,2C8,2,4,2.5,4,6v9.5c0,0.95,0.38,1.81,1,2.44V20c0,0.55,0.45,1,1,1h1c0.55,0,1-0.45,1-1 v-1h8v1c0,0.55,0.45,1,1,1h1c0.55,0,1-0.45,1-1v-2.06c0.62-0.63,1-1.49,1-2.44V6C20,2.5,16.42,2,12,2z M8.5,16 C7.67,16,7,15.33,7,14.5S7.67,13,8.5,13s1.5,0.67,1.5,1.5S9.33,16,8.5,16z M15.5,16c-0.83,0-1.5-0.67-1.5-1.5s0.67-1.5,1.5-1.5 s1.5,0.67,1.5,1.5S16.33,16,15.5,16z M18,10H6V7h12V10z', // Icons.directions_bus_filled
}


// Standalone SVG markup for a line badge (used by the website component and the file export), in the style of the
// operator's line icons: a rounded square in the line colour with a white train front. Our own drawing, not their
// artwork. MRT: angular front with "MRT"; LRT: rounded front on tracks; Monorail: on a beam; KTM / ETS / KLIA: rounded
// front with the name under it; BRT and buses: the bus glyph.
const FRONT = 'M16 7h16a6 6 0 0 1 6 6v12c0 6-6 10-14 10S10 31 10 25V13a6 6 0 0 1 6-6z'
const FRONT_WINDOW = 'M15 13.5c0-2 1-3 3-3h12c2 0 3 1 3 3c0 5-4 8-9 8s-9-3-9-8z'
const MRT_FRONT = 'M15 7h18l5 7v16l-6 7H16l-6-7V14z'
const MRT_WINDOW = 'M16.6 11h14.8l3 4.4V23H13.6v-7.6z'
function badgeGlyph(line: Line): string {
  const c = line.color, w = line.textColor
  const lights = `<ellipse cx="17" cy="27" rx="2.8" ry="1.5" fill="${c}"/><ellipse cx="31" cy="27" rx="2.8" ry="1.5" fill="${c}"/>`
  const front = `<path fill="${w}" d="${FRONT}"/><path fill="${c}" d="${FRONT_WINDOW}"/>` + lights
  const label = (text: string) =>
    `<text x="24" y="44.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${text.length > 3 ? 7.5 : 8.5}" fill="${w}">${text}</text>`
  switch (line.mode) {
    case 'MRT':
      return `<path fill="${w}" d="${MRT_FRONT}"/><path fill="${c}" d="${MRT_WINDOW}"/>` +
        `<text x="24" y="33.5" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="6" fill="${c}">MRT</text>` +
        `<path fill="${w}" d="M13 40h22v2.2H13z"/>`
    case 'LRT':
      return front + `<path fill="${w}" d="M12.6 37h2.6l-4.2 6H8.4zM32.8 37h2.6l4.2 6h-2.6zM13 40.6h22v1.7H13z"/>`
    case 'MONORAIL':
      return front + `<path fill="${w}" d="M9 39h30v4.5H9z"/>`
    case 'KTM':
      return front + label('KTM')
    case 'ETS':
      return front + label('ETS')
    case 'ERL':
      return front + label('KLIA')
    default:
      return `<path transform="translate(11 11) scale(1.0833)" fill="${w}" d="${GLYPHS.bus}"/>`
  }
}
export function lineBadgeSvg(line: Line, opts: { title?: boolean } = {}): string {
  const title = opts.title === false ? '' : `<title>${escapeXml(line.name)}</title>`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="${escapeXml(line.name)}">` +
    title +
    `<rect width="48" height="48" rx="9" fill="${line.color}"/>` +
    badgeGlyph(line) +
    `</svg>`
  )
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
}
