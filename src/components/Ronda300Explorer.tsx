import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Ronda300Map, { type AreaPlace, type FlyTarget, type MapView } from './Ronda300Map'
import Icon from './Icon'
import { useRailStations, type RailStation } from '../hooks/useRailStations'
import type { TranslationKey } from '../i18n/translations'
import { useLanguage } from '../hooks/useLanguage'
import { KIND_COLOR, KIND_ICON, PLACE_KINDS, loadPlacesNear, placeName, planToPoint, walkMinutes, type NearPlace, type PlaceKind } from '../services/places'

// places show from this zoom (a few streets across), around at most this many stations nearest the middle of the view
const MIN_ZOOM = 14.5
const MAX_STATIONS = 8
const MAX_LISTED = 120

// The RONDA 300 panel, modelled on Klook's and Rome2rio's map pages: the kinds of place as an icon bar across the
// top, the places in the part of the map in view on the left (they follow the map as it moves, like Klook's
// "results update as you move the map"), and the map on the right (on phones the map comes first). The places are
// what OpenStreetMap has within 300 m of each station in view (places_near, loaded per station and kept), each with
// its walk from that station. Pointing at a place puts a callout on its dot; pressing a dot picks it in the list.
function Ronda300Explorer({ fly }: { fly: FlyTarget }) {
  const { t, lang } = useLanguage()
  const stations = useRailStations()
  const [view, setView] = useState<MapView | null>(null)
  const [kind, setKind] = useState<PlaceKind | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // the stations whose places to show: in view, nearest the middle first (one per name: interchanges have a dot per line)
  const near = useMemo(() => {
    if (!view || !stations || view.zoom < MIN_ZOOM) return []
    const c = view.bounds.getCenter()
    const seen = new Set<string>()
    return stations
      .filter((s) => view.bounds.contains([s.lon, s.lat]))
      .sort((a, b) => (a.lat - c.lat) ** 2 + (a.lon - c.lng) ** 2 - ((b.lat - c.lat) ** 2 + (b.lon - c.lng) ** 2))
      .filter((s) => (seen.has(s.name) ? false : (seen.add(s.name), true)))
      .slice(0, MAX_STATIONS)
  }, [view, stations])

  // places per station, loaded once each
  const [loadedPlaces, setLoadedPlaces] = useState<Record<string, NearPlace[] | 'error'>>({})
  const asked = useRef(new Set<string>())
  useEffect(() => {
    for (const s of near) {
      if (asked.current.has(s.name)) continue
      asked.current.add(s.name)
      loadPlacesNear(s.lat, s.lon).then(
        (p) => setLoadedPlaces((m) => ({ ...m, [s.name]: p })),
        () => setLoadedPlaces((m) => ({ ...m, [s.name]: 'error' })),
      )
    }
  }, [near])

  // every place in view, each with its nearest station among those shown, nearest the middle of the view first
  const area = useMemo(() => {
    if (!view) return []
    const best = new Map<string, AreaPlace>()
    for (const s of near) {
      const got = loadedPlaces[s.name]
      if (!got || got === 'error') continue
      for (const p of got) {
        const had = best.get(p.osm_id)
        if (!had || p.distance_m < had.distance_m) best.set(p.osm_id, { ...p, station: s.name })
      }
    }
    const c = view.bounds.getCenter()
    return [...best.values()]
      .filter((p) => view.bounds.contains([p.lon, p.lat]))
      .sort((a, b) => (a.lat - c.lat) ** 2 + (a.lon - c.lng) ** 2 - ((b.lat - c.lat) ** 2 + (b.lon - c.lng) ** 2))
  }, [near, loadedPlaces, view])
  const waiting = near.some((s) => !(s.name in loadedPlaces))
  const failed = near.length > 0 && near.every((s) => loadedPlaces[s.name] === 'error')
  const kinds = PLACE_KINDS.filter((k) => area.some((p) => p.kind === k))
  const matching = useMemo(() => area.filter((p) => !kind || p.kind === kind), [area, kind])
  const rings = useMemo<RailStation[]>(() => near.filter((s) => Array.isArray(loadedPlaces[s.name])), [near, loadedPlaces])

  const pickOnMap = useCallback((id: string) => {
    setActive(id)
    listRef.current?.querySelector<HTMLElement>(`[data-osm="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const tab = (on: boolean) =>
    `flex min-w-[88px] flex-shrink-0 flex-col items-center gap-1 border-b-2 px-3 pb-2.5 pt-3 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold ${on ? 'border-[#222D52] font-semibold text-[#222D52]' : 'border-transparent text-gray-600 hover:text-[#222D52]'}`

  return (
    <section aria-labelledby="r3-osm" className="overflow-hidden rounded-[28px] border border-[#DCD4C8] bg-[#F7F4EF]">
      {/* kinds of place, with how many are in view */}
      <div role="group" aria-label={t('r3_osmFilter')} className="flex min-h-[78px] overflow-x-auto border-b border-[#DCD4C8] bg-white px-2 [scrollbar-width:none]">
        {[null, ...kinds].map((k) => (
          <button key={k ?? 'all'} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setActive(null) }} className={tab(kind === k)}>
            <span aria-hidden="true" className="flex h-7 items-center" style={{ color: k ? KIND_COLOR[k] : '#222D52' }}>
              <Icon name={k ? KIND_ICON[k] : 'locationOnOutline'} size={24} />
            </span>
            <span className="whitespace-nowrap">{k ? t(`r3k_${k}` as TranslationKey) : t('r3_osmAll')}</span>
            <span className="text-[11px] text-gray-500">{k ? area.filter((p) => p.kind === k).length : area.length}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <div className="h-[360px] sm:h-[440px] p-3 lg:order-2 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:max-h-[760px] lg:ps-0">
          <Ronda300Map
            stations={stations ?? []}
            rings={rings}
            places={matching}
            active={active}
            fly={fly}
            onPickPlace={pickOnMap}
            onView={setView}
          />
        </div>

        <div className="lg:order-1 p-4 md:p-5">
          <h2 id="r3-osm" className="text-lg font-semibold text-[#222D52]">{t('r3_placesInView').replace('{n}', String(matching.length))}</h2>
          <p className="mt-0.5 text-xs text-gray-500">{t('r3_viewHint')}</p>
          {view && view.zoom < MIN_ZOOM ? (
            <p className="mt-6 rounded-[20px] bg-white p-5 text-sm text-gray-700">{t('r3_zoomIn')}</p>
          ) : failed ? (
            <p role="alert" className="mt-6 text-gray-700">{t('r3_osmError')}</p>
          ) : matching.length === 0 ? (
            <p role="status" className="mt-6 text-gray-500">{waiting || !stations ? t('loading') : t('r3_osmNone')}</p>
          ) : (
            <ul ref={listRef} className="mt-4 space-y-3 max-h-[65vh] overflow-y-auto pe-1 lg:max-h-[calc(100vh-15rem)] [scrollbar-width:thin]">
              {matching.slice(0, MAX_LISTED).map((p) => {
                const name = placeName(p, lang)
                const on = active === p.osm_id
                return (
                  <li
                    key={p.osm_id}
                    data-osm={p.osm_id}
                    onMouseEnter={() => setActive(p.osm_id)}
                    onFocus={() => setActive(p.osm_id)}
                    className={`flex items-center gap-4 rounded-[20px] bg-white p-3 transition-shadow ${on ? 'ring-2 ring-[#222D52] shadow-md' : 'shadow-[0_1px_3px_rgb(34_45_82/0.08)] hover:shadow-md'}`}
                  >
                    <span aria-hidden="true" className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${KIND_COLOR[p.kind]}1A`, color: KIND_COLOR[p.kind] }}>
                      <Icon name={KIND_ICON[p.kind]} size={28} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-gray-900 break-words">{name}</span>
                      <span className="mt-0.5 block text-sm text-gray-600">{t(`r3k_${p.kind}` as TranslationKey)}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-xs text-gray-500">
                        <Icon name="directionsWalk" size={14} />
                        {t('r3_walkFrom').replace('{station}', p.station).replace('{min}', String(walkMinutes(p.distance_m)))}
                      </span>
                      <Link to={planToPoint(p, name)} className="mt-2 inline-flex h-8 items-center gap-1 rounded-full border-[1.5px] border-[#222D52] px-3 text-xs font-semibold text-[#222D52] hover:bg-[#222D52] hover:text-white transition-colors">
                        {t('planTripHere')}
                        <Icon name="chevronRight" size={14} className="rtl:rotate-180" />
                      </Link>
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-gray-500">
            {t('r3_osmNote')}{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">© OpenStreetMap contributors</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Ronda300Explorer
