import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import type { IconName } from '../data/icons'
import Icon from './Icon'

// Home page "Services": chauffeur hire and transfers, each card opening its part of the Services page.
type Card = { to: string; icon: IconName; title: TranslationKey; text: TranslationKey | string }
const CARDS: Card[] = [
  { to: '/services#chauffeur', icon: 'scheduleOutline', title: 'svc_hourly', text: 'svc_hourly_d' },
  { to: '/services#chauffeur-day', icon: 'directionsCar', title: 'svc_fullday', text: 'svc_fullday_d' },
  { to: '/services#transfer', icon: 'flightLand', title: 'navCarTransfer', text: 'svc_private_d' },
  { to: '/services#transfer-van', icon: 'airportShuttle', title: 'svc_van', text: 'svc_upTo' },
]

function ServicesSection() {
  const { t } = useLanguage()
  const say = (x: TranslationKey | string) => t(x as TranslationKey).replace('{n}', '10')
  return (
    <section aria-labelledby="services-title" className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="services-title" className="text-2xl md:text-3xl font-bold text-[#1F2F5C]">{t('navServices')}</h2>
          <p className="mt-1 text-gray-500">{t('svc_intro')}</p>
        </div>
        <Link
          to="/services"
          className="hidden sm:inline-flex flex-shrink-0 items-center gap-1 h-10 px-4 rounded-full border border-gray-200 bg-white text-sm font-semibold text-[#1F2F5C] shadow-sm hover:bg-gray-50"
        >
          {t('svc_promoCta')}
          <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
        </Link>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CARDS.map((c) => (
          <li key={c.to}>
            <Link
              to={c.to}
              className="flex h-full items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F2F5C]"
            >
              <span aria-hidden="true" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#1F2F5C] text-white">
                <Icon name={c.icon} size={22} />
              </span>
              <span className="min-w-0">
                <span className="block font-semibold leading-snug text-gray-900">{say(c.title)}</span>
                <span className="mt-1 block text-sm leading-snug text-gray-600">{say(c.text)}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/services" className="sm:hidden mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#1D4ED8]">
        {t('svc_promoCta')}
        <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
      </Link>
    </section>
  )
}

export default ServicesSection
