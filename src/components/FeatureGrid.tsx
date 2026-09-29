import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import type { IconName } from '../data/icons'
import Icon from './Icon'

// Feature tiles, each with a two-tone icon: a big navy shape and a small light-blue badge on its corner
const FEATURES: { key: TranslationKey; icon: IconName; accent: IconName }[] = [
  { key: 'feat_directions', icon: 'route', accent: 'directionsWalk' },
  { key: 'feat_places', icon: 'locationOn', accent: 'search' },
  { key: 'feat_lines', icon: 'train', accent: 'palette' },
  { key: 'feat_fares', icon: 'payments', accent: 'sell' },
  { key: 'feat_trails', icon: 'hiking', accent: 'map' },
  { key: 'feat_airport', icon: 'flight', accent: 'luggage' },
  { key: 'feat_languages', icon: 'translate', accent: 'chat' },
  { key: 'feat_ronda300', icon: 'myLocation', accent: 'storefront' },
  { key: 'feat_saved', icon: 'bookmark', accent: 'favorite' },
  { key: 'feat_alerts', icon: 'notifications', accent: 'scheduleOutline' },
]

function DuoIcon({ icon, accent }: { icon: IconName; accent: IconName }) {
  return (
    <span className="relative w-16 h-16" aria-hidden="true">
      <span className="absolute top-0 end-0 text-[#002472]">
        <Icon name={icon} size={46} />
      </span>
      <span className="absolute bottom-0 start-0 w-8 h-8 rounded-full bg-[#7f9be0]/85 text-white ring-[3px] ring-white flex items-center justify-center">
        <Icon name={accent} size={18} />
      </span>
    </span>
  )
}

// Sits inside the navy band under the "Travel made effortless" slides (see NavyBand)
function FeatureGrid() {
  const { t } = useLanguage()
  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 md:px-16 lg:px-20 pt-6 pb-8 md:pb-10">
        <h2 id="features-title" className="text-center text-2xl md:text-3xl font-bold text-white">
          {t('featuresTitle')}
        </h2>
        <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {FEATURES.map((f) => (
            <li
              key={f.key}
              className="bg-white rounded-2xl px-4 pt-6 pb-5 flex flex-col items-center text-center gap-3 shadow-lg shadow-black/10 transition-transform hover:-translate-y-1"
            >
              <DuoIcon icon={f.icon} accent={f.accent} />
              <span className="text-sm font-semibold leading-snug text-gray-900">{t(f.key)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default FeatureGrid
