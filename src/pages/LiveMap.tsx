import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import * as maplibregl from 'maplibre-gl'
import type { Feature, Polygon } from 'geojson'
import { Protocol } from 'pmtiles'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import Header from '../components/Header'
import BusStopName from '../components/BusStopName'
import Icon from '../components/Icon'
import RouteChip from '../components/RouteChip'
import { useLanguage } from '../hooks/useLanguage'
import { usePoll } from '../hooks/usePoll'
import { useLocate } from '../hooks/useLocate'
import { supabase } from '../services/supabase'
import { mapConfig, mapStyle } from '../services/mapStyle'
import { ago, lateMinutes, liveVehicles, textOn, LIVE_POLL_MS, routeKey, stopArrivals, type Arrival, type BusStatus, type LiveBus, type LiveSource, type LiveTrain } from '../services/live'
import type { TranslationKey } from '../i18n/translations'

// /live: every Rapid KL and MRT feeder bus and every KTMB train that is sending its position, on RONDA's own
// Malaysia map (MapLibre + OpenStreetMap data, src/services/mapStyle.ts), refreshed every 30 s. Filter by route,
// line or train number; bus stops appear when zoomed in, and a Rapid KL stop shows the operator's arrival times.
// A train shows where it is going, its next stop and about how late it is.

// MapLibre's worker, bundled by Vite (its default lookup breaks under the dev server's pre-bundling)
maplibregl.setWorkerUrl(workerUrl)
// pmtiles:// URLs read our single map file with HTTP range requests (registered once)
maplibregl.addProtocol('pmtiles', new Protocol().tile)

const KL: [number, number] = [101.6869, 3.139] // lon, lat
const STOPS_ZOOM = 16
const NAVY = '#002472'
const ME = '#2563EB'

const STATUS: { key: Exclude<BusStatus, null>; label: TranslationKey; color: string }[] = [
  { key: 'on_trip', label: 'liveStatusOnTrip', color: NAVY },
  { key: 'off_trip', label: 'liveStatusOffTrip', color: '#9CA3AF' },
  { key: 'contingency', label: 'liveStatusContingency', color: '#DC2626' },
  { key: 'other', label: 'liveStatusOther', color: '#D97706' },
]
const statusColor = (b: LiveBus) => (b.status && b.status !== 'on_trip' ? STATUS.find((s) => s.key === b.status)!.color : b.colour || NAVY)

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

type Stop = { feed_id: string; stop_id: string; name: string; code: string | null; lat: number; lon: number }

// a circle of `m` metres around a point, as a GeoJSON polygon (location accuracy)
function circle(lon: number, lat: number, m: number): Feature<Polygon> {
  const pts: [number, number][] = []
  const dLat = m / 111320, dLon = m / (111320 * Math.cos((lat * Math.PI) / 180))
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * 2 * Math.PI; pts.push([lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]) }
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [pts] } }
}

