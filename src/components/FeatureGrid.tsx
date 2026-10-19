import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import Icon from './Icon'
import { Accent, Eyebrow, Reveal } from './Motion'
import { FEATURES, OPEN_LANGUAGE_MENU, type Feature } from '../data/features'
import FeatureArt, { type ArtKind } from './FeatureArt'

// "Everything you need for the journey", the way Monzo shows its products: a row of picture cards (Trails always
// first), each a clean drawing of the feature (FeatureArt) on a cream or navy block, then the feature's name, one
// line and a "Learn more" pill (the whole card is the link); on phones the row scrolls sideways. The smaller
// features follow in a ruled strip. (The live map is announced in the lines band, LineMarquee.) Only what RONDA does today;
// planned things say "Coming soon".

const CARDS: { key: Feature['key']; label: TranslationKey; line: TranslationKey; art: ArtKind }[] = [
  { key: 'feat_trails', label: 'trails', line: 'featCardTrails', art: 'trails' },
  { key: 'feat_directions', label: 'directions', line: 'featCardDirections', art: 'directions' },
  { key: 'feat_lines', label: 'lines', line: 'featCardLines', art: 'lines' },
  { key: 'feat_ronda300', label: 's2_title', line: 'featCardR300', art: 'ronda300' },
]

function FeatureGrid() {
  const { t } = useLanguage()
  const byKey = Object.fromEntries(FEATURES.map((f) => [f.key, f])) as Record<Feature['key'], Feature>

  const openLanguages = () => window.dispatchEvent(new CustomEvent(OPEN_LANGUAGE_MENU))
  const small = [byKey.feat_places, byKey.feat_fares, byKey.feat_airport, byKey.feat_saved, byKey.feat_languages, byKey.feat_alerts]

  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="wrap pt-24 md:pt-32 pb-20 md:pb-28">
        <Reveal><Eyebrow>RONDA</Eyebrow></Reveal>
        <h2 id="features-title" className="mt-5 max-w-2xl [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]">
          <Accent text={t('featuresTitle')} />
        </h2>

        <div data-testid="feature-tiles">
          {/* a row of picture cards: a drawing on a colour block, then the name, one line and "Learn more" */}
          <ul className="mt-10 -mx-4 px-4 scroll-px-4 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible">
            {CARDS.map((c, i) => {
              const f = byKey[c.key]
              const dark = i % 2 === 1
              return (
                <Reveal as="li" key={c.key} delay={i * 0.06} className="group relative w-[78%] flex-shrink-0 snap-start sm:w-auto">
                  {/* the picture: a clean drawing of the feature */}
                  <div className={`aspect-square overflow-hidden rounded-[28px] p-5 ${dark ? 'bg-[#222D52]' : 'bg-cream'}`}>
                    <FeatureArt kind={c.art} dark={dark} />
                  </div>
                  <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.01em] text-[#222D52]">
                    <Link to={f.to!} className="after:absolute after:inset-0 after:z-[1] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-gold focus-visible:after:rounded-[28px]">
                      {t(c.label)}
                      <span className="sr-only">. {t(c.line)}</span>
                    </Link>
                  </h3>
                  <p aria-hidden="true" className="mt-2 text-[15px] leading-relaxed text-gray-600">{t(c.line)}</p>
                  <span aria-hidden="true" className="mt-4 inline-flex h-9 items-center rounded-full border-[1.5px] border-[#222D52] px-4 text-sm font-semibold text-[#222D52] transition-colors group-hover:bg-[#222D52] group-hover:text-white">
                    {t('featLearnMore')}
                  </span>
                </Reveal>
              )
            })}
          </ul>

          {/* the smaller features, in a neat strip under the cards */}
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-y border-[#DCD4C8] text-[15px] text-[#222D52]">
            {small.map((f) => {
              const label = (
                <>
                  <span aria-hidden="true" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-cream" style={{ color: f.color }}><Icon name={f.icon} size={18} /></span>
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug">{t(f.key)}</span>
                    {f.soon && <span className="mt-1 inline-block rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#222D52]">{t('soon')}</span>}
                  </span>
                </>
              )
              const cls = 'flex h-full w-full items-center gap-3 py-5 pe-3 text-start transition-colors hover:text-gold-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
              return (
                <li key={f.key}>
                  {f.to
                    ? <Link to={f.to} className={cls}>{label}</Link>
                    : <button type="button" className={cls} aria-haspopup="listbox" onClick={openLanguages}>{label}</button>}
                </li>
              )
            })}
          </ul>
        </div>

      </div>
    </section>
  )
}

export default FeatureGrid
