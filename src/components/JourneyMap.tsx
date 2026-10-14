import { useEffect, useRef } from 'react'
import * as maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../hooks/useLanguage'
import { mapConfig, softMapStyle } from '../services/mapStyle'

maplibregl.setWorkerUrl(workerUrl)
try {
  maplibregl.addProtocol('pmtiles', new Protocol().tile)
} catch {
  // already added by another map on the page
}

// One trip on our own map (checklist G13-06): each ride drawn in its line colour through the stops it calls at
// (from the trip planner's answer, nothing from outside), walks as grey dots, a ring at the start and a pin at the
// end. Loaded only when a trip's details are opened, so Home doesn't download the map engine.
export type JourneySegment = { mode: 'walk' | 'transit'; color: string; coords: [number, number][] }   // [lon, lat]

const NAVY = '#1F2F5C'

function JourneyMap({ segments, label }: { segments: JourneySegment[]; label: string }) {
  const { lang } = useLanguage()
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const all = segments.flatMap((s) => s.coords)
    if (!box.current || all.length < 2) return
    const { pmtilesUrl, assetsUrl } = mapConfig()
    const style = softMapStyle(lang, pmtilesUrl, assetsUrl)
    style.layers = style.layers.filter((l) => !l.id.startsWith('pois'))
    const lons = all.map((c) => c[0]), lats = all.map((c) => c[1])
    const map = new maplibregl.Map({
      container: box.current,
      style,
      bounds: [[Math.min(...lons), Math.min(...lats)], [Math.max(...lons), Math.max(...lats)]],
      fitBoundsOptions: { padding: 36, maxZoom: 16 },
      attributionControl: { compact: true },
      cooperativeGestures: true,
    })
    map.on('load', () => {
      const feature = (s: JourneySegment) => ({ type: 'Feature' as const, properties: { color: s.color }, geometry: { type: 'LineString' as const, coordinates: s.coords } })
      map.addSource('walks', { type: 'geojson', data: { type: 'FeatureCollection', features: segments.filter((s) => s.mode === 'walk' && s.coords.length > 1).map(feature) } })
      map.addSource('rides', { type: 'geojson', data: { type: 'FeatureCollection', features: segments.filter((s) => s.mode === 'transit' && s.coords.length > 1).map(feature) } })
      map.addLayer({ id: 'walks', type: 'line', source: 'walks', layout: { 'line-cap': 'round' }, paint: { 'line-color': '#6B7280', 'line-width': 3.5, 'line-dasharray': [0, 2] } })
      map.addLayer({ id: 'rides-casing', type: 'line', source: 'rides', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#ffffff', 'line-width': 8 } })
      map.addLayer({ id: 'rides', type: 'line', source: 'rides', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': ['get', 'color'], 'line-width': 5 } })
      // the stations where rides start and end
      const ends = segments.filter((s) => s.mode === 'transit' && s.coords.length).flatMap((s) => [s.coords[0], s.coords[s.coords.length - 1]])
      map.addSource('changes', { type: 'geojson', data: { type: 'FeatureCollection', features: ends.map((c) => ({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: c } })) } })
      map.addLayer({ id: 'changes', type: 'circle', source: 'changes', paint: { 'circle-radius': 5, 'circle-color': '#ffffff', 'circle-stroke-color': NAVY, 'circle-stroke-width': 2.5 } })
    })
    const start = document.createElement('div')
    start.style.cssText = `width:16px;height:16px;border-radius:50%;background:#fff;border:4px solid ${NAVY};box-sizing:border-box`
    new maplibregl.Marker({ element: start }).setLngLat(all[0]).addTo(map)
    new maplibregl.Marker({ color: NAVY }).setLngLat(all[all.length - 1]).addTo(map)
    return () => map.remove()
  }, [segments, lang])

  return <div ref={box} role="img" aria-label={label} className="h-56 md:h-64 w-full overflow-hidden rounded-2xl border border-gray-200 bg-[#EEF1F5]" />
}

export default JourneyMap
