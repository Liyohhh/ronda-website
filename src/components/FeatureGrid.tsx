import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import Icon from './Icon'
import { Accent, Eyebrow, Reveal } from './Motion'
import { FEATURES, OPEN_LANGUAGE_MENU, type Feature } from '../data/features'

// "Everything you need for the journey": the ten features as small cream tiles in a 5 x 2 grid (2 columns on phones),
// like the trust cards of the Ainaa site. Each icon sits in a small white square, in the feature's own colour
// (src/data/features.ts). The whole tile is the link.
function FeatureGrid() {
  const { t } = useLanguage()

  const body = (f: Feature) => (
    <>
      <span aria-hidden="true" className="w-11 h-11 flex-shrink-0 rounded-xl bg-white border border-[#DCD4C8] flex items-center justify-center" style={{ color: f.color }}>
        <Icon name={f.icon} size={22} />
      </span>
      <span className="flex-1 min-w-0 text-start text-[15px] font-semibold leading-snug text-[#222D52]">
        {t(f.key)}
        {f.soon && (
          <span className="mt-1 block w-fit rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#222D52]">{t('soon')}</span>
        )}
      </span>
    </>
  )
  const tileClass =
    'group relative h-full w-full min-h-[84px] flex flex-col items-start sm:flex-row sm:items-center gap-3 sm:gap-4 rounded-[20px] border border-[#DCD4C8] bg-cream p-4 transition duration-300 ' +
    'hover:bg-white hover:shadow-[0_12px_30px_-18px_rgb(34_45_82/0.35)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold'

  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="wrap pt-24 md:pt-32 pb-20 md:pb-28">
        <div>
          <div>
            <Reveal><Eyebrow>RONDA</Eyebrow></Reveal>
            <h2 id="features-title" className="mt-5 max-w-2xl [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]">
              <Accent text={t('featuresTitle')} />
            </h2>
          </div>
        </div>

        <Reveal>
          <ul className="mt-10 grid grid-cols-2 lg:grid-cols-5 gap-3" data-testid="feature-tiles">
            {FEATURES.map((f) => (
              <li key={f.key}>
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
      </div>
    </section>
  )
}

export default FeatureGrid
