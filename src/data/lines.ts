// RONDA rail lines: names, official colours and badge artwork, in one place.
//
// Colours: `colorSource: 'operator'` = the line icons on Prasarana's own site (myrapid.com.my line pages: Rapid KL
//   lines, KTM Port Klang and Seremban Lines, KLIA Ekspres and KLIA Transit; sampled from the icon files 15 Oct 2026);
//   `'gtfs'` = the operator's GTFS feed (route_color) for lines MyRapid does not show (other KTMB lines, BRT).
// Don't invent colours for new lines: take them from the operator.
// Icons: every line uses our own vector drawing in the style of MyRapid's line legend (lineBadgeSvg), so all badges
//   match and stay sharp at any size. Prasarana's icon files (public/lines/myrapid, downloaded from myrapid.com.my
//   15 Oct 2026 at the owner's request) are no longer shown; they stay on record for the operator permission letter.
//
// Plain data + string builders (no React), so scripts/export-line-badges.ts can reuse it to
// write public/lines/*.svg for the app and other repos.

import { FA_BUS } from './operatorIcons.ts'

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
  gtfs: { feedId: string; routeIds: string[] }
}

export const LINES: Line[] = [
  // Prasarana rapidKL rail (feed rapid-rail-kl)
  { id: 'lrt-ampang', name: 'LRT Ampang Line', short: 'Ampang', mode: 'LRT', code: 'AGL', color: '#EB7203', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['AG'] } },
  { id: 'lrt-sri-petaling', name: 'LRT Sri Petaling Line', short: 'Sri Petaling', mode: 'LRT', code: 'SPL', color: '#7A212E', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['PH'] } },
  { id: 'lrt-kelana-jaya', name: 'LRT Kelana Jaya Line', short: 'Kelana Jaya', mode: 'LRT', code: 'KJL', color: '#DD0330', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['KJ'] } },
  { id: 'lrt-shah-alam', name: 'LRT Shah Alam Line', short: 'Shah Alam', mode: 'LRT', code: 'SAL', color: '#00A7E0', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['SA'] } },
  { id: 'mrt-kajang', name: 'MRT Kajang Line', short: 'Kajang', mode: 'MRT', code: 'KGL', color: '#047835', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['KGL'] } },
  { id: 'mrt-putrajaya', name: 'MRT Putrajaya Line', short: 'Putrajaya', mode: 'MRT', code: 'PYL', color: '#FCD330', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['PYL'] } },
  { id: 'monorail', name: 'KL Monorail Line', short: 'Monorail', mode: 'MONORAIL', code: 'MRL', color: '#80BD01', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['MR'] } },
  { id: 'brt-sunway', name: 'BRT Sunway Line', short: 'BRT Sunway', mode: 'BRT', code: 'BRT', color: '#115740', textColor: '#FFFFFF', colorSource: 'gtfs', gtfs: { feedId: 'rapid-rail-kl', routeIds: ['BRT'] } },

  // Express Rail Link (feed erl): no route_color in the feed, colours to be confirmed with ERL
  { id: 'erl-klia-ekspres', name: 'ERL KLIA Ekspres', short: 'KLIA Ekspres', mode: 'ERL', color: '#7B4199', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'erl', routeIds: ['KE'] } },
  { id: 'erl-klia-transit', name: 'ERL KLIA Transit', short: 'KLIA Transit', mode: 'ERL', color: '#00A9A7', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'erl', routeIds: ['KT'] } },

  // Keretapi Tanah Melayu (feed ktmb)
  { id: 'ktm-port-klang', name: 'KTM Port Klang Line', short: 'Port Klang', mode: 'KTM', color: '#EE3124', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'ktmb', routeIds: ['KA15_KD19'] } },
  { id: 'ktm-seremban', name: 'KTM Seremban Line', short: 'Seremban', mode: 'KTM', color: '#0067B1', textColor: '#FFFFFF', colorSource: 'operator', gtfs: { feedId: 'ktmb', routeIds: ['KC05_KB18'] } },
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
export const BUS_FALLBACK_COLOR = '#14213D'

export function busLine(color?: string | null, name = 'Bus'): Line {
  const c = color ? (color.startsWith('#') ? color : `#${color}`) : BUS_FALLBACK_COLOR
  return { id: 'bus', name, mode: 'BUS', color: c.toUpperCase(), textColor: '#FFFFFF', colorSource: color ? 'gtfs' : 'unverified', gtfs: { feedId: '', routeIds: [] } }
}

// Distinct rail lines serving a stop, in LINES order (for interchange stations)
export function linesForStop(feedId: string, routeIds: string[] = []): Line[] {
  return LINES.filter((l) => l.gtfs.feedId === feedId && l.gtfs.routeIds.some((r) => routeIds.includes(r)))
}

// ---------- badge artwork ----------

