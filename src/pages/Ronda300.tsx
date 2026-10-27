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

      <div className="wrap py-10">
        <div id="r3-panel" className="scroll-mt-24">
          <Ronda300Explorer fly={fly} />
        </div>

        <section aria-labelledby="r3-merchant" className="mt-14 rounded-[28px] bg-[#222D52] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 id="r3-merchant" className="text-xl font-semibold">{t('navMerchantTitle')}</h2>
            <p className="mt-1 text-white/75">{t('navMerchantText')}</p>
          </div>
          <Link to="/help/general#business" className="self-start md:self-auto bg-gold text-[#222D52] px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gold-hover">
            {t('navMerchantCta')}
          </Link>
        </section>
      </div>
    </SiteLayout>
  )
}

export default Ronda300
