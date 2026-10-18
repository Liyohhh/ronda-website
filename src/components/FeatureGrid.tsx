import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import Icon from './Icon'
import { Eyebrow, Reveal } from './Motion'
import { FEATURES, OPEN_LANGUAGE_MENU, type Feature } from '../data/features'
import { LINES_BY_ID } from '../data/lines'

// The drawing under the features: a metro diagram in the style of a station map (straight lines, 45 degree bends),
// four lines in their official colours. Lines meet only at interchange stations. [line id, corner points]
const DIAGRAM: [string, [number, number][]][] = [
  ['mrt-putrajaya', [[80, 60], [560, 60], [640, 140], [1200, 140]]],
  ['lrt-kelana-jaya', [[80, 140], [480, 140], [560, 220], [1200, 220]]],
  ['mrt-kajang', [[80, 300], [1200, 300]]],
  ['lrt-ampang', [[640, 60], [640, 360]]],
]
const STEP = 80 // a station every 80 units on straight runs; bends are stations too

// stations of one line: every corner, plus every STEP along level and upright runs
function stations(points: [number, number][]): [number, number][] {
  const out: [number, number][] = []
  points.forEach(([x, y], i) => {
    out.push([x, y])
    const next = points[i + 1]
    if (!next || (next[0] !== x && next[1] !== y)) return // diagonal: corners only
    const [dx, dy] = [Math.sign(next[0] - x), Math.sign(next[1] - y)]
    for (let k = STEP; k < Math.abs(next[0] - x) + Math.abs(next[1] - y); k += STEP) out.push([x + dx * k, y + dy * k])
  })
  return out
}
const STATIONS = DIAGRAM.map(([id, pts]) => [id, stations(pts)] as const)
const seen = new Map<string, number>()
for (const [, st] of STATIONS) for (const [x, y] of st) seen.set(`${x},${y}`, (seen.get(`${x},${y}`) ?? 0) + 1)
const INTERCHANGES = [...seen].filter(([, n]) => n > 1).map(([k]) => k.split(',').map(Number) as [number, number])

// Dark band, drawn as a train route: on the left the label, heading and the station-map drawing stay in view (wide
// screens); on the right every feature is a stop on a gold line, with a station code like the ones on platform signs
// (RD01...). Pointing at a stop lights its station and icon gold; the whole row is the link.
function FeatureGrid() {
  const { t } = useLanguage()
  const body = (f: Feature, i: number) => (
    <>
      {/* the station on the line */}
      <span aria-hidden="true" className="relative z-10 w-5 h-5 rounded-full border-[5px] border-gold bg-[#14213D] transition-colors duration-300 group-hover:bg-gold group-focus-visible:bg-gold" />
      <span aria-hidden="true" className="hidden sm:inline-flex w-14 justify-center rounded-md border border-white/15 py-1 text-[11px] font-bold tracking-wider text-white/70 tabular-nums">
        RD{String(i + 1).padStart(2, '0')}
      </span>
      <span aria-hidden="true" className="w-11 h-11 rounded-full bg-gold/10 flex items-center justify-center text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-[#14213D]">
        <Icon name={f.icon} size={20} />
      </span>
      <span className="flex-1 min-w-0 text-start text-base md:text-lg font-semibold leading-snug text-white">
        {t(f.key)}
        {f.soon && (
          <span className="ms-2 align-middle inline-block rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#14213D]">
            {t('soon')}
          </span>
        )}
      </span>
      <Icon name="chevronRight" size={20} className="flex-shrink-0 text-white/40 transition duration-300 group-hover:text-gold group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
    </>
  )
  const rowClass =
    'group relative w-full flex items-center gap-4 sm:gap-5 py-4 pe-2 rounded-2xl transition-colors duration-300 hover:bg-white/[0.04] ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="wrap pt-20 md:pt-28 pb-20 md:pb-28 grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20 items-start">
        <div className="lg:sticky lg:top-28">
          <Reveal><Eyebrow tone="dark" icon={<Icon name="locationOn" size={18} />}>RONDA</Eyebrow></Reveal>
          <h2 id="features-title" className="mt-6 max-w-xl [text-wrap:balance] text-[40px] md:text-[60px] leading-[1.05] font-bold tracking-[-0.05em] text-white">
            {t('featuresTitle')}
          </h2>

          <Reveal className="mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-[#0B1528]">
            <svg viewBox="0 0 1280 420" className="block w-full h-auto" aria-hidden="true" focusable="false">
              <g opacity="0.07" fill="#ffffff">
                {Array.from({ length: 21 * 32 }, (_, i) => (
                  <circle key={i} cx={40 + (i % 32) * 40} cy={20 + Math.floor(i / 32) * 20} r="1.5" />
                ))}
              </g>
              <g transform="translate(0 10)">
                <g fill="none" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                  {DIAGRAM.map(([id, pts]) => (
                    <polyline key={id} points={pts.map((p) => p.join(',')).join(' ')} stroke={LINES_BY_ID[id].color} />
                  ))}
                </g>
                {STATIONS.map(([id, st]) =>
                  st.map(([x, y]) => <circle key={`${id}${x},${y}`} cx={x} cy={y} r="7" fill="#ffffff" stroke={LINES_BY_ID[id].color} strokeWidth="5" />),
                )}
                {INTERCHANGES.map(([x, y]) => (
                  <circle key={`i${x},${y}`} cx={x} cy={y} r="13" fill="#ffffff" stroke="#0B1528" strokeWidth="6" />
                ))}
              </g>
            </svg>
            {/* key: which colour is which line */}
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 px-6 py-5 text-[13px] text-white/80">
              {DIAGRAM.map(([id]) => (
                <li key={id} className="inline-flex items-center gap-2 min-w-0">
                  <span aria-hidden="true" className="h-1.5 w-5 flex-shrink-0 rounded-full" style={{ backgroundColor: LINES_BY_ID[id].color }} />
                  <span className="truncate">{LINES_BY_ID[id].name}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* the route: a gold line through every stop (the line runs through the middle of the station dots) */}
        <div className="relative">
          <span aria-hidden="true" className="absolute start-[8px] top-9 bottom-9 w-1 rounded-full bg-gold/70" />
          <ul className="relative" data-testid="feature-tiles">
            {FEATURES.map((f, i) => (
              <Reveal as="li" key={f.key} delay={Math.min(i, 6) * 0.05} className="relative after:absolute after:bottom-0 after:start-10 after:end-0 after:h-px after:bg-white/10 last:after:hidden">
                {f.to ? (
                  <Link to={f.to} className={rowClass}>{body(f, i)}</Link>
                ) : (
                  <button
                    type="button"
                    className={rowClass}
                    aria-haspopup="listbox"
                    onClick={() => window.dispatchEvent(new CustomEvent(OPEN_LANGUAGE_MENU))}
                  >
                    {body(f, i)}
                  </button>
                )}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

export default FeatureGrid
