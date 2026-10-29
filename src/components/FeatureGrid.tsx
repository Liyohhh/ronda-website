import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import Icon from './Icon'
import { ParkingSign } from './ParkingInfo'
import { Accent, Eyebrow, Reveal } from './Motion'
import { FEATURES, OPEN_LANGUAGE_MENU, type Feature } from '../data/features'

// "Everything you need for the journey": four cards on one pale strip. One card is lifted and filled blue, with a
// round photo in its corner and "Learn more" (RONDA 300 at first; whichever card the reader points at or tabs to
// after that); the whole card is the link. On phones the cards stack. The smaller features follow in a ruled
// strip, then a Park & Ride card (car parks on the live map and on each line's stations). Only what RONDA does
// today; planned things say "Coming soon". Photos: public/ (credited on the About page).

const CARDS: { key: Feature['key']; label: TranslationKey; line: TranslationKey; photo: string }[] = [
  { key: 'feat_directions', label: 'directions', line: 'featCardDirections', photo: '/Image/banner-kl.webp' },
  { key: 'feat_ronda300', label: 's2_title', line: 'featCardR300', photo: '/places/centralMarket.jpg' },
  { key: 'feat_lines', label: 'lines', line: 'featCardLines', photo: '/places/masjidJamek.jpg' },
  { key: 'feat_trails', label: 'trails', line: 'featCardTrails', photo: '/places/riverOfLife.jpg' },
]
const FIRST_LIT = 1 // RONDA 300

function FeatureGrid() {
  const { t } = useLanguage()
  const [lit, setLit] = useState(FIRST_LIT)
  const byKey = Object.fromEntries(FEATURES.map((f) => [f.key, f])) as Record<Feature['key'], Feature>

  const openLanguages = () => window.dispatchEvent(new CustomEvent(OPEN_LANGUAGE_MENU))
  const small = [byKey.feat_places, byKey.feat_fares, byKey.feat_airport, byKey.feat_saved, byKey.feat_languages, byKey.feat_alerts]

  return (
    <section aria-labelledby="features-title" className="relative">
      <div className="wrap pt-24 md:pt-32 pb-20 md:pb-28">
        <div className="text-center">
          <Reveal><Eyebrow>RONDA</Eyebrow></Reveal>
          <h2 id="features-title" className="mx-auto mt-5 max-w-3xl [text-wrap:balance] font-display text-[34px] md:text-[54px] leading-[1.1] font-semibold tracking-[-0.01em] text-[#222D52]">
            <Accent text={t('featuresTitle')} />
          </h2>
          <p className="mt-4 text-[16px] text-[#5B6576]">{t('featuresIntro')}</p>
        </div>

        <div data-testid="feature-tiles">
          {/* four cards on one pale strip; the lit one rises out of it */}
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4 lg:gap-0 lg:rounded-[28px] lg:bg-[#F2F6FB]" onMouseLeave={() => setLit(FIRST_LIT)}>
            {CARDS.map((c, i) => {
              const f = byKey[c.key]
              const on = i === lit
              return (
                <Reveal as="li" key={c.key} delay={i * 0.06} className="flex" onMouseEnter={() => setLit(i)} onFocus={() => setLit(i)}>
                  {/* the look changes on this inner box: Reveal's own class must stay as React set it */}
                  <div className={`group relative flex min-h-[180px] w-full flex-col overflow-hidden rounded-[24px] p-7 transition-[margin,background-color,box-shadow] duration-300 ease-out sm:min-h-[240px] ${on ? 'bg-[#2F6BD8] text-white shadow-[0_28px_50px_-28px_rgb(47_107_216/0.75)] lg:-mt-12' : 'bg-[#F2F6FB] text-[#222D52]'}`}>
                    <img src={c.photo} alt="" loading="lazy" decoding="async" className={`pointer-events-none absolute -end-6 -top-6 h-36 w-36 rounded-full object-cover transition-[opacity,transform] duration-500 ease-out ${on ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
                    <span aria-hidden="true" className={`relative grid h-12 w-12 place-items-center rounded-full transition-colors duration-300 ${on ? 'bg-white/20 text-white ring-1 ring-white/40' : 'bg-white text-[#2F6BD8]'}`}><Icon name={f.icon} size={22} /></span>
                    <h3 className="mt-auto pt-10 text-[21px] font-extrabold leading-tight">
                      <Link to={f.to!} className="after:absolute after:inset-0 after:z-[1] after:rounded-[24px] focus-visible:outline-none focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:-outline-offset-4 focus-visible:after:outline-white">
                        {t(c.label)}
                        <span className="sr-only">. {t(c.line)}</span>
                      </Link>
                    </h3>
                    <p aria-hidden="true" className={`mt-2 text-[15px] leading-relaxed ${on ? 'text-white' : 'text-[#5B6576]'}`}>{t(c.line)}</p>
                    <span aria-hidden="true" className={`inline-flex items-center gap-1 overflow-hidden text-[13px] font-extrabold uppercase tracking-wide transition-[max-height,margin,opacity] duration-300 ${on ? 'mt-4 max-h-6 opacity-100' : 'mt-0 max-h-0 opacity-0'}`}>
                      {t('featLearnMore')}
                      <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                    </span>
                  </div>
                </Reveal>
              )
            })}
          </ul>

          {/* the smaller features, in a neat strip under the cards */}
          <ul className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 border-y border-[#D3DCE7] text-[15px] text-[#222D52]">
            {small.map((f) => {
              const label = (
                <>
                  <span aria-hidden="true" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F2F6FB]" style={{ color: f.color }}><Icon name={f.icon} size={18} /></span>
                  <span className="min-w-0">
                    <span className="block font-medium leading-snug">{t(f.key)}</span>
                    {f.soon && <span className="mt-1 inline-block rounded-full bg-[#222D52] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">{t('soon')}</span>}
                  </span>
                </>
              )
              const cls = 'flex h-full w-full items-center gap-3 py-5 pe-3 text-start transition-colors hover:text-[#2559B8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2F6BD8]'
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

        {/* Park & Ride: drive to the station, then ride. Car parks are on the live map and on each line's stations */}
        <Reveal className="mt-10 flex flex-col gap-6 rounded-[28px] bg-[#F2F6FB] p-6 md:flex-row md:items-center md:p-8">
          <ParkingSign size={64} />
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-[24px] md:text-[28px] font-semibold leading-tight text-[#222D52]">{t('parkShowTitle')}</h3>
            <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-gray-600">{t('parkShowText')}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
            <Link to="/live?parking=1" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#222D52] px-5 text-sm font-semibold text-white hover:bg-[#18203D] transition-colors">
              <Icon name="map" size={18} />
              {t('parkShowMap')}
            </Link>
            <Link to="/?tab=lines" className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border-[1.5px] border-[#222D52] px-5 text-sm font-semibold text-[#222D52] hover:bg-[#222D52] hover:text-white transition-colors">
              <Icon name="train" size={18} />
              {t('parkShowLines')}
            </Link>
          </div>
        </Reveal>

      </div>
    </section>
  )
}

export default FeatureGrid
