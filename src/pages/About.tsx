import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import LineBadge from '../components/LineBadge'
import TrailCover from '../components/TrailCover'
import PhotoCredit from '../components/PhotoCredit'
import { SLIDE_PHOTOS, TRAIL_PHOTOS } from '../data/trailPhotos'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import { busLine } from '../data/lines'
import { isCategoryShown, trailDescKey, trailNameKey } from '../data/trails'
import { useTrails } from '../hooks/useTrails'
import Icon from '../components/Icon'
import type { IconName } from '../data/icons'

// /about: features, how it works, networks, trails and FAQ.
// Planned things are labelled "Coming soon" so the page never promises what isn't built yet.

const FEATURES: { title: TranslationKey; text: TranslationKey; icon: IconName; soon?: boolean }[] = [
  { title: 'feat_directions', text: 'aboutDirectionsText', icon: 'routeOutline' },
  { title: 'feat_trails', text: 'aboutTrailsText', icon: 'hiking' },
  { title: 'feat_ronda300', text: 'aboutRonda300Text', icon: 'adjust', soon: true },
  { title: 'aboutAirportTitle', text: 'aboutAirportText', icon: 'flight' },
  { title: 'aboutMultiTitle', text: 'aboutMultiText', icon: 'translate' },
]

const STEPS: { title: TranslationKey; text: TranslationKey; soon?: TranslationKey }[] = [
  { title: 'how1Title', text: 'how1Text', soon: 'how1Soon' },
  { title: 'how2Title', text: 'how2Text' },
  { title: 'how3Title', text: 'how3Text', soon: 'how3Soon' },
]

// Networks available now: official names with their line badges (ids from src/data/lines.ts)
const NETWORKS_NOW: { name: string; badge: string | 'bus'; note?: TranslationKey }[] = [
  { name: 'MRT Kajang Line', badge: 'mrt-kajang' },
  { name: 'MRT Putrajaya Line', badge: 'mrt-putrajaya' },
  { name: 'LRT Ampang Line', badge: 'lrt-ampang' },
  { name: 'LRT Sri Petaling Line', badge: 'lrt-sri-petaling' },
  { name: 'LRT Kelana Jaya Line', badge: 'lrt-kelana-jaya' },
  { name: 'LRT Shah Alam Line', badge: 'lrt-shah-alam' },
  { name: 'KL Monorail', badge: 'monorail' },
  { name: 'BRT Sunway', badge: 'brt-sunway' },
  { name: 'KTM Komuter', badge: 'ktm-port-klang' },
  { name: 'KTM ETS', badge: 'ktm-ets' },
  { name: 'KLIA Ekspres', badge: 'erl-klia-ekspres' },
  { name: 'KLIA Transit', badge: 'erl-klia-transit' },
  { name: 'Rapid KL Bus', badge: 'bus' },
  { name: 'MRT Feeder Bus', badge: 'bus' },
  // run by Rapid Bus, so already in its data: Nadi Putra P101-P108 (+ feeders T509, T511); Smart Selangor AJ, KJ, MPS, SA
  { name: 'Nadi Putra (Putrajaya)', badge: 'bus' },
  { name: 'Smart Selangor', badge: 'bus', note: 'someRoutes' },
]
const NETWORKS_SOON: { name: string; note?: TranslationKey }[] = [
  { name: 'GoKL City Bus' },
  { name: 'Smart Selangor', note: 'otherRoutes' },
  { name: 'Hop-On Hop-Off KL' },
  { name: 'ECRL', note: 'whenItOpens' },
]

function SoonBadge() {
  const { t } = useLanguage()
  return (
    <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-[#B23A22] bg-[#F27A5E]/15 px-2 py-0.5 rounded-full">
      {t('soon')}
    </span>
  )
}

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-2xl md:text-3xl font-bold text-[#0E5C63]">
      {children}
    </h2>
  )
}

