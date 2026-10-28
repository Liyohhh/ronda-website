import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Ronda300Map, { type AreaPlace, type FlyTarget, type MapView, type PhotoPin, type PinCard, type StationBubble } from './Ronda300Map'
import LineBadge from './LineBadge'
import Icon from './Icon'
import { useRailStations, type RailStation } from '../hooks/useRailStations'
import { useTrails } from '../hooks/useTrails'
import type { TranslationKey } from '../i18n/translations'
import { useLanguage } from '../hooks/useLanguage'
import { PLACE_PHOTOS } from '../data/placePhotos'
import { FEATURED_OSM, FEATURED_PLACES } from '../data/featuredPlaces'
import { distanceM, stationsWithPlaces } from '../data/ronda300'
import { placeBlurbKey } from '../data/trails'
import { KIND_COLOR, PLACE_KINDS, loadPickSpots, loadPlacesNear, placeName, planToPoint, walkMinutes, type NearPlace, type PickSpot, type PlaceKind } from '../services/places'

// places show from this zoom (a few streets across), around at most this many stations nearest the middle of the view
const MIN_ZOOM = 14.5
const MAX_STATIONS = 8
const MAX_LISTED = 120
const MAX_PICKS = 3 // photo cards in the panel
const PICK_RADIUS_M = 450 // hand-picked places this close to the station in focus are its RONDA picks
const MAX_PINS = 14 // photo pins on the map
// the kinds of place ticked at first: food, banks and everyday services are by far the most dots, so they start
// unticked (the reader ticks them on; the choice is kept in this browser)
const START_KINDS: PlaceKind[] = ['attraction', 'park', 'shopping', 'hotel', 'mosque', 'religion']
const KINDS_KEY = 'r3-kinds'
function savedKinds(): Set<PlaceKind> {
  try {
    const v = JSON.parse(localStorage.getItem(KINDS_KEY) ?? 'null')
    if (Array.isArray(v)) return new Set(v.filter((k): k is PlaceKind => PLACE_KINDS.includes(k)))
  } catch { /* no storage: start with the usual kinds */ }
  return new Set(START_KINDS)
}
const SAME_PLACE_M = 80 // a trail stop this close to a featured place is the same building

