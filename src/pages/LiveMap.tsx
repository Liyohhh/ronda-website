import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Header from '../components/Header'
import BusStopName from '../components/BusStopName'
import Icon from '../components/Icon'
import RouteChip from '../components/RouteChip'
import { useLanguage } from '../hooks/useLanguage'
import { usePoll } from '../hooks/usePoll'
import { useLocate } from '../hooks/useLocate'
import { supabase } from '../services/supabase'
import { ago, lateMinutes, liveVehicles, textOn, LIVE_POLL_MS, routeKey, stopArrivals, type Arrival, type BusStatus, type LiveBus, type LiveSource, type LiveTrain } from '../services/live'
import type { TranslationKey } from '../i18n/translations'

// /live: every Rapid KL and MRT feeder bus and every KTMB train that is sending its position, on an OpenStreetMap
// map, refreshed every 30 s. Filter by route, line or train number; bus stops appear when zoomed in, and a Rapid KL
// stop shows the operator's arrival times. A train shows where it is going, its next stop and about how late it is.

const KL: [number, number] = [3.139, 101.6869]
const STOPS_ZOOM = 16
const NAVY = '#002472'

const STATUS: { key: Exclude<BusStatus, null>; label: TranslationKey; color: string }[] = [
  { key: 'on_trip', label: 'liveStatusOnTrip', color: NAVY },
  { key: 'off_trip', label: 'liveStatusOffTrip', color: '#9CA3AF' },
  { key: 'contingency', label: 'liveStatusContingency', color: '#DC2626' },
  { key: 'other', label: 'liveStatusOther', color: '#D97706' },
]
const statusColor = (b: LiveBus) => (b.status && b.status !== 'on_trip' ? STATUS.find((s) => s.key === b.status)!.color : b.colour || NAVY)

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

type Stop = { feed_id: string; stop_id: string; name: string; code: string | null; lat: number; lon: number }

// Arrivals popup for a bus stop, rendered into the Leaflet popup (its own React root, so `t` is passed in)
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

function LiveMap() {
  const { t, lang } = useLanguage()
  const el = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const busLayer = useRef<L.LayerGroup | null>(null)
  const stopLayer = useRef<L.LayerGroup | null>(null)
  const markers = useRef(new Map<string, L.Marker>())
  const trainLayer = useRef<L.LayerGroup | null>(null)
  const trainMarkers = useRef(new Map<string, L.Marker>())
  const popupRoots = useRef(new Set<Root>())
  const [buses, setBuses] = useState<LiveBus[]>([])
  const [trains, setTrains] = useState<LiveTrain[]>([])
  const [sources, setSources] = useState<LiveSource[]>([])
  const [error, setError] = useState(false)
  const [filter, setFilter] = useState('')
  const [showOff, setShowOff] = useState(false)
  const [zoom, setZoom] = useState(12)
  const [fetchedAt, setFetchedAt] = useState<number | null>(null)
  // map tiles failing (offline, blocked, tile server down) and none loaded: say so instead of a grey map
  const [tilesFailed, setTilesFailed] = useState(false)
  const tRef = useRef(t)
  useEffect(() => {
    tRef.current = t
  })

  // map, tiles and layers, once
  useEffect(() => {
    if (!el.current || map.current) return
    const m = L.map(el.current, { zoomControl: false }).setView(KL, 12)
    L.control.zoom({ position: 'bottomright' }).addTo(m)
    let loaded = 0, failed = 0
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
      .on('tileload', () => { loaded++; setTilesFailed(false) })
      .on('tileerror', () => { failed++; if (!loaded && failed >= 4) setTilesFailed(true) })
      .addTo(m)
    stopLayer.current = L.layerGroup().addTo(m)
    busLayer.current = L.layerGroup().addTo(m)
    trainLayer.current = L.layerGroup().addTo(m)
    m.on('zoomend', () => setZoom(m.getZoom()))
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
  }, [])

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
    const layer = trainLayer.current
    if (!layer) return
    const seen = new Set<string>()
    for (const tr of shownTrains) {
      seen.add(tr.vehicle_id)
      const html = `<div class="ronda-bus ronda-train" style="background:${esc(tr.colour || NAVY)};color:${textOn(tr.colour || NAVY)}">${esc(tr.train_no)}</div>`
      const icon = L.divIcon({ html, className: '', iconSize: undefined, iconAnchor: [18, 11] })
      const late = lateMinutes(tr.delay_secs)
      const popup =
        `<div class="text-sm"><div class="font-semibold">${esc(tr.network ?? tr.line ?? '')} · ${esc(t('liveTrain').replace('{no}', tr.train_no))}</div>` +
        (tr.headsign ? `<div>${esc(t('liveTrainTo').replace('{place}', tr.headsign))}</div>` : '') +
        (tr.next_stop ? `<div>${esc(t('liveNextStop').replace('{stop}', tr.next_stop))}</div>` : '') +
        (late === null ? '' : `<div class="${late ? 'text-amber-800 font-medium' : ''}">${esc(late ? t('liveLate').replace('{n}', String(late)) : t('liveOnTime'))}</div>`) +
        `<div class="text-gray-500">${esc(ago(tr.gps_at, t))}</div></div>`
      const old = trainMarkers.current.get(tr.vehicle_id)
      if (old) {
        old.setLatLng([tr.lat, tr.lon]).setIcon(icon).setPopupContent(popup)
      } else {
        const mk = L.marker([tr.lat, tr.lon], { icon, keyboard: false, title: `${tr.line ?? ''} ${tr.train_no}`, zIndexOffset: 500 }).bindPopup(popup)
        mk.addTo(layer)
        trainMarkers.current.set(tr.vehicle_id, mk)
      }
    }
    for (const [id, mk] of trainMarkers.current) if (!seen.has(id)) { layer.removeLayer(mk); trainMarkers.current.delete(id) }
  }, [shownTrains, t, lang])

  // bus markers: moved in place, so the map doesn't flicker every 30 s
  useEffect(() => {
    const layer = busLayer.current
    if (!layer) return
    const seen = new Set<string>()
    for (const b of shown) {
      seen.add(b.vehicle_id)
      const color = statusColor(b)
      const html = `<div class="ronda-bus" style="background:${esc(color)}">${esc(b.label ?? '')}${b.wheelchair ? '<span class="ronda-bus-oku" aria-hidden="true">♿</span>' : ''}</div>`
      const icon = L.divIcon({ html, className: '', iconSize: undefined, iconAnchor: [14, 11] })
      const status = STATUS.find((s) => s.key === b.status)
      const popup =
        `<div class="text-sm"><div class="font-semibold">${esc(b.label ?? b.route_id)} · ${esc(t('liveBus').replace('{plate}', b.vehicle_id))}</div>` +
        (status ? `<div>${esc(t(status.label))}</div>` : '') +
        (b.wheelchair ? `<div>♿ ${esc(t('liveWheelchair'))}</div>` : '') +
        (b.speed_kmh !== null ? `<div>${esc(t('liveSpeed').replace('{n}', String(Math.round(b.speed_kmh))))}</div>` : '') +
        `<div class="text-gray-500">${esc(ago(b.gps_at, t))}</div></div>`
      const old = markers.current.get(b.vehicle_id)
      if (old) {
        old.setLatLng([b.lat, b.lon]).setIcon(icon).setPopupContent(popup)
      } else {
        const mk = L.marker([b.lat, b.lon], { icon, keyboard: false, title: `${b.label ?? ''} ${b.vehicle_id}` }).bindPopup(popup)
        mk.addTo(layer)
        markers.current.set(b.vehicle_id, mk)
      }
    }
    for (const [id, mk] of markers.current) if (!seen.has(id)) { layer.removeLayer(mk); markers.current.delete(id) }
  }, [shown, t, lang])

  // bus stops when zoomed in; a click shows the stop's arrival times
  useEffect(() => {
    const m = map.current, layer = stopLayer.current
    if (!m || !layer) return
    let cancelled = false
    const load = () => {
      layer.clearLayers()
      if (m.getZoom() < STOPS_ZOOM) return
      const b = m.getBounds()
      supabase
        .rpc('stops_in_bbox', { min_lat: b.getSouth(), min_lon: b.getWest(), max_lat: b.getNorth(), max_lon: b.getEast() })
        .then(({ data }) => {
          if (cancelled || !data) return
          for (const s of data as Stop[]) {
            const c = L.circleMarker([s.lat, s.lon], { radius: 6, color: NAVY, weight: 2, fillColor: '#fff', fillOpacity: 1 })
            let root: Root | null = null
            c.bindPopup(() => {
              const div = document.createElement('div')
              root = createRoot(div)
              popupRoots.current.add(root)
              root.render(<StopPopup stop={s} t={tRef.current} />)
              return div
            })
            c.on('popupclose', () => {
              if (root) { popupRoots.current.delete(root); root.unmount(); root = null }
            })
            c.addTo(layer)
          }
        })
    }
    load()
    m.on('moveend', load)
    return () => {
      cancelled = true
      m.off('moveend', load)
    }
  }, [])

  // "Near me": centre on the rider and mark where they are; every failure is explained
  const meLayer = useRef<L.LayerGroup | null>(null)
  const { state: loc, locate } = useLocate()
  useEffect(() => {
    const m = map.current
    if (!m || loc.status !== 'found') return
    meLayer.current?.remove()
    meLayer.current = L.layerGroup([
      L.circle([loc.lat, loc.lon], { radius: loc.accuracy_m, color: '#2563EB', weight: 1, fillOpacity: 0.1, interactive: false }),
      L.circleMarker([loc.lat, loc.lon], { radius: 7, color: '#fff', weight: 2, fillColor: '#2563EB', fillOpacity: 1 }).bindTooltip(t('locYouAreHere')),
    ]).addTo(m)
    m.setView([loc.lat, loc.lon], Math.max(m.getZoom(), STOPS_ZOOM))
  }, [loc, t])
  const locMessage =
    loc.status === 'locating' ? t('locLocating')
    : loc.status === 'error' ? t(({ denied: 'locDenied', unavailable: 'locUnavailable', timeout: 'locTimeout', unsupported: 'locUnsupported' } as const)[loc.reason])
    : null

  const lastFetch = sources.length ? Math.max(...sources.map((s) => Date.parse(s.fetched_at))) : null

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="relative flex-1 min-h-0">
        <div ref={el} className="absolute inset-0 z-0" role="application" aria-label={t('liveMapTitle')} />
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
