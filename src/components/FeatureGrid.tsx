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

// Dark band (Blaze "where to find us"): a centred label and heading, the features as columns split by thin lines,
// then a drawing of a metro network in the official line colours (a drawing, not a map).
function FeatureGrid() {
  const { t } = useLanguage()
  const body = (f: Feature) => (
    <>
      {f.soon && (
        <span className="absolute top-4 end-4 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#14213D]">
          {t('soon')}
        </span>
      )}
      <span className="w-12 h-12 rounded-full border border-gold/30 bg-gold/10 flex items-center justify-center text-gold transition-colors duration-300 group-hover:bg-gold group-hover:text-[#14213D]" aria-hidden="true">
        <Icon name={f.icon} size={22} />
      </span>
      <span className="text-[15px] md:text-base font-bold leading-snug text-white">{t(f.key)}</span>
    </>
  )
  // each tile fills its cell of the grid exactly; the 1 px gaps between cells are the dividing lines
  const tileClass =
    'group relative h-full w-full min-h-[168px] px-4 py-8 flex flex-col items-center justify-center text-center gap-4 bg-[#14213D] transition-colors duration-300 hover:bg-[#1A2A4D] ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-gold'
  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="wrap pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="text-center">
          <Reveal><Eyebrow tone="dark" icon={<Icon name="locationOn" size={18} />}>RONDA</Eyebrow></Reveal>
          <h2 id="features-title" className="mt-6 mx-auto max-w-3xl [text-wrap:balance] text-[40px] md:text-[64px] leading-[1.05] font-bold tracking-[-0.05em] text-white">
            {t('featuresTitle')}
          </h2>
        </div>
        <Reveal>
          <ul className="mt-14 grid grid-cols-2 md:grid-cols-5 gap-px overflow-hidden rounded-[32px] border border-white/10 bg-white/10" data-testid="feature-tiles">
            {FEATURES.map((f) => (
              <li key={f.key} className="relative">
                {f.to ? (
                  <Link to={f.to} className={tileClass}>{body(f)}</Link>
                ) : (
                  <button
                    type="button"
                    className={tileClass}
                    aria-haspopup="listbox"
                    onClick={() => window.dispatchEvent(new CustomEvent(OPEN_LANGUAGE_MENU))}
                  >
                    {body(f)}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-[10px] overflow-hidden rounded-[32px] border border-white/10 bg-[#0B1528]">
          <svg viewBox="0 0 1280 420" className="block w-full h-auto" aria-hidden="true" focusable="false">
            <g opacity="0.07" fill="#ffffff">
              {Array.from({ length: 21 * 32 }, (_, i) => (
                <circle key={i} cx={40 + (i % 32) * 40} cy={20 + Math.floor(i / 32) * 20} r="1.5" />
              ))}
            </g>
            <g transform="translate(0 10)">
              <g fill="none" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
                {DIAGRAM.map(([id, pts]) => (
                  <polyline key={id} points={pts.map((p) => p.join(',')).join(' ')} stroke={LINES_BY_ID[id].color} />
                ))}
              </g>
              {STATIONS.map(([id, st]) =>
                st.map(([x, y]) => <circle key={`${id}${x},${y}`} cx={x} cy={y} r="6" fill="#ffffff" stroke={LINES_BY_ID[id].color} strokeWidth="4" />),
              )}
              {INTERCHANGES.map(([x, y]) => (
                <circle key={`i${x},${y}`} cx={x} cy={y} r="11" fill="#ffffff" stroke="#0B1528" strokeWidth="5" />
              ))}
            </g>
          </svg>
          {/* key: which colour is which line */}
          <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-white/10 px-6 py-5 text-sm text-white/80">
            {DIAGRAM.map(([id]) => (
              <li key={id} className="inline-flex items-center gap-2">
                <span aria-hidden="true" className="h-1.5 w-6 rounded-full" style={{ backgroundColor: LINES_BY_ID[id].color }} />
                {LINES_BY_ID[id].name}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

export default FeatureGrid
