import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Ronda300Map, { type AreaPlace, type FlyTarget, type MapView, type PhotoPin, type StationBubble } from './Ronda300Map'
import LineBadge from './LineBadge'
import Icon from './Icon'
import { useRailStations, type RailStation } from '../hooks/useRailStations'
import { useTrails } from '../hooks/useTrails'
import type { TranslationKey } from '../i18n/translations'
import { useLanguage } from '../hooks/useLanguage'
import { PLACE_PHOTOS } from '../data/placePhotos'
import { distanceM, stationsWithPlaces } from '../data/ronda300'
import { KIND_COLOR, PLACE_KINDS, loadPickSpots, loadPlacesNear, placeName, planToPoint, walkMinutes, type NearPlace, type PickSpot, type PlaceKind } from '../services/places'

// places show from this zoom (a few streets across), around at most this many stations nearest the middle of the view
const MIN_ZOOM = 14.5
const MAX_STATIONS = 8
const MAX_LISTED = 120
const MAX_PICKS = 3 // photo cards in the panel
const PICK_RADIUS_M = 450 // hand-picked places this close to the station in focus are its RONDA picks
const MAX_PINS = 14 // photo pins on the map

type Pick = PhotoPin & { minutes: number; distance: number }

// The RONDA 300 panel: the map on the left with a bubble over each station in view (what is around it, in RONDA's own
// icons), the hand-picked places as photo pins and the mapped places as icon markers; on the right the station in
// focus (the one nearest the middle of the map): its lines, how many places are within 5 minutes, up to three RONDA
// picks with photos, the kinds of place as chips with counts, and the places in view, nearest the middle first (they
// follow the map as it moves). On phones the map comes first. The mapped places are what OpenStreetMap has within
// 300 m of each station in view (places_near, loaded per station and kept); the picks are the trail places.
function Ronda300Explorer({ fly }: { fly: FlyTarget }) {
  const { t, lang } = useLanguage()
  const stations = useRailStations()
  const { data: trails } = useTrails()
  const [view, setView] = useState<MapView | null>(null)
  const [kind, setKind] = useState<PlaceKind | null>(null)
  const [active, setActive] = useState<string | null>(null)
  const [activePin, setActivePin] = useState<string | null>(null)
  const [flyTo, setFlyTo] = useState<FlyTarget>(fly)
  const listRef = useRef<HTMLUListElement>(null)
  // a new fly from the page (the search) wins over the last photo pin
  const [pageFly, setPageFly] = useState(fly)
  if (fly !== pageFly) { setPageFly(fly); setFlyTo(fly) }

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
  const focus: RailStation | undefined = near[0]

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

  // where the trail places are (once); without them there are simply no picks
  const [spots, setSpots] = useState<PickSpot[]>([])
  useEffect(() => { loadPickSpots().then(setSpots, () => setSpots([])) }, [])

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
  const focusPlaces = focus ? loadedPlaces[focus.name] : undefined
  const rings = useMemo<RailStation[]>(() => (focus && Array.isArray(focusPlaces) ? [focus] : []), [focus, focusPlaces])

  // a label over every other station in view: how many places are around it
  const bubbles = useMemo<StationBubble[]>(() => near.slice(1).flatMap((s) => {
    const got = loadedPlaces[s.name]
    return Array.isArray(got) && got.length ? [{ station: s, count: got.length }] : []
  }), [near, loadedPlaces])

  // the hand-picked places that have a photo and a position (places of Arabic-only trails only in Arabic)
  const allPicks = useMemo(() => {
    if (!trails || !spots.length) return []
    const at = new Map(spots.map((s) => [s.id, s]))
    return stationsWithPlaces(trails, lang).flatMap((sp) => sp.places).flatMap((p) => {
      const pos = at.get(p.id), photo = PLACE_PHOTOS[p.id]
      return pos && photo ? [{ id: p.id, lat: pos.lat, lon: pos.lon, src: photo.src, name: p.name }] : []
    })
  }, [trails, spots, lang])
  const pins = useMemo<PhotoPin[]>(() => {
    if (!view || view.zoom < MIN_ZOOM) return []
    return allPicks.filter((p) => view.bounds.contains([p.lon, p.lat])).slice(0, MAX_PINS)
  }, [allPicks, view])
  const picks = useMemo<Pick[]>(() => {
    if (!focus) return []
    return allPicks
      .map((p) => {
        const distance = distanceM(focus, p)
        return { ...p, distance, minutes: walkMinutes(distance) }
      })
      .filter((p) => p.distance <= PICK_RADIUS_M)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_PICKS)
  }, [allPicks, focus])

  // the focus station's lines (an interchange has a station per line, all with the same name)
  const focusLines = useMemo(() => {
    if (!focus || !stations) return []
    const seen = new Set<string>()
    return stations.filter((s) => s.name === focus.name && !seen.has(s.line.id) && (seen.add(s.line.id), true)).map((s) => s.line)
  }, [focus, stations])

  const pickOnMap = useCallback((id: string) => {
    setActive(id)
    listRef.current?.querySelector<HTMLElement>(`[data-osm="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])
  // a photo pin: fly in to it (its station becomes the focus) and mark its card
  const pickPin = useCallback((id: string) => {
    const p = allPicks.find((x) => x.id === id)
    if (!p) return
    setActivePin(id)
    setFlyTo((f) => ({ lat: p.lat, lon: p.lon, zoom: Math.max(view?.zoom ?? 16, 16), n: f.n + 1 }))
  }, [allPicks, view])

  const tab = (on: boolean) =>
    `-mb-px flex-shrink-0 whitespace-nowrap border-b-2 pb-2 text-[13px] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold ${on ? 'border-[#222D52] font-semibold text-[#222D52]' : 'border-transparent text-[#6E6A60] hover:text-[#222D52]'}`

  return (
    <section aria-labelledby="r3-osm" className="overflow-hidden border-y border-[#DCD4C8] bg-white">
      <div className="grid grid-cols-1 lg:h-[calc(100vh-4.5rem)] lg:min-h-[560px] lg:grid-cols-[minmax(0,1fr)_440px] xl:grid-cols-[minmax(0,1fr)_480px] lg:grid-rows-[minmax(0,1fr)]">
        <div className="h-[420px] sm:h-[500px] lg:h-full">
          <Ronda300Map
            stations={stations ?? []}
            rings={rings}
            bubbles={bubbles}
            pins={pins}
            activePin={activePin}
            places={matching}
            active={active}
            fly={flyTo}
            onPickPlace={pickOnMap}
            onPickPin={pickPin}
            onView={setView}
          />
        </div>

        <div className="bg-[#FBFAF7] px-4 py-5 md:px-6 lg:pt-0 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border-s lg:border-[#EEEAE2] [scrollbar-width:thin]">
          {/* the station in focus: its lines, then its name set large (stays at the top while the panel scrolls) */}
          {focus && (
            <div className="lg:sticky lg:top-0 lg:z-10 lg:-mx-6 lg:border-b lg:border-[#EEEAE2] lg:bg-[#FBFAF7]/95 lg:px-6 lg:pb-3 lg:pt-5 lg:backdrop-blur-sm">
              <p className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6F5F3C]">
                {focusLines.map((l) => <LineBadge key={l.id} line={l} size={16} />)}
                <span>{focusLines.map((l) => l.short).join(' · ')}</span>
              </p>
              <p className="mt-1 font-display text-[28px] leading-tight text-[#222D52] break-words">{focus.name}</p>
              {Array.isArray(focusPlaces) && <p className="mt-0.5 text-[13px] text-[#6E6A60]">{t('r3_withinWalk').replace('{n}', String(focusPlaces.length))}</p>}
            </div>
          )}

          {/* RONDA picks: hand-picked places near the station, with photos */}
          {picks.length > 0 && (
            <>
              <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6F5F3C]">{t('r3_picks')}</h3>
              <ul className="mt-2 grid grid-cols-3 gap-2.5">
                {picks.map((p) => (
                  <li key={p.id} onMouseEnter={() => setActivePin(p.id)} onMouseLeave={() => setActivePin(null)}>
                    <Link
                      to={planToPoint(p, p.name)}
                      onFocus={() => setActivePin(p.id)}
                      className="group block h-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <img src={p.src} alt="" loading="lazy" className={`block h-[92px] w-full rounded-md object-cover ${activePin === p.id ? 'outline outline-2 outline-offset-2 outline-[#222D52]' : ''}`} />
                      <span className="block pt-1.5 text-[12.5px] font-semibold leading-snug text-[#222D52] group-hover:underline">
                        {p.name}
                        <small className="block font-normal text-[#6E6A60]">{t('r3_minWalk').replace('{min}', String(p.minutes))}</small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 id="r3-osm" className="mt-7 text-base font-semibold text-[#222D52]">{t('r3_placesInView').replace('{n}', String(matching.length))}</h2>
          <p className="mt-0.5 text-xs text-[#6B675E]">{t('r3_viewHint')}</p>

          {/* kinds of place, with how many are in view */}
          {kinds.length > 0 && (
            <div role="group" aria-label={t('r3_osmFilter')} className="mt-3 flex gap-4 overflow-x-auto border-b border-[#E4DFD5] [scrollbar-width:none]">
              {[null, ...kinds].map((k) => (
                <button key={k ?? 'all'} type="button" aria-pressed={kind === k} onClick={() => { setKind(k); setActive(null) }} className={tab(kind === k)}>
                  {k ? t(`r3c_${k}` as TranslationKey) : t('r3_osmAll')}{' '}
                  <span className="tabular-nums text-[#6B675E]">{k ? area.filter((p) => p.kind === k).length : area.length}</span>
                </button>
              ))}
            </div>
          )}

          {view && view.zoom < MIN_ZOOM ? (
            <p className="mt-6 rounded-[20px] bg-white p-5 text-sm text-gray-700">{t('r3_zoomIn')}</p>
          ) : failed ? (
            <p role="alert" className="mt-6 text-gray-700">{t('r3_osmError')}</p>
          ) : matching.length === 0 ? (
            <p role="status" className="mt-6 text-gray-500">{waiting || !stations ? t('loading') : t('r3_osmNone')}</p>
          ) : (
            <ul ref={listRef} className="max-h-[65vh] overflow-y-auto pe-1 lg:max-h-none lg:overflow-visible [scrollbar-width:thin]">
              {matching.slice(0, MAX_LISTED).map((p) => {
                const name = placeName(p, lang)
                const on = active === p.osm_id
                const min = walkMinutes(p.distance_m)
                return (
                  <li
                    key={p.osm_id}
                    data-osm={p.osm_id}
                    onMouseEnter={() => setActive(p.osm_id)}
                    onFocus={() => setActive(p.osm_id)}
                    className={`flex items-center gap-3 border-b border-s-2 border-b-[#ECE7DD] py-3 ps-2.5 transition-colors ${on ? 'border-s-[#222D52] bg-white' : 'border-s-transparent'}`}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.09em]" style={{ color: KIND_COLOR[p.kind] }}>
                        <span aria-hidden="true" className="h-[7px] w-[7px] flex-shrink-0" style={{ backgroundColor: KIND_COLOR[p.kind] }} />
                        {t(`r3k_${p.kind}` as TranslationKey)}
                      </span>
                      <span className="mt-0.5 block text-[14.5px] font-semibold text-[#222D52] break-words">{name}</span>
                      <span className="block text-xs text-[#6B675E]">
                        {t('r3_walkFrom').replace('{station}', p.station).replace('{min}', String(min))}
                      </span>
                    </span>
                    <span aria-hidden="true" className="flex-shrink-0 text-[15px] font-semibold tabular-nums text-[#222D52]">
                      {min}<small className="ms-0.5 text-[11px] font-normal text-[#6B675E]">min</small>
                    </span>
                    <Link to={planToPoint(p, name)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[#222D52] transition-colors hover:bg-[#222D52] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
                      <Icon name="chevronRight" size={18} className="rtl:rotate-180" />
                      <span className="sr-only">{`${t('r3_go')}, ${t('r3_goTo').replace('{name}', name)}`}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="mt-4 text-xs text-[#6B675E]">
            {t('r3_osmNote')}{' '}
            <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">© OpenStreetMap contributors</a>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Ronda300Explorer
