import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../hooks/useLanguage'
import { mapConfig, softMapStyle } from '../services/mapStyle'
import type { RailStation } from '../hooks/useRailStations'
import { KIND_COLOR, KIND_ICON, PLACE_KINDS, placeName, walkMinutes, type NearPlace } from '../services/places'
import { ICONS } from '../data/icons'
import { LINES, lineBadgeSvg } from '../data/lines'

maplibregl.setWorkerUrl(workerUrl)
try {
  maplibregl.addProtocol('pmtiles', new Protocol().tile)
} catch {
  // already added by another map on the page
}

// The RONDA 300 map (the right half of the RONDA 300 page): the rail stations (small dots in their lines' official
// colours from afar, each line's badge with the station's name closer in), a dashed 300 m ring (about 5 minutes on
// foot) around each station whose places are shown, and those places as round markers with their kind's icon. It reports the area in view after every move (the list beside it follows the map).
// Pointing at a place in the list puts a callout over it (name and walk, as Rome2rio labels its stops); pressing a
// place's dot picks it in the list; pressing a station flies in to it. Soft basemap without the map's own shop icons.

export type AreaPlace = NearPlace & { station: string } // distance_m is from that station
export type MapView = { bounds: maplibregl.LngLatBounds; zoom: number }
export type FlyTarget = { lat: number; lon: number; zoom: number; n: number } // n: a new number for every fly

