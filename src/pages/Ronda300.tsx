import { useEffect, useState, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import SiteLayout from '../components/SiteLayout'
import BackButton from '../components/BackButton'
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
import { KIND_ICON, PLACE_KINDS, loadPlacesNear, placeName, planToPoint, walkMinutes, type NearPlace, type PlaceKind } from '../services/places'

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
      <section className="bg-[#14213D] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-12">
          <div className="mb-5">
            <BackButton to="/" label={t('backToHome')} onDark />
          </div>
          <p className="text-sm font-semibold text-accent-light">{t('r3_tag')}</p>
          <h1 className="mt-1 text-3xl md:text-4xl font-bold">RONDA 300</h1>
          <p className="mt-3 text-white/80 max-w-2xl">{t('r3_intro')}</p>
          <p className="mt-2 text-sm text-white/70 max-w-2xl">{t('r3_growing')}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <label htmlFor="r300-input" className="block text-sm font-semibold text-[#14213D]">{t('r3_searchLabel')}</label>
        <div className="relative mt-2 max-w-xl">
          <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-3 focus-within:border-[#14213D]">
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
            <>
              <StationBlock group={here} heading={t('r3_placesAt').replace('{station}', here.station.name)} />
              <NearbyPlaces key={picked.name} at={picked} />
            </>
          ) : (
            <>
              <NearbyPlaces key={picked.name} at={picked} />
              <p className="mt-8 text-gray-800">{t('r3_none').replace('{station}', picked.name)}</p>
              {nearest && nearest.length > 0 && (
                <>
                  <h2 className="mt-6 text-lg font-semibold text-[#14213D]">{t('r3_nearest')}</h2>
                  {nearest.map((g) => (
                    <StationBlock key={g.station.search} group={g} heading={`${g.station.name} · ${t('r3_away').replace('{km}', (g.distance / 1000).toFixed(1))}`} />
                  ))}
                </>
              )}
            </>
          )}
        </div>

        <section aria-labelledby="r3-merchant" className="mt-12 rounded-2xl bg-[#14213D] text-white p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-4 justify-between">
          <div>
            <h2 id="r3-merchant" className="text-xl font-semibold">{t('navMerchantTitle')}</h2>
            <p className="mt-1 text-white/75">{t('navMerchantText')}</p>
          </div>
          <Link to="/help/general#business" className="self-start md:self-auto bg-white text-[#14213D] px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-100">
            {t('navMerchantCta')}
          </Link>
        </section>
      </div>
    </SiteLayout>
  )
}

const FIRST_PLACES = 24
// Everything mapped on OpenStreetMap within 300 m of the picked station, nearest first, with a filter by kind
function NearbyPlaces({ at }: { at: Pick }) {
  const { t, lang } = useLanguage()
  const [places, setPlaces] = useState<NearPlace[] | null>(null)
  const [failed, setFailed] = useState(false)
  const [kind, setKind] = useState<PlaceKind | null>(null)
  const [all, setAll] = useState(false)
  useEffect(() => {
    let live = true
    loadPlacesNear(at.lat, at.lon).then((p) => { if (live) setPlaces(p) }).catch(() => { if (live) setFailed(true) })
    return () => { live = false }
  }, [at.lat, at.lon])
  const kinds = PLACE_KINDS.filter((k) => places?.some((p) => p.kind === k))
  const matching = (places ?? []).filter((p) => !kind || p.kind === kind)
  const shown = all ? matching : matching.slice(0, FIRST_PLACES)
  return (
    <section aria-labelledby="r3-osm" className="mt-8">
      <h2 id="r3-osm" className="text-lg font-semibold text-[#14213D]">{t('r3_osmTitle').replace('{station}', at.name)}</h2>
      <p className="mt-1 text-sm text-gray-600">{t('r3_osmNote')}</p>
      {failed ? (
        <p role="alert" className="mt-3 text-gray-700">{t('r3_osmError')}</p>
      ) : !places ? (
        <p role="status" className="mt-3 text-gray-500">{t('loading')}</p>
      ) : places.length === 0 ? (
        <p className="mt-3 text-gray-700">{t('r3_osmNone')}</p>
      ) : (
        <>
          <div role="group" aria-label={t('r3_osmFilter')} className="mt-4 flex flex-wrap gap-2">
            {[null, ...kinds].map((k) => (
              <button
                key={k ?? 'all'}
                type="button"
                aria-pressed={kind === k}
                onClick={() => { setKind(k); setAll(false) }}
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border text-sm font-medium ${kind === k ? 'bg-[#14213D] border-[#14213D] text-white' : 'bg-white border-gray-300 text-gray-800 hover:bg-gray-50'}`}
              >
                {k && <Icon name={KIND_ICON[k]} size={16} />}
                {k ? t(`r3k_${k}` as TranslationKey) : t('r3_osmAll')}
                <span className={kind === k ? 'text-white/80' : 'text-gray-500'}>{k ? places.filter((p) => p.kind === k).length : places.length}</span>
              </button>
            ))}
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => {
              const name = placeName(p, lang)
              return (
                <li key={p.osm_id} className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-4">
                  <span aria-hidden="true" className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#14213D]">
                    <Icon name={KIND_ICON[p.kind]} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-medium text-gray-900 break-words">{name}</span>
                    <span className="mt-0.5 block text-sm text-gray-600">
                      {t(`r3k_${p.kind}` as TranslationKey)} · {t('r3_osmWalk').replace('{m}', String(p.distance_m)).replace('{min}', String(walkMinutes(p.distance_m)))}
                    </span>
                    <Link to={planToPoint(p, name)} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-[#14213D] hover:underline">
                      {t('planTripHere')}
                      <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                    </Link>
                  </span>
                </li>
              )
            })}
          </ul>
          {!all && matching.length > FIRST_PLACES && (
            <button type="button" onClick={() => setAll(true)} className="mt-4 inline-flex items-center gap-1 h-10 px-4 rounded-full border border-gray-300 bg-white text-sm font-semibold text-[#14213D] hover:bg-gray-50">
              {t('r3_osmMore').replace('{n}', String(matching.length))}
              <Icon name="expandMore" size={18} />
            </button>
          )}
          <p className="mt-3 text-xs text-gray-500">
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">© OpenStreetMap contributors</a>
          </p>
        </>
      )}
    </section>
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
            <Link to={planToPlace(group.station, p.name)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-[#14213D] hover:underline">
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