// Arrivals popup for a bus stop, rendered into the map popup (its own React root, so `t` is passed in)
function StopPopup({ stop, t }: { stop: Stop; t: (k: TranslationKey) => string }) {
  const [res, setRes] = useState<{ arrivals: Arrival[]; supported: boolean } | null | 'error'>(null)
  useEffect(() => {
    let live = true
    stopArrivals(stop.feed_id, stop.stop_id).then((r) => live && setRes(r)).catch(() => live && setRes('error'))
    return () => {
      live = false
    }
  }, [stop.feed_id, stop.stop_id])
  return (
    <div className="min-w-[200px] text-sm">
      <div className="font-semibold text-gray-900">
        <BusStopName logo code={stop.code} name={stop.name} />
      </div>
      <div className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-500">{t('liveArrivals')}</div>
      {res === null && <div className="text-gray-500">{t('liveLoading')}</div>}
      {res === 'error' && <div className="text-gray-500">{t('liveError')}</div>}
      {res && res !== 'error' && !res.supported && <div className="text-gray-500">{t('liveArrivalsUnsupported')}</div>}
      {res && res !== 'error' && res.supported && !res.arrivals.length && <div className="text-gray-500">{t('liveNoArrivals')}</div>}
      {res && res !== 'error' && res.arrivals.length > 0 && (
        <ul className="mt-1 space-y-1">
          {res.arrivals.map((a) => (
            <li key={`${a.route_id}-${a.vehicle_id}`} className="flex items-center gap-2">
              <RouteChip code={a.label ?? a.route_id} size="sm" />
              <span className="font-semibold text-gray-900">{a.eta_secs < 60 ? t('liveDue') : t('liveMinAway').replace('{n}', String(Math.round(a.eta_secs / 60)))}</span>
              <span className="ms-auto text-xs text-gray-500 tabular-nums">{a.vehicle_id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// A vehicle marker: an HTML element with a popup, moved and updated in place on every refresh
function upsertMarker(map: maplibregl.Map, all: Map<string, maplibregl.Marker>, id: string, lon: number, lat: number,
                      html: string, title: string, popup: string, z: number) {
  const old = all.get(id)
  if (old) {
    old.setLngLat([lon, lat])
    const el = old.getElement()
    if (el.innerHTML !== html) el.innerHTML = html
    el.title = title
    old.getPopup()?.setHTML(popup)
    return
  }
  const el = document.createElement('div')
  el.innerHTML = html
  el.title = title
  el.style.zIndex = String(z)
  el.style.cursor = 'pointer'
  const mk = new maplibregl.Marker({ element: el, anchor: 'center' }).setLngLat([lon, lat])
    .setPopup(new maplibregl.Popup({ offset: 14, maxWidth: '280px' }).setHTML(popup)).addTo(map)
  all.set(id, mk)
}
const removeMissing = (all: Map<string, maplibregl.Marker>, seen: Set<string>) => {
  for (const [id, mk] of all) if (!seen.has(id)) { mk.remove(); all.delete(id) }
}

function LiveMap() {
  const { t, lang } = useLanguage()
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const markers = useRef(new Map<string, maplibregl.Marker>())
  const trainMarkers = useRef(new Map<string, maplibregl.Marker>())
  const stopMarkers = useRef<maplibregl.Marker[]>([])
  const popupRoots = useRef(new Set<Root>())
  const [ready, setReady] = useState(false)
  const [buses, setBuses] = useState<LiveBus[]>([])
  const [trains, setTrains] = useState<LiveTrain[]>([])
  const [sources, setSources] = useState<LiveSource[]>([])
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('')
  const [showOff, setShowOff] = useState(false)
  const [zoom, setZoom] = useState(12)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  // map tiles failing (offline, blocked, map file down) and none loaded: say so instead of a blank map
  const [tilesFailed, setTilesFailed] = useState(false)
  const tRef = useRef(t)
  useEffect(() => {
    tRef.current = t
  })

  // map, once
  useEffect(() => {
    if (!el.current || map.current) return
    const { pmtilesUrl, assetsUrl } = mapConfig()
    const m = new maplibregl.Map({
      container: el.current,
      style: mapStyle(lang, pmtilesUrl, assetsUrl),
      center: KL,
      zoom: 12,
      maxZoom: 19,
      attributionControl: { compact: true },
    })
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    let loaded = 0, failed = 0
    m.on('sourcedata', (e) => { if (e.tile) { loaded++; setTilesFailed(false) } })
    m.on('error', () => { failed++; if (!loaded && failed >= 4) setTilesFailed(true) })
    m.on('zoomend', () => setZoom(m.getZoom()))
    m.once('load', () => setReady(true))
    map.current = m
    const roots = popupRoots.current
    const all = markers.current
    const allTrains = trainMarkers.current
    return () => {
      roots.forEach((r) => r.unmount())
      roots.clear()
      all.clear()
      allTrains.clear()
      m.remove()
      map.current = null
    }
    // the style follows the language in its own effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // map labels in the site language (vector map only; the development fallback has no labels to change)
  const firstLang = useRef(lang)
  useEffect(() => {
    const m = map.current
    if (!m || lang === firstLang.current) return
    firstLang.current = lang
    const { pmtilesUrl, assetsUrl } = mapConfig()
    if (pmtilesUrl) m.setStyle(mapStyle(lang, pmtilesUrl, assetsUrl))
  }, [lang])

  usePoll(() => {
    liveVehicles()
      .then((r) => {
        setBuses(r.vehicles)
        setTrains(r.trains ?? [])
        setSources(r.sources)
        setError(false)
        setFetchedAt(Date.now())
      })
      .catch(() => setError(true))
  }, LIVE_POLL_MS, 'all')

  const key = routeKey(filter.trim())
  const shown = useMemo(
    () => buses.filter((b) => (showOff || b.status !== 'off_trip') && (!key || routeKey(b.label ?? b.route_id).startsWith(key))),
    [buses, showOff, key],
  )
  const shownTrains = useMemo(
    () => trains.filter((tr) => !key || [tr.train_no, tr.line, tr.network, tr.unit].some((x) => x && routeKey(x).includes(key))),
    [trains, key],
  )

  // train markers: the train number on the line's colour; the popup says where it is going and how late
  useEffect(() => {
    const m = map.current
    if (!m) return
    const seen = new Set<string>()
    for (const tr of shownTrains) {
      seen.add(tr.vehicle_id)
      const html = `<div class="ronda-bus ronda-train" style="background:${esc(tr.colour || NAVY)};color:${textOn(tr.colour || NAVY)}">${esc(tr.train_no)}</div>`
      const late = lateMinutes(tr.delay_secs)
      const popup =
        `<div class="text-sm"><div class="font-semibold">${esc(tr.network ?? tr.line ?? '')} · ${esc(t('liveTrain').replace('{no}', tr.train_no))}</div>` +
        (tr.headsign ? `<div>${esc(t('liveTrainTo').replace('{place}', tr.headsign))}</div>` : '') +
        (tr.next_stop ? `<div>${esc(t('liveNextStop').replace('{stop}', tr.next_stop))}</div>` : '') +
        (late === null ? '' : `<div class="${late ? 'text-amber-800 font-medium' : ''}">${esc(late ? t('liveLate').replace('{n}', String(late)) : t('liveOnTime'))}</div>`) +
        `<div class="text-gray-500">${esc(ago(tr.gps_at, t))}</div></div>`
      upsertMarker(m, trainMarkers.current, tr.vehicle_id, tr.lon, tr.lat, html, `${tr.line ?? ''} ${tr.train_no}`, popup, 3)
    }
    removeMissing(trainMarkers.current, seen)
  }, [shownTrains, t, lang])

  // bus markers: moved in place, so the map doesn't flicker every 30 s
  useEffect(() => {
    const m = map.current
    if (!m) return
    const seen = new Set<string>()
    for (const b of shown) {
      seen.add(b.vehicle_id)
      const html = `<div class="ronda-bus" style="background:${esc(statusColor(b))}">${esc(b.label ?? '')}${b.wheelchair ? '<span class="ronda-bus-oku" aria-hidden="true">♿</span>' : ''}</div>`
      const status = STATUS.find((s) => s.key === b.status)
      const popup =
        `<div class="text-sm"><div class="font-semibold">${esc(b.label ?? b.route_id)} · ${esc(t('liveBus').replace('{plate}', b.vehicle_id))}</div>` +
        (status ? `<div>${esc(t(status.label))}</div>` : '') +
        (b.wheelchair ? `<div>♿ ${esc(t('liveWheelchair'))}</div>` : '') +
        (b.speed_kmh !== null ? `<div>${esc(t('liveSpeed').replace('{n}', String(Math.round(b.speed_kmh))))}</div>` : '') +
        `<div class="text-gray-500">${esc(ago(b.gps_at, t))}</div></div>`
      upsertMarker(m, markers.current, b.vehicle_id, b.lon, b.lat, html, `${b.label ?? ''} ${b.vehicle_id}`, popup, 2)
    }
    removeMissing(markers.current, seen)
  }, [shown, t, lang])

  // bus stops when zoomed in; a click shows the stop's arrival times
  useEffect(() => {
    const m = map.current
    if (!m) return
    let cancelled = false, seq = 0
    const clear = () => { for (const mk of stopMarkers.current) mk.remove(); stopMarkers.current = [] }
    const load = () => {
      const mine = ++seq
      if (m.getZoom() < STOPS_ZOOM) { clear(); return }
      const b = m.getBounds()
      supabase
        .rpc('stops_in_bbox', { min_lat: b.getSouth(), min_lon: b.getWest(), max_lat: b.getNorth(), max_lon: b.getEast() })
        .then(({ data }) => {
          if (cancelled || mine !== seq || !data) return
          clear()
          for (const s of data as Stop[]) {
            const dot = document.createElement('button')
            dot.type = 'button'
            dot.className = 'ronda-stop'
            dot.setAttribute('aria-label', s.name)
            let root: Root | null = null
            const popup = new maplibregl.Popup({ offset: 8, maxWidth: '300px' })
            popup.on('open', () => {
              const div = document.createElement('div')
              root = createRoot(div)
              popupRoots.current.add(root)
              root.render(<StopPopup stop={s} t={tRef.current} />)
              popup.setDOMContent(div)
            })
            popup.on('close', () => {
              if (root) { const r = root; root = null; popupRoots.current.delete(r); setTimeout(() => r.unmount()) }
            })
            stopMarkers.current.push(new maplibregl.Marker({ element: dot }).setLngLat([s.lon, s.lat]).setPopup(popup).addTo(m))
          }
        })
    }
    load()
    m.on('moveend', load)
    return () => {
      cancelled = true
      m.off('moveend', load)
      clear()
    }
  }, [])

  // "Near me": centre on the rider and mark where they are (dot + accuracy circle); every failure is explained
  const meMarker = useRef<maplibregl.Marker | null>(null)
  const { state: loc, locate } = useLocate()
  useEffect(() => {
    const m = map.current
    if (!m || loc.status !== 'found') return
    const area = circle(loc.lon, loc.lat, loc.accuracy_m)
    // the accuracy circle is a map layer, so it waits for the style; the dot below does not
    const draw = () => {
      if (!m.isStyleLoaded()) return
      const src = m.getSource('me') as maplibregl.GeoJSONSource | undefined
      if (src) src.setData(area)
      else {
        m.addSource('me', { type: 'geojson', data: area })
        m.addLayer({ id: 'me-accuracy', type: 'fill', source: 'me', paint: { 'fill-color': ME, 'fill-opacity': 0.1 } })
        m.addLayer({ id: 'me-accuracy-line', type: 'line', source: 'me', paint: { 'line-color': ME, 'line-width': 1 } })
      }
    }
    draw()
    m.on('style.load', draw) // first load, and a language change reloads the style: draw the circle again
    meMarker.current?.remove()
    const dot = document.createElement('div')
    dot.className = 'ronda-me'
    dot.title = t('locYouAreHere')
    dot.setAttribute('role', 'img')
    dot.setAttribute('aria-label', t('locYouAreHere'))
    meMarker.current = new maplibregl.Marker({ element: dot }).setLngLat([loc.lon, loc.lat]).addTo(m)
    m.easeTo({ center: [loc.lon, loc.lat], zoom: Math.max(m.getZoom(), STOPS_ZOOM) })
    return () => { m.off('style.load', draw) }
  }, [loc, t, ready])
  const locMessage =
    loc.status === 'locating' ? t('locLocating')
    : loc.status === 'error' ? t(({ denied: 'locDenied', unavailable: 'locUnavailable', timeout: 'locTimeout', unsupported: 'locUnsupported' } as const)[loc.reason])
    : null

  const lastFetch = sources.length ? Math.max(...sources.map((s) => Date.parse(s.fetched_at))) : null

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="relative flex-1 min-h-0">
        {/* MapLibre's own CSS makes its container position: relative, so the container sits inside the sized box */}
        <div className="absolute inset-0 z-0">
          <div ref={el} className="h-full w-full" role="application" aria-label={t('liveMapTitle')} />
        </div>
        {tilesFailed && (
          <div className="absolute z-[400] inset-x-3 bottom-6 md:inset-x-auto md:end-6 md:max-w-sm rounded-xl bg-white border border-amber-300 shadow-lg px-4 py-3 text-sm text-amber-900" role="alert">
            {t('mapLoadError')}
          </div>
        )}

        {/* controls */}
        <section className="absolute z-[500] top-3 start-3 end-3 md:end-auto md:w-[340px] bg-white rounded-2xl shadow-xl border border-gray-200 p-4">
          <h1 className="text-lg font-bold text-[#002472]">{t('liveMapTitle')}</h1>
          <p className="text-sm text-gray-600" aria-live="polite">
            {error && !buses.length ? t('liveError') : fetchedAt ? t('liveBusesCount').replace('{n}', String(shown.length)) : t('liveLoading')}
            {fetchedAt && shownTrains.length > 0 && <span> · {t('liveTrainsCount').replace('{n}', String(shownTrains.length))}</span>}
            {lastFetch && <span className="text-gray-500"> · {t('liveUpdated').replace('{time}', new Date(lastFetch).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' }))}</span>}
          </p>
          <div className="mt-3 flex gap-2">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t('liveFilterPh')}
              aria-label={t('liveFilterPh')}
              className="flex-1 min-w-0 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#002472]"
            />
            <button
              type="button"
              onClick={locate}
              disabled={loc.status === 'locating'}
              aria-label={t('liveNearMe')}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-[#002472] hover:border-[#002472]/50 whitespace-nowrap"
            >
              <Icon name="myLocation" size={16} />
              <span className="hidden sm:inline">{t('liveNearMe')}</span>
            </button>
          </div>
          {locMessage && (
            <p className={`mt-2 text-sm ${loc.status === 'error' ? 'text-amber-800' : 'text-gray-600'}`} role="status">
              {locMessage}
            </p>
          )}
          <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={showOff} onChange={(e) => setShowOff(e.target.checked)} className="accent-[#002472]" />
            {t('liveShowOffTrip')}
          </label>
          <ul className="mt-3 hidden md:flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600">
            {STATUS.filter((s) => showOff || s.key !== 'off_trip').map((s) => (
              <li key={s.key} className="inline-flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} aria-hidden="true" />
                {t(s.label)}
              </li>
            ))}
            <li className="inline-flex items-center gap-1">♿ {t('liveWheelchair')}</li>
          </ul>
          {zoom < STOPS_ZOOM && <p className="mt-2 hidden md:block text-xs text-gray-500">{t('liveZoomStops')}</p>}
          <p className="mt-2 text-[11px] text-gray-500">{t('liveSources')}</p>
        </section>
      </main>
    </div>
  )
}

export default LiveMap
