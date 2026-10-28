import { useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import PageHero from '../components/PageHero'
import Ronda300Explorer from '../components/Ronda300Explorer'
import type { FlyTarget } from '../components/Ronda300Map'
import SuggestionList from '../components/SuggestionList'
import Icon from '../components/Icon'
import PromoMap from '../components/PromoMap'
import { SUPPORT_EMAIL } from '../data/contact'
import { buildItems, type Pick } from '../data/suggestions'
import { useSmartSearch } from '../hooks/useSmartSearch'
import { useLanguage } from '../hooks/useLanguage'

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
  const { stops, loading } = useSmartSearch(query)
  const items = query.trim() ? buildItems(stops, []) : []
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
      <PageHero
        back={{ to: '/', label: t('backToHome') }}
        eyebrow={t('r3_tag')}
        title="RONDA 300"
        intro={t('r3_intro')}
      >
          <label htmlFor="r300-input" className="block text-sm font-semibold text-white/80">{t('r3_searchLabel')}</label>
          <div className="relative mt-2 max-w-xl">
            <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3.5 shadow-lg text-gray-900 focus-within:ring-2 focus-within:ring-gold">
              <Icon name="search" size={20} className="text-gray-500" />
              <input
                id="r300-input"
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setOpen(true); setHi(-1) }}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
                onKeyDown={onKey}
                role="combobox"
                aria-expanded={listOpen}
                aria-controls={LIST_ID}
                aria-autocomplete="list"
                aria-activedescendant={listOpen && hi >= 0 ? `${LIST_ID}-${hi}` : undefined}
                autoComplete="off"
                placeholder={t('r3_searchPh')}
                className="w-full text-base outline-none"
              />
            </div>
            {listOpen && (
              <div className="absolute z-20 mt-2 w-full">
                <SuggestionList id={LIST_ID} items={items} query={query} loading={loading} highlighted={hi} onHover={setHi} onPick={pick} />
              </div>
            )}
          </div>
      </PageHero>

      {/* the map and its panel run the full width of the screen */}
      <div id="r3-panel" className="mt-8 scroll-mt-16">
        <Ronda300Explorer fly={fly} />
      </div>

      {/* for businesses: a short band with a sample of how a partner shop shows in the list above */}
      {/* for businesses: why riders will find them, and what their listing looks like to a rider */}
      <section aria-labelledby="r3-merchant" className="mt-12 bg-[#222D52] text-white md:mt-20">
        <div className="wrap grid gap-10 py-12 md:grid-cols-[minmax(0,1fr)_360px] md:items-center md:gap-14 md:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D2B68A]">{t('navMerchantTitle')}</p>
            <h2 id="r3-merchant" className="mt-2.5 max-w-xl font-display text-[28px] leading-[1.15] md:text-[34px]">{t('r3_mHead')}</h2>
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-white/80">{t('r3_mSub')}</p>
            <ul className="mt-7 grid gap-5 sm:grid-cols-3">
              {([['locationOnOutline', 'r3_mT1', 'r3_mP1'], ['routeOutline', 'r3_mT2', 'r3_mP2'], ['storefront', 'r3_mT3', 'r3_mP3']] as const).map(([icon, title, text]) => (
                <li key={title} className="border-t border-white/15 pt-3.5">
                  <Icon name={icon} size={20} className="text-[#D2B68A]" />
                  <p className="mt-2 text-[14.5px] font-semibold">{t(title)}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/70">{t(text)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link to="/help/general#business" className="inline-flex h-11 items-center gap-2 rounded-full bg-[#D2B68A] px-5 text-sm font-semibold text-[#222D52] hover:bg-[#E2CCA6] transition-colors">
                {t('navMerchantCta')}
                <Icon name="chevronRight" size={18} className="rtl:rotate-180" />
              </Link>
              <p className="text-sm text-white/70">
                {t('r3_mAsk')} <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-white underline decoration-[#D2B68A] underline-offset-4 hover:text-[#D2B68A]">{SUPPORT_EMAIL}</a>
              </p>
            </div>
          </div>

          {/* a sample listing (not a real place) as a rider sees it in the RONDA 300 list */}
          <div aria-hidden="true" className="overflow-hidden rounded-2xl bg-[#FBFAF7] text-[#222D52] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.6)]">
            <PromoMap kind="offers" className="block h-36 w-full" />
            <div className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6F5F3C]">{t('r3_mSees')} · LRT Pasar Seni</p>
              <div className="mt-3 flex items-center gap-3 border-s-2 border-s-[#D2B68A] bg-white py-3.5 ps-3 pe-3 shadow-[0_1px_0_#ECE7DD]">
                <span className="min-w-0 flex-1">
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#99691A]"><Icon name="star" size={12} />{t('r3_mPartner')}</span>
                  <span className="block font-display text-[17px] leading-snug">{t('r3_mYours')}</span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-[#4D7330]"><span className="h-1.5 w-1.5 rounded-full bg-[#4D7330]" />{t('r3_mHours')}</span>
                  <span className="block text-xs text-[#6B675E]">{t('r3_walkFrom').replace('{station}', 'LRT Pasar Seni').replace('{min}', '2')}</span>
                </span>
                <span className="text-[17px] font-semibold tabular-nums">2<small className="ms-0.5 text-[11px] font-normal text-[#6B675E]">min</small></span>
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
