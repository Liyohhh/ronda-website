import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../hooks/useLanguage'
import { mapConfig, softMapStyle } from '../services/mapStyle'
import { KIND_COLOR, placeName, type NearPlace } from '../services/places'

maplibregl.setWorkerUrl(workerUrl)
try {
  maplibregl.addProtocol('pmtiles', new Protocol().tile)
} catch {
  // already added by another map on the page
}

// RONDA 300 map: the station in the middle, a dashed ring at 300 m (about 5 minutes on foot) and every place as a
// dot in its kind's colour. The list beside it and the map are one: pointing at a place in the list rings its dot,
// pressing a dot picks that place in the list. Soft basemap without the map's own shop icons, so only our places show.

const NAVY = '#222D52'
const GOLD = '#D2B68A'

// a circle of radius m around a point, as a polygon (good enough at this size)
function ring(lat: number, lon: number, m: number, n = 64): [number, number][] {
  const dLat = m / 111320
  const dLon = m / (111320 * Math.cos((lat * Math.PI) / 180))
  return Array.from({ length: n + 1 }, (_, i) => {
    const a = (i / n) * 2 * Math.PI
    return [lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]
  })
}

function StationAroundMap({
  station,
  places,
  active,
  onPick,
}: {
  station: { name: string; lat: number; lon: number }
  places: NearPlace[]
  active: string | null
  onPick: (osmId: string) => void
}) {
  const { t, lang } = useLanguage()
  const box = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const [loaded, setLoaded] = useState(false)
  const pickRef = useRef(onPick)
  useEffect(() => { pickRef.current = onPick }, [onPick])

  // the map, once per station
  useEffect(() => {
    if (!box.current) return
    const { pmtilesUrl, assetsUrl } = mapConfig()
    const style = softMapStyle(lang, pmtilesUrl, assetsUrl)
    style.layers = style.layers.filter((l) => !l.id.startsWith('pois'))
    const map = new maplibregl.Map({
      container: box.current,
      style,
      center: [station.lon, station.lat],
      zoom: 16,
      attributionControl: { compact: true },
      cooperativeGestures: true,
    })
    mapRef.current = map
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')
    const outer = ring(station.lat, station.lon, 330)
    map.fitBounds(outer.reduce((b, p) => b.extend(p), new maplibregl.LngLatBounds(outer[0], outer[0])), { padding: 24, duration: 0 })

    // the station: navy ring with a gold middle and its name
    const pin = document.createElement('div')
    pin.className = 'flex flex-col items-center pointer-events-none'
    const label = document.createElement('span')
    label.className = 'mb-1 whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold text-white shadow-lg'
    label.style.backgroundColor = NAVY
    label.textContent = station.name
    const dot = document.createElement('span')
    dot.className = 'block h-5 w-5 rounded-full shadow'
    dot.style.cssText = `border:5px solid ${NAVY};background:${GOLD}`
    pin.append(label, dot)
    const marker = new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat([station.lon, station.lat]).addTo(map)

    map.on('load', () => {
      map.addSource('walk', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring(station.lat, station.lon, 300)] } } })
      map.addLayer({ id: 'walk-fill', type: 'fill', source: 'walk', paint: { 'fill-color': NAVY, 'fill-opacity': 0.05 } })
      map.addLayer({ id: 'walk-line', type: 'line', source: 'walk', paint: { 'line-color': NAVY, 'line-width': 1.5, 'line-dasharray': [3, 2], 'line-opacity': 0.6 } })
      map.addSource('places', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
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
      map.on('click', 'places', (e) => { const id = e.features?.[0]?.properties?.id; if (id) pickRef.current(String(id)) })
      map.on('mouseenter', 'places', () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', 'places', () => { map.getCanvas().style.cursor = '' })
      setLoaded(true)
    })
    return () => {
      marker.remove()
      map.remove()
      mapRef.current = null
      setLoaded(false)
    }
    // one map per station; language changes rebuild it for the labels
  }, [station.lat, station.lon, station.name, lang])

  // the places (they change with the kind filter)
  useEffect(() => {
    const src = mapRef.current?.getSource('places') as maplibregl.GeoJSONSource | undefined
    if (!loaded || !src) return
    src.setData({
      type: 'FeatureCollection',
      features: places.map((p) => ({
        type: 'Feature',
        properties: { id: p.osm_id, color: KIND_COLOR[p.kind], name: placeName(p, lang) },
        geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
      })),
    })
  }, [loaded, places, lang])

  // the place pointed at / picked in the list
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    map.setFilter('places-active', ['==', ['get', 'id'], active ?? ''])
    const p = places.find((x) => x.osm_id === active)
    if (p && !map.getBounds().contains([p.lon, p.lat])) map.easeTo({ center: [p.lon, p.lat], duration: 400 })
  }, [loaded, active, places])

  return (
    <div className="relative h-full w-full overflow-hidden rounded-[28px] border border-gray-200 bg-gray-100">
      <div ref={box} className="h-full w-full" role="region" aria-label={t('r3_mapAria').replace('{station}', station.name)} />
      <p className="pointer-events-none absolute bottom-3 start-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#222D52] shadow">
        {t('r3_mapRing')}
      </p>
    </div>
  )
}

export default StationAroundMap
