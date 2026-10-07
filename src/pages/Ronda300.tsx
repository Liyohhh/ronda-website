import { useEffect, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import SuggestionList from '../components/SuggestionList'
import LineBadge from '../components/LineBadge'
import Icon from '../components/Icon'
import { buildItems, type Pick } from '../data/suggestions'
import { nearestWithPlaces, placesAt, planToPlace, stationsWithPlaces, type StationPlaces } from '../data/ronda300'
import { placeBlurbKey, type Place, type Station } from '../data/trails'
import type { TranslationKey } from '../i18n/translations'
import { useSmartSearch } from '../hooks/useSmartSearch'
import { useTrails } from '../hooks/useTrails'
import { useLanguage } from '../hooks/useLanguage'
import { supabase } from '../services/supabase'

const LIST_ID = 'r300-list'

// /ronda-300: pick a station, see the places within a short walk of it (curated for now, merchants later)
function Ronda300() {
  const { t, lang } = useLanguage()
  const { data, error } = useTrails()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(-1)
  const [picked, setPicked] = useState<Pick | null>(null)
  const [nearest, setNearest] = useState<(StationPlaces & { distance: number })[] | null>(null)

  // stations only: places of the map search are not stations
  const { stops, loading } = useSmartSearch(query)
  const items = query.trim() ? buildItems(stops, []) : []
  const listOpen = open && items.length > 0

  const all = data ? stationsWithPlaces(data, lang) : []
  const here = picked ? placesAt(all, picked.name) : null

  // nothing at the picked station: the nearest stations that do have places (positions from public.stops)
  const missing = picked !== null && data !== null && here === null
  useEffect(() => {
    if (!missing || !picked) return
    let live = true
    const ids = [...new Set(all.map((s) => s.station.stopId).filter(Boolean))] as string[]
    supabase
      .from('stops')
      .select('feed_id, stop_id, stop_lat, stop_lon')
      .in('stop_id', ids)
      .then(({ data: rows }) => {
        if (!live) return
        const coords = new Map((rows ?? []).map((r) => [`${r.feed_id}:${r.stop_id}`, { lat: r.stop_lat as number, lon: r.stop_lon as number }]))
        setNearest(nearestWithPlaces(all, coords, picked))
      })
    return () => { live = false }
    // all is derived from data + lang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missing, picked, data, lang])

  const pick = (p: Pick) => {
    setPicked(p)
    setNearest(null)
    setQuery(p.name)
    setOpen(false)
    setHi(-1)
  }
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHi((i) => Math.min(i + 1, items.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter' && items.length) { e.preventDefault(); pick(items[Math.max(hi, 0)].pick) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <SiteLayout>
      <section className="bg-[#1F2F5C] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <p className="text-sm font-semibold text-accent-light">{t('r3_tag')}</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold">RONDA 300</h1>
          <p className="mt-3 text-white/80 max-w-2xl">{t('r3_intro')}</p>
          <p className="mt-2 text-sm text-white/70 max-w-2xl">{t('r3_growing')}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <label htmlFor="r300-input" className="block text-sm font-semibold text-[#1F2F5C]">{t('r3_searchLabel')}</label>
        <div className="relative mt-2 max-w-xl">
          <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 focus-within:border-[#1F2F5C]">
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

        <div aria-live="polite" className="mt-8">
          {!data ? (
            <p className="text-gray-500" role={error ? 'alert' : 'status'}>{error ? t('trailsLoadError') : t('loading')}</p>
          ) : !picked ? (
            <p className="text-gray-600">{t('r3_hint').replace('{n}', String(all.length))}</p>
          ) : here ? (
            <StationBlock group={here} heading={t('r3_placesAt').replace('{station}', here.station.name)} />
          ) : (
            <>
              <p className="text-gray-800">{t('r3_none').replace('{station}', picked.name)}</p>
              {nearest && nearest.length > 0 && (
                <>
                  <h2 className="mt-6 text-lg font-semibold text-[#1F2F5C]">{t('r3_nearest')}</h2>
                  {nearest.map((g) => (
                    <StationBlock key={g.station.search} group={g} heading={`${g.station.name} · ${t('r3_away').replace('{km}', (g.distance / 1000).toFixed(1))}`} />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <section aria-labelledby="r3-merchant" className="mt-12 rounded-2xl bg-[#1F2F5C] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 id="r3-merchant" className="text-xl font-semibold">{t('navMerchantTitle')}</h2>
            <p className="mt-1 text-white/75">{t('navMerchantText')}</p>
          </div>
          <Link to="/help/general#business" className="self-start md:self-auto bg-white text-[#1F2F5C] px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100">
            {t('navMerchantCta')}
          </Link>
        </section>
      </div>
    </SiteLayout>
  )
}

function StationBlock({ group, heading }: { group: { station: Station; places: Place[] }; heading: string }) {
  const { t } = useLanguage()
  return (
    <section className="mt-4">
      <h3 className="flex items-center gap-2 font-semibold text-gray-900">
        {group.station.lineIds.map((id) => <LineBadge key={id} line={id} size={22} decorative />)}
        {heading}
      </h3>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {group.places.map((p) => (
          <li key={p.id} className="rounded-2xl border border-gray-200 bg-white p-4">
            <p className="font-medium text-gray-900">{p.name}</p>
            <p className="mt-1 text-sm text-gray-600">{t(placeBlurbKey(p.id) as TranslationKey)}</p>
            <Link to={planToPlace(group.station, p.name)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#1F2F5C] hover:underline">
              {t('planTripHere')}
              <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Ronda300
