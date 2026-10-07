import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import Icon from '../components/Icon'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import type { IconName } from '../data/icons'

// /services: chauffeur hire and private-car / airport transfers. Enquiries go through the Help Centre.
// Place names and vehicle classes are proper nouns and stay the same in every language.

type Card = { id: string; icon: IconName; title: TranslationKey; text: TranslationKey | string }

const CHAUFFEUR: Card[] = [
  { id: 'chauffeur', icon: 'scheduleOutline', title: 'svc_hourly', text: 'svc_hourly_d' },
  { id: 'chauffeur-day', icon: 'directionsCar', title: 'svc_fullday', text: 'svc_fullday_d' },
  { id: 'chauffeur-events', icon: 'event', title: 'svc_corporate', text: 'svc_corporate_d' },
]
const TRANSFER: Card[] = [
  { id: 'transfer', icon: 'flightLand', title: 'navCarTransfer', text: 'svc_private_d' },
  { id: 'transfer-van', icon: 'airportShuttle', title: 'svc_van', text: 'svc_upTo' },
  { id: 'transfer-coach', icon: 'directionsBusOutline', title: 'svc_coach', text: 'KL Sentral ↔ KLIA T1 / T2' },
]
const DAY_TRIPS = ['Kuala Lumpur', 'Putrajaya', 'Melaka', 'Genting Highlands', 'Kuala Selangor']
const VEHICLES: [string, number | string][] = [
  ['Sedan', 3],
  ['MPV', 6],
  ['Premium MPV', 'Toyota Alphard / Vellfire'],
  ['Van', 10],
]

function Section({ id, icon, title, text, cards, children }: { id: string; icon: IconName; title: TranslationKey; text: TranslationKey; cards: Card[]; children?: ReactNode }) {
  const { t } = useLanguage()
  const say = (x: TranslationKey | string) => (x.startsWith('svc_') || x.startsWith('nav') ? t(x as TranslationKey).replace('{n}', '10') : x)
  return (
    <section aria-labelledby={`${id}-title`} className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-10">
      <div className="flex items-start gap-4">
        <span className="w-14 h-14 rounded-2xl bg-[#8E3424] text-white flex items-center justify-center flex-shrink-0" aria-hidden="true">
          <Icon name={icon} size={30} />
        </span>
        <div>
          <h2 id={`${id}-title`} className="text-2xl md:text-3xl font-bold text-[#8E3424]">
            {t(title)}
          </h2>
          <p className="mt-1 text-gray-600">{t(text)}</p>
        </div>
      </div>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li key={c.id} id={c.id} className="scroll-mt-28 rounded-2xl bg-gray-50 border border-gray-200 p-5">
            <span className="w-10 h-10 rounded-full bg-[#8E3424]/8 text-[#8E3424] flex items-center justify-center" aria-hidden="true">
              <Icon name={c.icon} size={22} />
            </span>
            <h3 className="mt-3 font-semibold text-gray-900">{say(c.title)}</h3>
            <p className="mt-1 text-sm text-gray-600">{say(c.text)}</p>
          </li>
        ))}
      </ul>
      {children}
      <Link to="/help/general#services" className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-[#8E3424] px-6 py-3 text-sm font-semibold text-white hover:bg-[#A14532]">
        {t('svc_enquire')}
        <Icon name="chevronRight" size={18} className="rtl:rotate-180" />
      </Link>
    </section>
  )
}

function Services() {
  const { t } = useLanguage()
  const { hash } = useLocation()

  // /services#transfer etc. scrolls to that service
  useEffect(() => {
    if (!hash) return
    const el = document.getElementById(decodeURIComponent(hash.slice(1)))
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <SiteLayout>
      <div className="bg-[#5E1F15] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <h1 className="text-3xl md:text-5xl font-bold">{t('navServices')}</h1>
          <p className="mt-3 max-w-2xl text-white/80 md:text-lg">{t('svc_intro')}</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 pb-16 space-y-8">
        <Section id="chauffeur-section" icon="badge" title="navChauffeur" text="svc_chauffeurText" cards={CHAUFFEUR}>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-[#8E3424]">{t('svc_daytrips')}</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {DAY_TRIPS.map((d) => (
                  <li key={d} className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-800">
                    <Icon name="locationOn" size={16} className="text-[#8E3424]" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-[#8E3424]">{t('svc_vehicles')}</h3>
              <ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-200">
                {VEHICLES.map(([name, cap]) => (
                  <li key={name} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                    <span className="font-medium text-gray-900">{name}</span>
                    <span className="text-gray-600">{typeof cap === 'number' ? t('svc_upTo').replace('{n}', String(cap)) : cap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        <Section id="transfer-section" icon="directionsCar" title="navCarTransfer" text="svc_transferText" cards={TRANSFER} />
      </div>
    </SiteLayout>
  )
}

export default Services
