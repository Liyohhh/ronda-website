import { useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import BackButton from '../components/BackButton'
import { Accent, Eyebrow } from '../components/Motion'
import Ronda300Explorer from '../components/Ronda300Explorer'
import type { FlyTarget } from '../components/Ronda300Map'
import SuggestionList from '../components/SuggestionList'
import Icon from '../components/Icon'
import PromoMap from '../components/PromoMap'
import { SUPPORT_EMAIL } from '../data/contact'
import { buildItems, type Pick } from '../data/suggestions'
import { useSmartSearch } from '../hooks/useSmartSearch'
import { useLanguage } from '../hooks/useLanguage'
import { liftOnPhone } from '../services/liftOnPhone'

const LIST_ID = 'r300-list'
// where the map opens: KLCC to Bukit Bintang, close enough in for the places to show
const START: FlyTarget = { lat: 3.1528, lon: 101.7108, zoom: 15.3, n: 0 }

// /ronda-300: everything within a short walk of the stations, on one map with the places in view listed beside it
// (Ronda300Explorer). The search in the header flies the map to a station; so does ?station=&lat=&lon= in the address.
function Ronda300() {
  const { t } = useLanguage()
  const [params] = useSearchParams()
  const [fly, setFly] = useState<FlyTarget>(() => {
    const lat = Number(params.get('lat')), lon = Number(params.get('lon'))
    return params.get('lat') && params.get('lon') && Number.isFinite(lat) && Number.isFinite(lon) ? { lat, lon, zoom: 16, n: 0 } : START
  })
  const [query, setQuery] = useState(() => params.get('station') ?? '')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)

  // stations only: places of the map search are not stations
  const { stops, fixed, loading } = useSmartSearch(query)
  const items = query.trim() ? buildItems(stops, [], [], query, fixed) : []
  const listOpen = open && items.length > 0

  const pick = (p: Pick) => {
    setQuery(p.name)
    setOpen(false)
    setHi(-1)
    setFly((f) => ({ lat: p.lat, lon: p.lon, zoom: 16, n: f.n + 1 }))
    document.getElementById('r3-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((i) => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && items.length) { e.preventDefault(); pick(items[Math.max(hi, 0)].pick) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <SiteLayout>
      {/* header: a wide photo with the title on a navy fade, and a white search card over its bottom edge with the
          numbers (places, 300 m, minutes on foot). The card does not clip, so the station suggestions open below it */}
      {/* phone: wider, shorter and smaller type, like the other page banners (owner, 4 Nov 2026) */}
      <section className="px-2 sm:px-4 pt-1">
        <div className="relative overflow-hidden rounded-[24px] sm:rounded-[32px] bg-[#222D52] text-white">
          <img src="/places/centralMarket.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#18203D]/90 via-[#18203D]/65 to-[#18203D]/20" />
          <div className="wrap relative pt-7 pb-24 sm:pt-10 sm:pb-28 md:pt-14 md:pb-36">
            <div className="mb-5 sm:mb-8"><BackButton to="/" label={t('backToHome')} onDark /></div>
            <Eyebrow tone="dark">{t('r3_tag')}</Eyebrow>
            <h1 className="mt-3 sm:mt-5 font-display text-[34px] sm:text-[42px] md:text-[72px] leading-[1.02] font-semibold tracking-[-0.01em]"><Accent text="RONDA 300" dark /></h1>
            <p className="mt-3 sm:mt-4 max-w-xl text-base sm:text-lg">{t('r3_intro')}</p>
          </div>
        </div>
        <div className="wrap relative z-20 -mt-20 md:-mt-24">
          <div className="rounded-[24px] bg-white p-4 shadow-[0_24px_50px_-24px_rgb(34_45_82/0.45)] md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
              <div className="min-w-0 flex-1">
                <label htmlFor="r300-input" className="block text-sm font-bold text-[#222D52]">{t('r3_searchLabel')}</label>
                <div className="relative mt-2">
                  <div className="flex items-center gap-2 rounded-full border border-[#D3DCE7] bg-white py-1.5 pe-1.5 ps-5 text-gray-900 focus-within:border-[#2F6BD8] focus-within:ring-2 focus-within:ring-[#2F6BD8]/30">
                    <Icon name="search" size={20} className="text-[#5B6576]" />
                    <input
                      id="r300-input"
                      type="text"
                      value={query}
                      onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(-1) }}
                      onFocus={(e) => { setOpen(true); liftOnPhone(e.currentTarget) }}
                      onBlur={() => setOpen(false)}
                      onKeyDown={onKey}
                      role="combobox"
                      aria-expanded={listOpen}
                      aria-controls={LIST_ID}
                      aria-autocomplete="list"
                      aria-activedescendant={listOpen && hi >= 0 ? `${LIST_ID}-${hi}` : undefined}
                      autoComplete="off"
                      placeholder={t('r3_searchPh')}
                      className="min-w-0 flex-1 bg-transparent text-base outline-none"
                    />
                    <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => (items.length ? pick(items[Math.max(hi, 0)].pick) : setOpen(true))} className="h-11 flex-shrink-0 rounded-full bg-[#222D52] px-6 text-sm font-extrabold text-white transition-colors hover:bg-[#18203D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2F6BD8]">
                      {t('r3_searchBtn')}
                    </button>
                  </div>
                  {listOpen && (
                    <div className="absolute z-20 mt-2 w-full">
                      <SuggestionList id={LIST_ID} items={items} query={query} loading={loading} highlighted={hi} onHover={setHi} onPick={pick} />
                    </div>
                  )}
                </div>
              </div>
              {/* the numbers: places near stations (from the database, 15 Oct 2026, rounded down), the ring, the walk */}
              <ul className="grid grid-cols-3 border-[#E3E9F1] text-center lg:border-s lg:ps-4">
                {([['18,000+', t('r3_statPlaces'), false], ['300 m', t('r3_statFrom'), false], ['5 min', t('r3_statWalk'), true]] as const).map(([n, label, blue]) => (
                  <li key={label} className="px-1.5 md:px-4 [&:not(:first-child)]:border-s [&:not(:first-child)]:border-[#E3E9F1] lg:[&:not(:first-child)]:border-0">
                    <span className={`block font-display text-[20px] sm:text-[24px] md:text-[30px] font-semibold leading-none ${blue ? 'text-[#2559B8]' : 'text-[#222D52]'}`}>{n}</span>
                    <span className="mt-1 block text-xs text-[#5B6576]">{label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* the map and its panel run the full width of the screen */}
      <div id="r3-panel" className="mt-8 scroll-mt-16">
        <Ronda300Explorer fly={fly} />
      </div>

      {/* for businesses: a short band with a sample of how a partner shop shows in the list above */}
      {/* for businesses: why riders will find them, and what their listing looks like to a rider */}
      <section aria-labelledby="r3-merchant" className="mt-12 bg-gradient-to-br from-[#E9F0F8] via-[#F3F6FA] to-[#F2F6FB] text-[#222D52] md:mt-20">
        <div className="wrap grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_360px] md:items-center md:gap-14 md:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2559B8]">{t('navMerchantTitle')}</p>
            <h2 id="r3-merchant" className="mt-2.5 max-w-xl font-display text-[28px] leading-[1.15] md:text-[34px]">{t('r3_mHead')}</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[#434C5C]">{t('r3_mSub')}</p>
            <ul className="mt-7 grid gap-5 sm:grid-cols-3">
              {([['locationOnOutline', 'r3_mT1', 'r3_mP1'], ['routeOutline', 'r3_mT2', 'r3_mP2'], ['storefront', 'r3_mT3', 'r3_mP3']] as const).map(([icon, title, text]) => (
                <li key={title} className="border-t border-[#D9E1EB] pt-3.5">
                  <Icon name={icon} size={20} className="text-[#2559B8]" />
                  <p className="mt-2 text-[14.5px] font-semibold">{t(title)}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[#5B6576]">{t(text)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link to="/help/general#business" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#8AB4F8] px-5 text-sm font-semibold text-[#222D52] hover:bg-[#3B4A7C] transition-colors">
                {t('navMerchantCta')}
                <Icon name="chevronRight" size={18} className="rtl:rotate-180" />
              </Link>
              <p className="text-sm text-[#5B6576]">
                {t('r3_mAsk')} <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-[#222D52] underline decoration-[#8AB4F8] underline-offset-4 hover:text-[#2559B8]">{SUPPORT_EMAIL}</a>
              </p>
            </div>
          </div>

          {/* a sample listing (not a real place) as a rider sees it in the RONDA 300 list */}
          <div aria-hidden="true" className="overflow-hidden rounded-2xl bg-[#F8FAFD] text-[#222D52] shadow-[0_24px_50px_-28px_rgb(34_45_82/0.45)]">
            <PromoMap kind="offers" className="block h-36 w-full" />
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2559B8]">{t('r3_mSees')} · LRT Pasar Seni</p>
              <div className="mt-3 flex items-center gap-3 border-s-2 border-s-[#8AB4F8] bg-white py-3.5 ps-3 pe-3 shadow-[0_1px_0_#E3E9F1]">
                <span className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#99691A]"><Icon name="star" size={12} />{t('r3_mPartner')}</span>
                  <span className="block font-display text-[17px] leading-snug">{t('r3_mYours')}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-[#4D7330]"><span className="h-1.5 w-1.5 rounded-full bg-[#4D7330]" />{t('r3_mHours')}</span>
                  <span className="block text-xs text-[#5B6576]">{t('r3_walkFrom').replace('{station}', 'LRT Pasar Seni').replace('{min}', '2')}</span>
                </span>
                <span className="text-[17px] font-semibold tabular-nums">2<small className="ms-0.5 text-[11px] font-normal text-[#5B6576]">min</small></span>
              </div>
              <span className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full bg-[#222D52] text-sm font-semibold text-white">
                {t('r3_go')}
                <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
              </span>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}

export default Ronda300
