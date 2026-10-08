import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { IconName } from '../data/icons'
import Icon from './Icon'
import { FEATURES, OPEN_LANGUAGE_MENU, type Feature } from '../data/features'

function DuoIcon({ icon, accent, color }: { icon: IconName; accent: IconName; color: string }) {
  return (
    <span className="relative w-16 h-16" aria-hidden="true">
      <span className="absolute top-0 end-0" style={{ color }}>
        <Icon name={icon} size={46} />
      </span>
      <span className="absolute bottom-0 start-0 w-8 h-8 rounded-full text-white ring-[3px] ring-white flex items-center justify-center" style={{ backgroundColor: color }}>
        <Icon name={accent} size={18} />
      </span>
    </span>
  )
}

const tileClass =
  'relative h-full w-full bg-white rounded-2xl px-4 pt-6 pb-5 flex flex-col items-center text-center gap-3 shadow-lg shadow-black/10 ' +
  'transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white'

// Sits inside the navy band under the "Travel made effortless" slides (see NavyBand)
function FeatureGrid() {
  const { t } = useLanguage()
  const body = (f: Feature) => (
    <>
      {f.soon && (
        <span className="absolute top-2 end-2 rounded-full bg-[#1F2F5C] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {t('soon')}
        </span>
      )}
      <DuoIcon icon={f.icon} accent={f.accent} color={f.color} />
      <span className="text-sm font-semibold leading-snug text-gray-900">{t(f.key)}</span>
    </>
  )
  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 pt-6 pb-8 md:pb-10">
        <h2 id="features-title" className="text-center text-2xl md:text-3xl font-bold text-white">
          {t('featuresTitle')}
        </h2>
        <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4" data-testid="feature-tiles">
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
      </div>
    </section>
  )
}

export default FeatureGrid