type Pick = PhotoPin & { minutes: number; distance: number }
// the photo for a featured place that has none yet: navy with a gold star
const STAR_TILE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#222D52"/><path d="M60 27l5.6 11.8 12.8 1.6-9.4 8.8 2.4 12.8L60 55.8 48.6 62l2.4-12.8-9.4-8.8 12.8-1.6z" fill="#D2B68A"/></svg>')}`
// featured places first (data/featuredPlaces.ts), the rest as they came
const featuredFirst = <T,>(list: T[], featured: (x: T) => boolean) => [...list.filter(featured), ...list.filter((x) => !featured(x))]

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
  const [active, setActive] = useState<string | null>(null)
  const [shown, setShown] = useState<Set<PlaceKind>>(savedKinds) // the ticked kinds: they show on the map and in the list
  const tick = (next: Set<PlaceKind>) => {
    setShown(next); setActive(null)
    try { localStorage.setItem(KINDS_KEY, JSON.stringify([...next])) } catch { /* kept for this visit only */ }
  }
  const [activePin, setActivePin] = useState<string | null>(null)
  const [openPick, setOpenPick] = useState<string | null>(null) // the pick whose short description is open on the map
  const navigate = useNavigate()
  const [flyTo, setFlyTo] = useState<FlyTarget>(fly)
  const listRef = useRef<HTMLUListElement>(null)
  // the row of kinds slides sideways; small arrows show there is more on either side
  const rowRef = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState({ left: false, right: false })
  const measureRow = useCallback(() => {
    const r = rowRef.current
    if (!r) return
    const start = Math.abs(r.scrollLeft), room = r.scrollWidth - r.clientWidth // RTL scrolls the other way: compare sizes only
    const next = { left: start > 2, right: start < room - 2 }
    setMore((m) => (m.left === next.left && m.right === next.right ? m : next))
  }, [])
  const slideRow = (dir: 1 | -1) => {
    const r = rowRef.current
    if (!r) return
    const rtl = getComputedStyle(r).direction === 'rtl'
    r.scrollBy({ left: dir * (rtl ? -1 : 1) * 160, behavior: 'smooth' })
  }
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
    // a featured place our OpenStreetMap places don't have (newly opened, or not tagged as a shop): added near its station
    for (const f of FEATURED_PLACES) {
      if (best.has(f.osm)) continue
      const by = near.filter((s) => Array.isArray(loadedPlaces[s.name])).map((s) => ({ s, d: Math.round(distanceM(s, f)) })).sort((a, b) => a.d - b.d)[0]
      if (by && by.d <= PICK_RADIUS_M) {
        best.set(f.osm, { osm_id: f.osm, kind: f.kind, subkind: null, name: f.name, name_en: null, name_ms: null, name_zh: null, name_ar: null,
          lat: f.lat, lon: f.lon, opening_hours: null, distance_m: by.d, station: by.s.name })
      }
    }
    const c = view.bounds.getCenter()
    const sorted = [...best.values()]
      .filter((p) => view.bounds.contains([p.lon, p.lat]))
      .sort((a, b) => (a.lat - c.lat) ** 2 + (a.lon - c.lng) ** 2 - ((b.lat - c.lat) ** 2 + (b.lon - c.lng) ** 2))
    return featuredFirst(sorted, (p) => FEATURED_OSM.has(p.osm_id))
  }, [near, loadedPlaces, view])
  const waiting = near.some((s) => !(s.name in loadedPlaces))
  const failed = near.length > 0 && near.every((s) => loadedPlaces[s.name] === 'error')
  const kinds = PLACE_KINDS.filter((k) => area.some((p) => p.kind === k))
  // re-measure the row when its kinds change or the panel is resized
  const kindsKey = kinds.join()
  useEffect(() => {
    measureRow()
    const r = rowRef.current
    if (!r) return
    const ro = new ResizeObserver(measureRow)
    ro.observe(r)
    return () => ro.disconnect()
  }, [kindsKey, measureRow])
  // the ticked kinds, and the featured places whatever is ticked
  const matching = useMemo(() => area.filter((p) => shown.has(p.kind) || FEATURED_OSM.has(p.osm_id)), [area, shown])
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
    const featured = FEATURED_PLACES.map((f) => ({ id: f.id, lat: f.lat, lon: f.lon, src: f.photo?.src ?? STAR_TILE, name: f.name, featured: true }))
    return [...featured, ...stationsWithPlaces(trails, lang).flatMap((sp) => sp.places).flatMap((p) => {
      const pos = at.get(p.id), photo = PLACE_PHOTOS[p.id]
      // a trail stop in the same building as a featured place is that place already
      const same = pos && featured.some((f) => distanceM(f, pos) < SAME_PLACE_M)
      return pos && photo && !same ? [{ id: p.id, lat: pos.lat, lon: pos.lon, src: photo.src, name: p.name, featured: false }] : []
    })]
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
      .sort((a, b) => Number(b.featured) - Number(a.featured) || a.distance - b.distance)
      .slice(0, MAX_PICKS)
  }, [allPicks, focus])

  // the open pick's short description, for the map: what it is and the walk from its nearest station
  const pinCard = useMemo<PinCard | null>(() => {
    const p = allPicks.find((x) => x.id === openPick)
    if (!p) return null
    const by = (stations ?? []).reduce<{ name: string; d: number } | null>((best, s) => {
      const d = distanceM(s, p)
      return !best || d < best.d ? { name: s.name, d } : best
    }, null)
    const walk = by ? t('r3_walkFrom').replace('{station}', by.name).replace('{min}', String(walkMinutes(by.d))) : ''
    return { id: p.id, lat: p.lat, lon: p.lon, name: p.name, text: t(placeBlurbKey(p.id)), walk, href: planToPoint(p, p.name) }
  }, [allPicks, openPick, stations, t])

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
    setOpenPick(id)
    setFlyTo((f) => ({ lat: p.lat, lon: p.lon, zoom: Math.max(view?.zoom ?? 16, 16), n: f.n + 1 }))
  }, [allPicks, view])

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
            pinCard={pinCard}
            onGo={navigate}
            onClosePin={() => setOpenPick(null)}
          />
        </div>

        <div className="bg-[#FBFAF7] px-4 py-5 md:px-6 lg:pt-0 lg:min-h-0 lg:overflow-y-auto lg:overflow-x-hidden lg:border-s lg:border-[#EEEAE2] [scrollbar-width:thin]">
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
              <h3 className="mt-6 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6F5F3C]"><Icon name="star" size={14} className="text-[#C29A52]" />{t('r3_picks')}</h3>
              <ul className="mt-2 grid grid-cols-3 gap-2.5">
                {picks.map((p) => (
                  <li key={p.id} onMouseEnter={() => setActivePin(p.id)} onMouseLeave={() => setActivePin(null)}>
                    <button
                      type="button"
                      aria-expanded={openPick === p.id}
                      onClick={() => setOpenPick((o) => (o === p.id ? null : p.id))}
                      onFocus={() => setActivePin(p.id)}
                      className="group block h-full w-full text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
                    >
                      <img src={p.src} alt="" loading="lazy" className={`block h-[92px] w-full rounded-md object-cover ${activePin === p.id || openPick === p.id ? 'outline outline-2 outline-offset-2 outline-[#222D52]' : ''}`} />
                      <span className="block pt-1.5 text-[12.5px] font-semibold leading-snug text-[#222D52] group-hover:underline">
                        {p.name}
                        <small className="block font-normal text-[#6E6A60]">{t('r3_minWalk').replace('{min}', String(p.minutes))}</small>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 id="r3-osm" className="mt-7 text-base font-semibold text-[#222D52]">{t('r3_placesInView').replace('{n}', String(matching.length))}</h2>
          <p className="mt-0.5 text-xs text-[#6B675E]">{t('r3_viewHint')}</p>

          {/* kinds of place in a row, each with a checkbox: the ticked kinds show on the map and in the list below (with how
              many are in view); All ticks every kind, or clears them when all are ticked */}
          {kinds.length > 0 && (() => {
            const all = kinds.every((k) => shown.has(k))
            const item = (key: string, on: boolean, color: string, label: string, n: number, toggle: () => void) => (
              <label key={key} className={`relative flex flex-shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap text-[13px] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold ${on ? 'font-semibold text-[#222D52]' : 'text-[#6E6A60] hover:text-[#222D52]'}`}>
                <input type="checkbox" className="sr-only" checked={on} onChange={toggle} />
                <span aria-hidden="true" className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[4px] border-[1.5px] text-white" style={on ? { backgroundColor: color, borderColor: color } : { borderColor: '#B9B2A5', backgroundColor: '#fff' }}>
                  {on && <Icon name="check" size={12} />}
                </span>
                {label} <span className="tabular-nums font-normal text-[#6B675E]">{n}</span>
              </label>
            )
            return (
              <fieldset className="mt-3 min-w-0 border-b border-[#E4DFD5] pb-3">
                <legend className="sr-only">{t('r3_osmFilter')}</legend>
                <div className="relative">
                <div ref={rowRef} onScroll={measureRow} className="flex gap-4 overflow-x-auto overscroll-x-contain px-0.5 py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {item('all', all, '#222D52', t('r3_osmAll'), area.length, () => tick(all ? new Set() : new Set(PLACE_KINDS)))}
                  {kinds.map((k) => item(k, shown.has(k), KIND_COLOR[k], t(`r3c_${k}` as TranslationKey), area.filter((p) => p.kind === k).length,
                    () => { const n = new Set(shown); if (n.has(k)) n.delete(k); else n.add(k); tick(n) }))}
                </div>
                {/* more kinds off to one side: a small arrow over a fade, pressing it slides the row */}
                {more.left && (
                  <button type="button" aria-hidden="true" tabIndex={-1} onClick={() => slideRow(-1)} className="absolute inset-y-0 start-0 flex w-9 items-center justify-start bg-gradient-to-r from-[#FBFAF7] via-[#FBFAF7]/90 to-transparent text-[#222D52] rtl:bg-gradient-to-l">
                    <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
                  </button>
                )}
                {more.right && (
                  <button type="button" aria-hidden="true" tabIndex={-1} onClick={() => slideRow(1)} className="absolute inset-y-0 end-0 flex w-9 items-center justify-end bg-gradient-to-l from-[#FBFAF7] via-[#FBFAF7]/90 to-transparent text-[#222D52] rtl:bg-gradient-to-r">
                    <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
                  </button>
                )}
                </div>
              </fieldset>
            )
          })()}

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
                        {FEATURED_OSM.has(p.osm_id) && <span className="ms-1 inline-flex items-center gap-0.5 text-[#99691A]"><Icon name="star" size={11} />{t('r3_pick')}</span>}
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
