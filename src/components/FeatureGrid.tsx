import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import Icon from './Icon'
import { Eyebrow, Reveal } from './Motion'
import { FEATURES, OPEN_LANGUAGE_MENU, type Feature } from '../data/features'
import { LINES_BY_ID } from '../data/lines'

// metro-style lines for the drawing under the features: [line id (for its official colour), path]
const NETWORK: [string, string][] = [
  ['lrt-kelana-jaya', 'M40 300 C 220 300, 300 140, 520 140 S 820 220, 1000 120 S 1160 60, 1240 60'],
  ['mrt-kajang', 'M60 60 C 260 60, 360 220, 560 230 S 900 300, 1100 300 S 1220 300, 1240 300'],
  ['lrt-ampang', 'M640 20 C 640 110, 600 180, 560 230 S 480 330, 480 340'],
  ['mrt-putrajaya', 'M300 20 C 360 120, 470 150, 520 140 S 700 60, 900 40'],
  ['monorail', 'M760 196 C 820 170, 860 230, 900 260'],
  ['ktm-seremban', 'M20 200 C 300 210, 700 330, 1240 220'],
]

// Dark band (Blaze "where to find us"): a centred label and heading, the features as columns split by thin lines,
// then a drawing of a metro network in the official line colours (a drawing, not a map).
function FeatureGrid() {
  const { t } = useLanguage()
  const body = (f: Feature) => (
    <>
      {f.soon && (
        <span className="absolute top-2 end-2 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {t('soon')}
        </span>
      )}
      <span className="w-12 h-12 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white" aria-hidden="true">
        <Icon name={f.icon} size={22} />
      </span>
      <span className="text-base md:text-lg font-bold leading-snug tracking-[-0.01em] text-white">{t(f.key)}</span>
    </>
  )
  const tileClass =
    'group relative h-full w-full px-4 py-6 flex flex-col items-center text-center gap-4 rounded-2xl transition-colors hover:bg-white/5 ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 md:pt-24 pb-16 md:pb-20">
        <div className="text-center">
          <Reveal><Eyebrow tone="dark" icon={<Icon name="locationOn" size={18} />}>RONDA</Eyebrow></Reveal>
          <h2 id="features-title" className="mt-6 mx-auto max-w-3xl [text-wrap:balance] text-[40px] md:text-[64px] leading-[1.05] font-bold tracking-[-0.05em] text-white">
            {t('featuresTitle')}
          </h2>
        </div>
        <ul className="mt-14 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-y-4" data-testid="feature-tiles">
          {FEATURES.map((f, i) => (
            <Reveal as="li" key={f.key} delay={(i % 5) * 0.06} className="relative lg:[&:not(:nth-child(5n+1))]:border-s border-white/10">
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
            </Reveal>
          ))}
        </ul>

        <Reveal className="mt-12 overflow-hidden rounded-[32px] border border-white/10 bg-[#141d33]">
          <svg viewBox="0 0 1280 360" className="block w-full h-auto" aria-hidden="true" focusable="false">
            <g opacity="0.08" fill="#ffffff">
              {Array.from({ length: 18 * 52 }, (_, i) => (
                <circle key={i} cx={12 + (i % 52) * 25} cy={10 + Math.floor(i / 52) * 20} r="1.4" />
              ))}
            </g>
            <g fill="none" strokeLinecap="round" strokeLinejoin="round">
              {NETWORK.map(([id, d]) => <path key={id} d={d} stroke={LINES_BY_ID[id].color} strokeWidth="9" />)}
              {/* stations: evenly spaced dots along each line (a dash pattern of zero-length dashes with round ends),
                  a ring in the line colour with a white middle */}
              {NETWORK.map(([id, d]) => (
                <g key={`st-${id}`}>
                  <path d={d} pathLength={100} stroke={LINES_BY_ID[id].color} strokeWidth="20" strokeDasharray="0 24" strokeDashoffset="-12" />
                  <path d={d} pathLength={100} stroke="#ffffff" strokeWidth="10" strokeDasharray="0 24" strokeDashoffset="-12" />
                </g>
              ))}
            </g>
          </svg>
        </Reveal>
      </div>
    </section>
  )
}

export default FeatureGrid
