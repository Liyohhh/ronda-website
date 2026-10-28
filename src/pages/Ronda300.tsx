import { useState, type KeyboardEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import PageHero from '../components/PageHero'
import Ronda300Explorer from '../components/Ronda300Explorer'
import type { FlyTarget } from '../components/Ronda300Map'
import SuggestionList from '../components/SuggestionList'
import Icon from '../components/Icon'
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
      <section aria-labelledby="r3-merchant" className="border-b border-[#DCD4C8] bg-[#F3EEE6]">
        <div className="wrap grid gap-6 py-9 md:grid-cols-[minmax(0,1fr)_380px] md:items-center md:gap-12 md:py-10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6F5F3C]">{t('navMerchantTitle')}</p>
            <h2 id="r3-merchant" className="mt-2 font-display text-[26px] leading-tight text-[#222D52] md:text-[30px]">{t('r3_mHead')}</h2>
            <ul className="mt-3 flex flex-col gap-1 text-[14.5px] text-[#4A4740] md:flex-row md:flex-wrap md:gap-x-5">
              {(['r3_mP1', 'r3_mP2', 'r3_mP3'] as const).map((k, i) => (
                <li key={k} className="flex gap-2"><span className="font-display text-[#6F5F3C]">0{i + 1}</span>{t(k)}</li>
              ))}
            </ul>
            <Link to="/help/general#business" className="mt-5 inline-flex h-11 items-center gap-2 rounded-full bg-[#222D52] px-5 text-sm font-semibold text-white hover:bg-[#2f3d6e] transition-colors">
              {t('navMerchantCta')}
              <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
            </Link>
          </div>

          {/* a sample listing (not a real place), drawn like a row of the RONDA 300 list */}
          <div aria-hidden="true" className="rounded-xl border border-[#DCD4C8] bg-[#FBFAF7] px-4 pb-1 pt-3 shadow-[0_14px_30px_-22px_rgb(34_45_82/0.4)]">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-[#6F5F3C]">{t('r3_mSample')} · Pasar Seni</p>
            <div className="mt-2 flex items-center gap-3 border-s-2 border-s-[#D2B68A] bg-white py-2.5 ps-2.5 pe-2">
              <span className="h-10 w-10 flex-shrink-0 rounded-md bg-[#E4DCCD]" />
              <span className="min-w-0 flex-1">
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.09em] text-[#99691A]">{t('r3_mPartner')}</span>
                <span className="block text-[14px] font-semibold text-[#222D52]">{t('r3_mYours')}</span>
              </span>
              <span className="text-[15px] font-semibold tabular-nums text-[#222D52]">2<small className="ms-0.5 text-[11px] font-normal text-[#6B675E]">min</small></span>
            </div>
            <div className="flex items-center gap-3 border-t border-[#ECE7DD] py-2.5 ps-3 pe-2">
              <span className="h-2.5 flex-1 rounded bg-[#ECE8E0]" />
              <span className="text-[13px] font-semibold tabular-nums text-[#6B675E]">4<small className="ms-0.5 text-[11px] font-normal">min</small></span>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  )
}

export default Ronda300
