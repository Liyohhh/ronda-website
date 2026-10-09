import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import Icon from './Icon'
import { FEATURES, OPEN_LANGUAGE_MENU, type Feature } from '../data/features'

// Home page "Everything you need for the journey", on the light page like RONDA 300 and Promotions:
// a grid of white cards (icon, title, one line), each a whole-card link.

const cardClass =
  'relative h-full w-full flex flex-row sm:flex-col items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 text-start shadow-sm ' +
  'transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2F5C]'

function FeaturesSection() {
  const { t } = useLanguage()

  const body = (f: Feature) => (
    <>
      {f.soon && (
        <span className="absolute top-3 end-3 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
          {t('soon')}
        </span>
      )}
      <span aria-hidden="true" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#E8F0FE] text-[#1D4ED8]">
        <Icon name={f.icon} size={22} />
      </span>
      <span className={`min-w-0 ${f.soon ? 'pe-24 sm:pe-0' : ''}`}>
        <span className="block font-semibold leading-snug text-gray-900">{t(f.key)}</span>
        <span className="mt-1 block text-sm leading-snug text-gray-600">{t(f.desc)}</span>
      </span>
    </>
  )

  return (
    <section aria-labelledby="features-title" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-14">
      <h2 id="features-title" className="text-2xl md:text-3xl font-bold text-[#1F2F5C]">
        {t('featuresTitle')}
      </h2>

      <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" data-testid="feature-tiles">
        {FEATURES.map((f) => (
          <li key={f.key}>
            {f.to ? (
              <Link to={f.to} className={cardClass}>{body(f)}</Link>
            ) : (
              <button
                type="button"
                className={cardClass}
                aria-haspopup="listbox"
                onClick={() => window.dispatchEvent(new CustomEvent(OPEN_LANGUAGE_MENU))}
              >
                {body(f)}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default FeaturesSection