// Standalone SVG markup for a line badge (used by the website component and the file export), drawn in the style of
// MyRapid's line legend (myrapid.com.my, checked 15 Oct 2026): a rounded square in the line colour with a white
// vehicle. Our own vector drawing, sharp at any size, the same for every line:
//   LRT / Monorail: rounded train front on rails; MRT: angular front with "MRT"; KTM / ETS: the train front with the
//   name under it; KLIA Transit: a small train front over "KLIA transit"; KLIA Ekspres: the train from the side over
//   "KLIA ekspres"; BRT and buses: MyRapid's bus icon (Font Awesome Free, CC BY 4.0).
// 48 x 48 viewBox.
const BODY = 'M24 4.3C33 4.3 37.1 7.1 37.6 14L38 26.2C38 29.6 35.2 31.4 31.3 31.4H16.7C12.8 31.4 10 29.6 10 26.2L10.4 14C10.9 7.1 15 4.3 24 4.3Z'
const WINDOW = 'M15.6 10.7H32.4C33.4 10.7 34 11.5 33.8 12.5C33 18.6 29 23 24 23S15 18.6 14.2 12.5C14 11.5 14.6 10.7 15.6 10.7Z'
const LIGHTS = 'M12.8 27.4C14.8 27.2 16.7 27.9 17.7 29.6C15.7 29.8 13.8 29.1 12.8 27.4ZM35.2 27.4C33.2 27.2 31.3 27.9 30.3 29.6C32.3 29.8 34.2 29.1 35.2 27.4Z'
const RAILS = 'M11.6 32.3H14.2L8 41H4.9ZM36.4 32.3H33.8L40 41H43.1ZM14.6 34.1H33.4V35.2H14.6ZM12.9 37.1H35.1V38.2H12.9Z'
const MRT_BODY = 'M16 8H32C33.5 8 34.6 8.8 35.2 10.2L38.6 22C38.9 23 39 24 39 25V34C39 35 38.6 35.8 37.8 36.6L33.6 41.4C33 42 32.2 42.4 31.4 42.4H16.6C15.8 42.4 15 42 14.4 41.4L10.2 36.6C9.4 35.8 9 35 9 34V25C9 24 9.1 23 9.4 22L12.8 10.2C13.4 8.8 14.5 8 16 8Z'
const MRT_WINDOW = 'M17 11H31C32 11 32.8 11.6 33.1 12.6L35.8 22.4C36.1 23.6 35.2 24.8 34 24.8H14C12.8 24.8 11.9 23.6 12.2 22.4L14.9 12.6C15.2 11.6 16 11 17 11Z'
const ERL_SIDE = 'M6 10H31C34.5 10 37.5 11.8 39.6 14.6L42.6 18.6C43.2 19.4 42.6 20.4 41.6 20.4H6Z'

const textEl = (x: number, y: number, size: number, fill: string, text: string, weight = 700) =>
  `<text x="${x}" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-weight="${weight}" font-size="${size}" fill="${fill}">${text}</text>`

function trainFront(c: string, w: string, rails: boolean) {
  return `<path fill="${w}" d="${BODY}"/><path fill="${c}" d="${WINDOW}"/><path fill="${c}" d="${LIGHTS}"/>` +
    (rails ? `<path fill="${w}" d="${RAILS}"/>` : '')
}

function badgeGlyph(line: Line): string {
  const c = line.color, w = line.textColor
  switch (line.mode) {
    case 'LRT':
    case 'MONORAIL':
      return trainFront(c, w, true)
    case 'MRT':
      return `<path fill="${w}" d="${MRT_BODY}"/><path fill="${c}" d="${MRT_WINDOW}"/>` +
        `<path fill="none" stroke="${c}" stroke-width="1.2" stroke-linecap="round" d="M14.8 30.4L16.6 32.4L18.4 31.4M33.2 30.4L31.4 32.4L29.6 31.4"/>` +
        textEl(24, 39.4, 4.6, c, 'MRT')
    case 'KTM':
    case 'ETS':
      // the train on rails, a little smaller, with the name under it
      return `<g transform="translate(4.8 0.6) scale(0.8)">${trainFront(c, w, true)}</g>` + textEl(24, 44.6, 8.6, w, line.mode)
    case 'ERL':
      if (line.id === 'erl-klia-transit') {
        return `<g transform="translate(15.6 1.8) scale(0.35)">${trainFront(c, w, false)}</g>` +
          `<path fill="${w}" d="M19.6 13.6H28.4V14.5H19.6Z"/>` +
          textEl(24, 30.6, 11.6, w, 'KLIA', 900) + textEl(24, 40, 8.4, w, 'transit')
      }
      return `<path fill="${w}" d="${ERL_SIDE}"/><path fill="${c}" d="M9 12.4H14V15.8H9ZM16 12.4H21V15.8H16ZM34 12.6L38 16H35Z"/>` +
        `<path fill="${w}" d="M6 21.6H41V22.5H6Z"/>` +
        textEl(24, 33.4, 11.6, w, 'KLIA', 900) + textEl(24, 42.4, 8.4, w, 'ekspres')
    default:
      return `<path transform="translate(10 10) scale(0.0546875)" fill="${w}" d="${FA_BUS}"/>`
  }
}
export function lineBadgeSvg(line: Line, opts: { title?: boolean } = {}): string {
  const title = opts.title === false ? '' : `<title>${escapeXml(line.name)}</title>`
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-label="${escapeXml(line.name)}">` +
    title +
    `<rect width="48" height="48" rx="6" fill="${line.color}"/>` +
    badgeGlyph(line) +
    `</svg>`
  )
}

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]!)
}