function About() {
  const { t, lang } = useLanguage()
  const trails = (useTrails().data?.trails ?? []).filter((tr) => isCategoryShown(tr.category, lang))
  // header menu links like /about#about-faq: scroll to that section (also when already on /about)
  const { hash } = useLocation()
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
  }, [hash])
  return (
    <SiteLayout>
      {/* Intro */}
      <section className="bg-[#08333A] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-bold">{t('aboutTitle')}</h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">{t('aboutIntro')}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Features */}
        <section aria-labelledby="about-features" className="pt-14">
          <SectionTitle id="about-features">{t('aboutFeaturesTitle')}</SectionTitle>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-4">
                <span className="w-12 h-12 rounded-xl bg-[#0E5C63]/[0.07] text-[#0E5C63] flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Icon name={f.icon} size={24} />
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900 flex flex-wrap items-center gap-2">
                    {t(f.title)} {f.soon && <SoonBadge />}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{t(f.text)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section aria-labelledby="about-how" className="pt-14">
          <SectionTitle id="about-how">{t('howTitle')}</SectionTitle>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="bg-white border border-gray-200 rounded-2xl p-5">
                <span className="w-9 h-9 rounded-full bg-[#0E5C63] text-white font-bold flex items-center justify-center">{i + 1}</span>
                <h3 className="mt-3 font-semibold text-gray-900">{t(s.title)}</h3>
                <p className="mt-1 text-sm text-gray-600">{t(s.text)}</p>
                {s.soon && (
                  <p className="mt-3 flex items-start gap-2 text-xs text-gray-500">
                    <SoonBadge />
                    <span>{t(s.soon)}</span>
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* Networks */}
        <section aria-labelledby="about-networks" className="pt-14">
          <SectionTitle id="about-networks">{t('networksTitle')}</SectionTitle>
          <div className="mt-6 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#0E5C63]">{t('availableNow')}</h3>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {NETWORKS_NOW.map((n) => (
                  <li key={n.name} className="flex items-center gap-3">
                    <LineBadge line={n.badge === 'bus' ? busLine(null, n.name) : n.badge} size={30} decorative />
                    <span className="text-gray-800">
                      {n.name}
                      {n.note && <span className="text-gray-500"> ({t(n.note)})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-2xl p-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('networksSoon')}</h3>
              <ul className="mt-4 space-y-3">
                {NETWORKS_SOON.map((n) => (
                  <li key={n.name} className="flex items-center gap-3 text-gray-600">
                    <span className="w-2 h-2 rounded-full bg-[#F27A5E] flex-shrink-0" aria-hidden="true" />
                    <span>
                      {n.name}
                      {n.note && <span className="text-gray-500"> ({t(n.note)})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Trails */}
        <section aria-labelledby="about-trails" className="pt-14">
          <SectionTitle id="about-trails">{t('trails')}</SectionTitle>
          <p className="mt-2 text-gray-600">{t('trailsIntro')}</p>
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trails.map((trail, i) => (
              <li key={trail.slug}>
                <Link
                  to={`/trails/${trail.slug}`}
                  className="flex gap-3 items-center bg-white border border-gray-200 rounded-2xl p-3 hover:border-[#0E5C63]/40 hover:shadow-sm transition"
                >
                  <span className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <TrailCover trail={trail} />
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-bold bg-black/20">{i + 1}</span>
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-gray-900 truncate">{t(trailNameKey(trail))}</span>
                    <span className="block text-sm text-gray-500 line-clamp-2">{t(trailDescKey(trail))}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section aria-labelledby="about-faq" className="pt-14 max-w-3xl">
          <SectionTitle id="about-faq">{t('faqTitle')}</SectionTitle>
          <div className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
            {([1, 2, 3, 4, 5] as const).map((n) => (
              <details key={n} className="group py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                  {t(`faq${n}Q` as TranslationKey)}
                  <Icon name="expandMore" size={18} className="flex-shrink-0 text-[#0E5C63] transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-gray-600 leading-relaxed">{t(`faq${n}A` as TranslationKey)}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Credits for the trail and home-page photos (CC BY / BY-SA need them) */}
        <section aria-labelledby="about-credits" className="pt-14 pb-4 max-w-3xl">
          <h2 id="about-credits" className="text-lg font-semibold text-[#0E5C63]">{t('photoCredits')}</h2>
          <p className="mt-1 text-sm text-gray-500">{t('photoCreditsIntro')}</p>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2 text-xs text-gray-600">
            {trails.filter((tr) => TRAIL_PHOTOS[tr.slug]).map((tr) => (
              <li key={tr.slug}>
                {t(trailNameKey(tr))}: <PhotoCredit photo={TRAIL_PHOTOS[tr.slug]} />
              </li>
            ))}
            {Object.entries(SLIDE_PHOTOS).map(([k, ph]) => (
              <li key={k}>
                {ph.alt}: <PhotoCredit photo={ph} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </SiteLayout>
  )
}

export default About
