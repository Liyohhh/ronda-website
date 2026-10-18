import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import Icon from './Icon'
import { Accent, Eyebrow, Reveal } from './Motion'
import { FEATURES, OPEN_LANGUAGE_MENU, type Feature } from '../data/features'
import { LINES_BY_ID } from '../data/lines'

// "Everything you need for the journey", arranged the way transit apps present themselves (Transit, Citymapper,
// Omio, Bolt): one spotlight for what is live right now, then the features grouped by what a rider wants to do,
// each with a single plain line on what it does. Only what RONDA does today; planned things say "Coming soon".

const GROUPS: { title: TranslationKey; keys: Feature['key'][] }[] = [
  { title: 'featGroupPlan', keys: ['feat_directions', 'feat_places', 'feat_fares', 'feat_lines'] },
  { title: 'featGroupExplore', keys: ['feat_trails', 'feat_ronda300', 'feat_airport'] },
  { title: 'featGroupYou', keys: ['feat_saved', 'feat_languages', 'feat_alerts'] },
]
const desc = (k: Feature['key']) => `featD_${k.slice(5)}` as TranslationKey

// the spotlight's drawing: three lines in their official colours with vehicles gliding along them
const ROUTES: [string, string][] = [
  ['lrt-kelana-jaya', 'M20 150 C 120 150, 160 70, 260 70 S 400 110, 500 40'],
  ['mrt-kajang', 'M20 40 C 140 40, 200 130, 320 130 S 440 150, 500 150'],
  ['ktm-port-klang', 'M60 190 C 180 170, 300 30, 470 10'],
]

function FeatureGrid() {
  const { t } = useLanguage()
  const byKey = Object.fromEntries(FEATURES.map((f) => [f.key, f])) as Record<Feature['key'], Feature>

  const row = (f: Feature) => {
    const body = (
      <>
        <span aria-hidden="true" className="mt-0.5 w-10 h-10 flex-shrink-0 rounded-xl bg-white border border-[#DCD4C8] flex items-center justify-center" style={{ color: f.color }}>
          <Icon name={f.icon} size={20} />
        </span>
        <span className="min-w-0 flex-1 text-start">
          <span className="flex flex-wrap items-center gap-2 font-semibold text-[#222D52]">
            {t(f.key)}
            {f.soon && <span className="rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#222D52]">{t('soon')}</span>}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-gray-600">{t(desc(f.key))}</span>
        </span>
        <Icon name="chevronRight" size={18} className="mt-2.5 flex-shrink-0 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-[#222D52] rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
      </>
    )
    const cls = 'group flex w-full items-start gap-3.5 rounded-2xl p-3 transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
    return f.to ? (
      <Link to={f.to} className={cls}>{body}</Link>
    ) : (
      <button type="button" className={cls} aria-haspopup="listbox" onClick={() => window.dispatchEvent(new CustomEvent(OPEN_LANGUAGE_MENU))}>{body}</button>
    )
  }

  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="wrap pt-24 md:pt-32 pb-20 md:pb-28">
        <Reveal><Eyebrow>RONDA</Eyebrow></Reveal>
        <h2 id="features-title" className="mt-5 max-w-2xl [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]">
          <Accent text={t('featuresTitle')} />
        </h2>

        {/* spotlight: the live map */}
        <Reveal className="mt-10 relative overflow-hidden rounded-[28px] bg-[#222D52] text-white grid md:grid-cols-[1fr_1.1fr] items-center">
          <div className="relative p-7 md:p-10">
            <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-gold-light">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold-light opacity-60 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-gold-light" />
              </span>
              {t('navLive')}
            </p>
            <h3 className="mt-3 font-display text-[30px] md:text-[38px] leading-tight font-semibold"><Accent text={t('liveMapTitle')} dark /></h3>
            <p className="mt-3 max-w-md text-white/80">{t('liveMapDetail')}</p>
            <Link to="/live" className="mt-6 inline-flex items-center gap-1.5 h-11 px-5 rounded-full bg-gold text-sm font-bold text-[#222D52] hover:bg-gold-hover transition-colors">
              {t('featLiveCta')}
              <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
            </Link>
          </div>
          <svg viewBox="0 0 520 200" className="block w-full h-auto p-4 md:p-6" aria-hidden="true" focusable="false">
            <g fill="none" strokeWidth="6" strokeLinecap="round" opacity="0.9">
              {ROUTES.map(([id, d]) => <path key={id} d={d} stroke={LINES_BY_ID[id].color} />)}
            </g>
            {ROUTES.map(([id, d], i) => (
              <circle key={`v-${id}`} r="7" fill="#FFFFFF" stroke={LINES_BY_ID[id].color} strokeWidth="4">
                <animateMotion dur={`${9 + i * 3}s`} repeatCount="indefinite" path={d} begin={`-${i * 2}s`} />
              </circle>
            ))}
          </svg>
        </Reveal>

        {/* the features, grouped */}
        <div className="mt-3 grid gap-3 lg:grid-cols-3" data-testid="feature-tiles">
          {GROUPS.map((g, gi) => (
            <Reveal key={g.title} delay={gi * 0.08} className="rounded-[28px] border border-[#DCD4C8] bg-cream p-4 md:p-5">
              <h3 className="px-3 pt-2 text-xs font-bold uppercase tracking-[0.22em] text-gold-deep">{t(g.title)}</h3>
              <ul className="mt-3 space-y-1">
                {g.keys.map((k) => <li key={k}>{row(byKey[k])}</li>)}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureGrid
