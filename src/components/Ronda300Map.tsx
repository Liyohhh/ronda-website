import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../hooks/useLanguage'
import { mapConfig, softMapStyle } from '../services/mapStyle'
import { supabase } from '../services/supabase'
import { LINES_BY_ID } from '../data/lines'
import type { Pick } from '../data/suggestions'
import { KIND_COLOR, placeName, walkMinutes, type NearPlace } from '../services/places'

maplibregl.setWorkerUrl(workerUrl)
try {
  maplibregl.addProtocol('pmtiles', new Protocol().tile)
} catch {
  // already added by another map on the page
}

// The one RONDA 300 map. With no station picked it shows every LRT, MRT, Monorail, BRT and ERL station of the Klang
// Valley as a dot in its line's official colour (positions from public.stops); pressing a dot picks that station.
// With a station picked it flies there: the station with its name, a dashed ring at 300 m (about 5 minutes on foot)
// and every place as a dot in its kind's colour; the other stations fade. Pointing at a place in the list puts a
// callout over it (name and walk, as Rome2rio labels its stops); pressing a place's dot picks it in the list.
// Soft basemap without the map's own shop icons, so only our dots show.

const NAVY = '#222D52'
const GOLD = '#D2B68A'
const OVERVIEW = { center: [101.69, 3.12] as [number, number], zoom: 10.6 }

// rapid-rail-kl stop codes start with the line's letters (KJ10 = Kelana Jaya Line); ERL stops are all ERL
const PREFIX: [string, string][] = [
  ['KJ', 'lrt-kelana-jaya'], ['AG', 'lrt-ampang'], ['SP', 'lrt-sri-petaling'], ['SA', 'lrt-shah-alam'],
  ['KG', 'mrt-kajang'], ['PY', 'mrt-putrajaya'], ['MR', 'monorail'], ['SB', 'brt-sunway'],
]
const MODE_NAME: Record<string, string> = { LRT: 'LRT', MRT: 'MRT', MONORAIL: 'Monorail', BRT: 'BRT', ERL: 'ERL' }

type Row = { feed_id: string; stop_id: string; stop_name?: string | null; stop_lat: number; stop_lon: number }

function lineOf(r: Row) {
  if (r.feed_id === 'erl') return LINES_BY_ID['erl-klia-transit']
  const hit = PREFIX.find(([p]) => r.stop_id.toUpperCase().startsWith(p))
  return hit ? LINES_BY_ID[hit[1]] : undefined
}

// a circle of radius m around a point, as a polygon (good enough at this size)
function ring(lat: number, lon: number, m: number, n = 64): [number, number][] {
  const dLat = m / 111320
  const dLon = m / (111320 * Math.cos((lat * Math.PI) / 180))
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * 2 * Math.PI
    return [lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]
  })
}
const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

function Ronda300Map({
  focus,
  places,
  active,
  onPickStation,
  onPickPlace,
}: {
  focus: Pick | null
  places: NearPlace[]
  active: string | null
  onPickStation: (p: Pick) => void
  onPickPlace: (osmId: string) => void
}) {
  const { t, lang } = useLanguage()
  const box = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markerRef = useRef<maplibregl.Marker | null>(null)
  const calloutRef = useRef<maplibregl.Popup | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [rows, setRows] = useState<Row[] | null>(null)
  const stationRef = useRef(onPickStation)
  const placeRef = useRef(onPickPlace)
  const focusRef = useRef(focus)
  useEffect(() => { stationRef.current = onPickStation; placeRef.current = onPickPlace; focusRef.current = focus })

  // the stations, once
  useEffect(() => {
    let live = true
    supabase
      .from('stops')
      .select('feed_id, stop_id, stop_name, stop_lat, stop_lon')
      .in('feed_id', ['rapid-rail-kl', 'erl'])
      .then(({ data }) => { if (live) setRows((data ?? []) as Row[]) })
    return () => { live = false }
  }, [])

  // the map, once (rebuilt when the language changes, for the labels)
  useEffect(() => {
    if (!box.current) return
    const { pmtilesUrl, assetsUrl } = mapConfig()
    const style = softMapStyle(lang, pmtilesUrl, assetsUrl)
    style.layers = style.layers.filter((l) => !l.id.startsWith('pois'))
    const f = focusRef.current
    const map = new maplibregl.Map({
      container: box.current,
      style,
      center: f ? [f.lon, f.lat] : OVERVIEW.center,
      zoom: f ? 16 : OVERVIEW.zoom,
      attributionControl: { compact: true },
      cooperativeGestures: true,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    const hover = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })

    map.on('load', () => {
      map.addSource('stations', { type: 'geojson', data: EMPTY })
      map.addSource('walk', { type: 'geojson', data: EMPTY })
      map.addSource('places', { type: 'geojson', data: EMPTY })
      map.addLayer({ id: 'walk-fill', type: 'fill', source: 'walk', paint: { 'fill-color': NAVY, 'fill-opacity': 0.05 } })
      map.addLayer({ id: 'walk-line', type: 'line', source: 'walk', paint: { 'line-color': NAVY, 'line-width': 1.5, 'line-dasharray': [3, 2], 'line-opacity': 0.6 } })
      map.addLayer({
        id: 'stations', type: 'circle', source: 'stations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 14, 8],
          'circle-color': ['get', 'color'], 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 1.5,
          'circle-opacity-transition': { duration: 400 }, 'circle-stroke-opacity-transition': { duration: 400 },
        },
      })
      if (style.glyphs) map.addLayer({
        id: 'stations-label', type: 'symbol', source: 'stations', minzoom: 13,
        layout: { 'text-field': ['get', 'name'], 'text-size': 11, 'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-font': ['Noto Sans Medium'] },
        paint: { 'text-color': NAVY, 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 },
      })
      map.addLayer({
        id: 'places-active', type: 'circle', source: 'places', filter: ['==', ['get', 'id'], ''],
        paint: { 'circle-radius': 14, 'circle-color': ['get', 'color'], 'circle-opacity': 0.25 },
      })
      map.addLayer({
        id: 'places', type: 'circle', source: 'places',
        paint: { 'circle-radius': 6.5, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 2 },
      })
      // names on the dots when zoomed in (only with our own map file: the fallback map has no fonts)
      if (style.glyphs) map.addLayer({
        id: 'places-label', type: 'symbol', source: 'places', minzoom: 16.5,
        layout: { 'text-field': ['get', 'name'], 'text-size': 11, 'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-max-width': 9, 'text-font': ['Noto Sans Medium'] },
        paint: { 'text-color': '#1f2a40', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 },
      })

      map.on('click', 'places', (e) => { const id = e.features?.[0]?.properties?.id; if (id) placeRef.current(String(id)) })
      map.on('click', 'stations', (e) => {
        // a place's dot on top of a station wins
        if (map.queryRenderedFeatures(e.point, { layers: ['places'] }).length) return
        const ft = e.features?.[0]
        if (!ft) return
        const [lon, lat] = (ft.geometry as GeoJSON.Point).coordinates
        const { stopId, raw, name } = ft.properties as { stopId: string; raw: string; name: string }
        hover.remove()
        // the same display name the search shows (the table's own name can be in capitals)
        supabase.rpc('search_stops', { query: raw }).then(({ data }) => {
          const hit = ((data ?? []) as { stop_id: string; stop_name: string }[]).find((d) => d.stop_id === stopId)
          stationRef.current({ name: hit?.stop_name ?? name, lat, lon })
        }, () => stationRef.current({ name, lat, lon }))
      })
      for (const layer of ['places', 'stations']) {
        map.on('mouseenter', layer, (e) => {
          map.getCanvas().style.cursor = 'pointer'
          const ft = e.features?.[0]
          if (layer === 'stations' && ft && !focusRef.current) hover.setLngLat((ft.geometry as GeoJSON.Point).coordinates as [number, number]).setText(String(ft.properties?.name)).addTo(map)
        })
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; hover.remove() })
      }
      setLoaded(true)
    })
    return () => {
      calloutRef.current?.remove()
      calloutRef.current = null
      markerRef.current?.remove()
      markerRef.current = null
      hover.remove()
      map.remove()
      mapRef.current = null
      setLoaded(false)
    }
  }, [lang])

  // stations in their lines' colours
  useEffect(() => {
    const src = mapRef.current?.getSource('stations') as maplibregl.GeoJSONSource | undefined
    if (!loaded || !src || !rows) return
    src.setData({
      type: 'FeatureCollection',
      features: rows.flatMap((r) => {
        const line = lineOf(r)
        if (!line || !Number.isFinite(r.stop_lat)) return []
        const name = `${MODE_NAME[line.mode] ?? line.mode} ${r.stop_name ?? r.stop_id}`
        return [{ type: 'Feature' as const, properties: { name, raw: r.stop_name ?? r.stop_id, stopId: r.stop_id, color: line.color }, geometry: { type: 'Point' as const, coordinates: [r.stop_lon, r.stop_lat] } }]
      }),
    })
  }, [loaded, rows])

  // the picked station: fly in and draw its ring, or fly back out to every station
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    markerRef.current?.remove()
    markerRef.current = null
    const walk = map.getSource('walk') as maplibregl.GeoJSONSource
    const dim = focus ? 0.3 : 1
    map.setPaintProperty('stations', 'circle-opacity', dim)
    map.setPaintProperty('stations', 'circle-stroke-opacity', dim)
    if (map.getLayer('stations-label')) map.setLayoutProperty('stations-label', 'visibility', focus ? 'none' : 'visible')
    if (!focus) {
      walk.setData(EMPTY)
      map.flyTo({ ...OVERVIEW, duration: 900 })
      return
    }
    walk.setData({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring(focus.lat, focus.lon, 300)] } })
    // the station: navy ring with a gold middle and its name
    const pin = document.createElement('div')
    pin.className = 'flex flex-col items-center pointer-events-none'
    const label = document.createElement('span')
    label.className = 'mb-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg'
    label.style.backgroundColor = NAVY
    label.textContent = focus.name
    const dot = document.createElement('span')
    dot.className = 'block h-5 w-5 rounded-full shadow'
    dot.style.cssText = `border:5px solid ${NAVY};background:${GOLD}`
    pin.append(label, dot)
    markerRef.current = new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat([focus.lon, focus.lat]).addTo(map)
    const outer = ring(focus.lat, focus.lon, 330)
    map.fitBounds(outer.reduce((b, p) => b.extend(p), new maplibregl.LngLatBounds(outer[0], outer[0])), { padding: 24, duration: 900 })
  }, [loaded, focus])

  // the places (they change with the station and the kind filter)
  useEffect(() => {
    const src = mapRef.current?.getSource('places') as maplibregl.GeoJSONSource | undefined
    if (!loaded || !src) return
    src.setData({
      type: 'FeatureCollection',
      features: (focus ? places : []).map((p) => ({
        type: 'Feature',
        properties: { id: p.osm_id, color: KIND_COLOR[p.kind], name: placeName(p, lang) },
        geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      })),
    })
  }, [loaded, places, focus, lang])

  // the place pointed at / picked in the list
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    map.setFilter('places-active', ['==', ['get', 'id'], active ?? ''])
    calloutRef.current?.remove()
    calloutRef.current = null
    const p = focus ? places.find((x) => x.osm_id === active) : undefined
    if (!p) return
    const content = document.createElement('div')
    const name = document.createElement('strong')
    name.className = 'block text-[13px] font-semibold text-[#222D52]'
    name.textContent = placeName(p, lang)
    const walk = document.createElement('span')
    walk.className = 'block text-xs text-gray-600'
    walk.textContent = t('r3_osmWalk').replace('{m}', String(p.distance_m)).replace('{min}', String(walkMinutes(p.distance_m)))
    content.append(name, walk)
    calloutRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14, className: 'r3-callout', maxWidth: '220px' })
      .setLngLat([p.lon, p.lat]).setDOMContent(content).addTo(map)
    if (!map.getBounds().contains([p.lon, p.lat])) map.easeTo({ center: [p.lon, p.lat], duration: 400 })
  }, [loaded, active, places, focus, lang, t])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[22px] bg-gray-100">
      <div ref={box} className="h-full w-full" role="region" aria-label={focus ? t('r3_mapAria').replace('{station}', focus.name) : t('r3_previewAria')} />
      <p className="pointer-events-none absolute bottom-3 start-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#222D52] shadow">
        {focus ? t('r3_mapRing') : t('r3_previewHint')}
      </p>
    </div>
  )
}

export default Ronda300Map