// map images drawn from our own SVGs: a round marker per kind of place (the kind's colour, a white icon, a white
// edge) and each line's badge for the stations; drawn at twice the size for sharp screens
function svgImage(svg: string) {
  return new Promise<HTMLImageElement>((done, fail) => {
    const img = new Image()
    img.onload = () => done(img)
    img.onerror = fail
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  })
}
const kindMarker = (color: string, icon: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="${color}" stroke="#FFFFFF" stroke-width="4"/>` +
  `<g transform="translate(15 15) scale(1.0833)" color="#FFFFFF">${icon}</g></svg>`
async function addImages(map: maplibregl.Map) {
  const add = async (id: string, svg: string) => { if (!map.hasImage(id)) map.addImage(id, await svgImage(svg), { pixelRatio: 2 }) }
  await Promise.all([
    ...PLACE_KINDS.map((k) => add(`kind-${k}`, kindMarker(KIND_COLOR[k], ICONS[KIND_ICON[k] as keyof typeof ICONS] ?? ''))),
    ...LINES.map((l) => add(`line-${l.id}`, lineBadgeSvg(l, { title: false }).replace('width="48" height="48"', 'width="56" height="56"'))),
  ])
}

// a circle of radius m around a point, as a polygon (good enough at this size)
function ring(lat: number, lon: number, m: number, n = 48): [number, number][] {
  const dLat = m / 111320
  const dLon = m / (111320 * Math.cos((lat * Math.PI) / 180))
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * 2 * Math.PI
    return [lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]
  })
}

function Ronda300Map({
  stations,
  rings,
  places,
  active,
  fly,
  onPickPlace,
  onView,
}: {
  stations: RailStation[]
  rings: RailStation[] // the stations whose places are shown
  places: AreaPlace[]
  active: string | null
  fly: FlyTarget
  onPickPlace: (osmId: string) => void
  onView: (v: MapView) => void
}) {
  const { t, lang } = useLanguage()
  const box = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const calloutRef = useRef<maplibregl.Popup | null>(null)
  const [loaded, setLoaded] = useState(false)
  const placeRef = useRef(onPickPlace)
  const viewRef = useRef(onView)
  const flyRef = useRef(fly)
  useEffect(() => { placeRef.current = onPickPlace; viewRef.current = onView; flyRef.current = fly })

  // the map, once (rebuilt when the language changes, for the labels)
  useEffect(() => {
    if (!box.current) return
    const { pmtilesUrl, assetsUrl } = mapConfig()
    const style = softMapStyle(lang, pmtilesUrl, assetsUrl)
    style.layers = style.layers.filter((l) => !l.id.startsWith('pois'))
    const f = flyRef.current
    const map = new maplibregl.Map({
      container: box.current,
      style,
      center: [f.lon, f.lat],
      zoom: f.zoom,
      attributionControl: { compact: true },
      cooperativeGestures: true,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    const hover = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
    const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] }

    map.on('load', async () => {
      try { await addImages(map) } catch { /* without the images the markers below simply do not draw */ }
      if (mapRef.current !== map) return
      map.addSource('rings', { type: 'geojson', data: EMPTY })
      map.addSource('stations', { type: 'geojson', data: EMPTY })
      map.addSource('places', { type: 'geojson', data: EMPTY })
      map.addLayer({ id: 'rings-fill', type: 'fill', source: 'rings', paint: { 'fill-color': '#222D52', 'fill-opacity': 0.035 } })
      map.addLayer({ id: 'rings-line', type: 'line', source: 'rings', paint: { 'line-color': '#222D52', 'line-width': 1.4, 'line-dasharray': [2, 2], 'line-opacity': 0.45 } })
      // the place pointed at: a soft halo under its marker
      map.addLayer({
        id: 'places-active', type: 'circle', source: 'places', filter: ['==', ['get', 'id'], ''],
        paint: { 'circle-radius': 22, 'circle-color': ['get', 'color'], 'circle-opacity': 0.22, 'circle-blur': 0.2 },
      })
      // places: a round marker with the kind's icon, a little bigger the closer in (nearest the middle on top)
      map.addLayer({
        id: 'places', type: 'symbol', source: 'places',
        layout: {
          'icon-image': ['concat', 'kind-', ['get', 'kind']],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 14, 0.62, 17, 0.9],
          'icon-allow-overlap': true,
          'symbol-sort-key': ['get', 'rank'],
        },
      })
      map.addLayer({
        id: 'places-on', type: 'symbol', source: 'places', filter: ['==', ['get', 'id'], ''],
        layout: { 'icon-image': ['concat', 'kind-', ['get', 'kind']], 'icon-size': 1.15, 'icon-allow-overlap': true },
      })
      // stations: small dots in the line's colour from afar, the line's badge with the station's name closer in
      map.addLayer({
        id: 'stations-dot', type: 'circle', source: 'stations', maxzoom: 13,
        paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 3.5, 13, 5.5], 'circle-color': ['get', 'color'], 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 1.5 },
      })
      map.addLayer({
        id: 'stations', type: 'symbol', source: 'stations', minzoom: 13,
        layout: {
          'icon-image': ['concat', 'line-', ['get', 'line']],
          'icon-size': ['interpolate', ['linear'], ['zoom'], 13, 0.5, 16, 0.75],
          'icon-allow-overlap': true,
          ...(style.glyphs ? {
            'text-field': ['get', 'name'], 'text-size': 12, 'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-optional': true,
            'text-font': ['Noto Sans Medium'], 'text-max-width': 10,
          } : {}),
        },
        paint: { 'text-color': '#222D52', 'text-halo-color': '#FFFFFF', 'text-halo-width': 2 },
      })
      // names on the place markers when zoomed right in (only with our own map file: the fallback map has no fonts)
      if (style.glyphs) map.addLayer({
        id: 'places-label', type: 'symbol', source: 'places', minzoom: 17.2,
        layout: { 'text-field': ['get', 'name'], 'text-size': 11, 'text-offset': [0, 1.4], 'text-anchor': 'top', 'text-max-width': 9, 'text-font': ['Noto Sans Medium'], 'text-optional': true },
        paint: { 'text-color': '#1f2a40', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.6 },
      })

      map.on('click', 'places', (e) => { const id = e.features?.[0]?.properties?.id; if (id) placeRef.current(String(id)) })
      const flyToStation = (e: maplibregl.MapLayerMouseEvent) => {
        const ft = e.features?.[0]
        if (!ft || map.queryRenderedFeatures(e.point, { layers: ['places'] }).length) return
        const [lon, lat] = (ft.geometry as GeoJSON.Point).coordinates
        map.flyTo({ center: [lon, lat], zoom: Math.max(map.getZoom(), 16), duration: 800 })
      }
      map.on('click', 'stations', flyToStation)
      map.on('click', 'stations-dot', flyToStation)
      for (const layer of ['places', 'stations', 'stations-dot']) {
        map.on('mouseenter', layer, (e) => {
          map.getCanvas().style.cursor = 'pointer'
          const ft = e.features?.[0]
          if (layer === 'stations-dot' && ft) hover.setLngLat((ft.geometry as GeoJSON.Point).coordinates as [number, number]).setText(String(ft.properties?.name)).addTo(map)
        })
        map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = ''; hover.remove() })
      }
      const report = () => viewRef.current({ bounds: map.getBounds(), zoom: map.getZoom() })
      map.on('moveend', report)
      report()
      setLoaded(true)
    })
    return () => {
      calloutRef.current?.remove()
      calloutRef.current = null
      hover.remove()
      map.remove()
      mapRef.current = null
      setLoaded(false)
    }
  }, [lang])

  // flying somewhere asked for (a station from the search)
  useEffect(() => {
    if (loaded && fly.n) mapRef.current?.flyTo({ center: [fly.lon, fly.lat], zoom: fly.zoom, duration: 900 })
  }, [loaded, fly])

  useEffect(() => {
    const src = mapRef.current?.getSource('stations') as maplibregl.GeoJSONSource | undefined
    if (!loaded || !src) return
    src.setData({
      type: 'FeatureCollection',
      features: stations.map((st) => ({ type: 'Feature' as const, properties: { name: st.name, color: st.line.color, line: st.line.id }, geometry: { type: 'Point' as const, coordinates: [st.lon, st.lat] } })),
    })
  }, [loaded, stations])

  useEffect(() => {
    const src = mapRef.current?.getSource('rings') as maplibregl.GeoJSONSource | undefined
    if (!loaded || !src) return
    src.setData({
      type: 'FeatureCollection',
      features: rings.map((st) => ({ type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: [ring(st.lat, st.lon, 300)] } })),
    })
  }, [loaded, rings])

  useEffect(() => {
    const src = mapRef.current?.getSource('places') as maplibregl.GeoJSONSource | undefined
    if (!loaded || !src) return
    src.setData({
      type: 'FeatureCollection',
      features: places.map((p, i) => ({
        type: 'Feature',
        properties: { id: p.osm_id, kind: p.kind, color: KIND_COLOR[p.kind], name: placeName(p, lang), rank: -i },
        geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      })),
    })
  }, [loaded, places, lang])

  // the place pointed at / picked in the list
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    map.setFilter('places-active', ['==', ['get', 'id'], active ?? ''])
    map.setFilter('places-on', ['==', ['get', 'id'], active ?? ''])
    calloutRef.current?.remove()
    calloutRef.current = null
    const p = places.find((x) => x.osm_id === active)
    if (!p) return
    const content = document.createElement('div')
    const name = document.createElement('strong')
    name.className = 'block text-[13px] font-semibold text-[#222D52]'
    name.textContent = placeName(p, lang)
    const walk = document.createElement('span')
    walk.className = 'block text-xs text-gray-600'
    walk.textContent = t('r3_walkFrom').replace('{station}', p.station).replace('{min}', String(walkMinutes(p.distance_m)))
    content.append(name, walk)
    calloutRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 22, className: 'r3-callout', maxWidth: '240px' })
      .setLngLat([p.lon, p.lat]).setDOMContent(content).addTo(map)
  }, [loaded, active, places, lang, t])

  return (
    <div className="r3-map relative h-full w-full overflow-hidden rounded-[22px] bg-gray-100">
      <div ref={box} className="h-full w-full" role="region" aria-label={t('r3_previewAria')} />
      <p className="pointer-events-none absolute top-3 start-3 max-w-[calc(100%-4.5rem)] rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#222D52] shadow">
        {t('r3_mapRing')}
      </p>
    </div>
  )
}

export default Ronda300Map
