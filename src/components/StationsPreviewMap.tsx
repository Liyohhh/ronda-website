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

maplibregl.setWorkerUrl(workerUrl)
try {
  maplibregl.addProtocol('pmtiles', new Protocol().tile)
} catch {
  // already added by another map on the page
}

// RONDA 300 before a station is picked: every LRT, MRT, Monorail, BRT and ERL station of the Klang Valley as a dot
// in its line's official colour (positions from public.stops). Pressing a dot picks that station, like the search.

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

function StationsPreviewMap({ onPick }: { onPick: (p: Pick) => void }) {
  const { t, lang } = useLanguage()
  const box = useRef<HTMLDivElement>(null)
  const [rows, setRows] = useState<Row[] | null>(null)
  const pickRef = useRef(onPick)
  useEffect(() => { pickRef.current = onPick }, [onPick])

  useEffect(() => {
    let live = true
    supabase
      .from('stops')
      .select('feed_id, stop_id, stop_name, stop_lat, stop_lon')
      .in('feed_id', ['rapid-rail-kl', 'erl'])
      .then(({ data }) => { if (live) setRows((data ?? []) as Row[]) })
    return () => { live = false }
  }, [])

  useEffect(() => {
    if (!box.current || !rows) return
    const { pmtilesUrl, assetsUrl } = mapConfig()
    const style = softMapStyle(lang, pmtilesUrl, assetsUrl)
    style.layers = style.layers.filter((l) => !l.id.startsWith('pois'))
    // the Klang Valley core; the far ends (KLIA, Putrajaya) are a drag away
    const map = new maplibregl.Map({ container: box.current, style, center: [101.69, 3.12], zoom: 10.6, attributionControl: { compact: true }, cooperativeGestures: true })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    const features = rows.flatMap((r) => {
      const line = lineOf(r)
      if (!line || !Number.isFinite(r.stop_lat)) return []
      const name = `${MODE_NAME[line.mode] ?? line.mode} ${r.stop_name ?? r.stop_id}`
      return [{ type: 'Feature' as const, properties: { name, raw: r.stop_name ?? r.stop_id, stopId: r.stop_id, color: line.color }, geometry: { type: 'Point' as const, coordinates: [r.stop_lon, r.stop_lat] } }]
    })
    map.on('load', () => {
      map.addSource('stations', { type: 'geojson', data: { type: 'FeatureCollection', features } })
      map.addLayer({
        id: 'stations', type: 'circle', source: 'stations',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 4, 14, 8],
          'circle-color': ['get', 'color'], 'circle-stroke-color': '#FFFFFF', 'circle-stroke-width': 1.5,
        },
      })
      if (style.glyphs) map.addLayer({
        id: 'stations-label', type: 'symbol', source: 'stations', minzoom: 13,
        layout: { 'text-field': ['get', 'name'], 'text-size': 11, 'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-font': ['Noto Sans Medium'] },
        paint: { 'text-color': '#222D52', 'text-halo-color': '#FFFFFF', 'text-halo-width': 1.5 },
      })
      map.on('click', 'stations', (e) => {
        const f = e.features?.[0]
        if (!f) return
        const [lon, lat] = (f.geometry as GeoJSON.Point).coordinates
        const { stopId, raw, name } = f.properties as { stopId: string; raw: string; name: string }
        // the same display name the search shows (the table's own name can be in capitals)
        supabase.rpc('search_stops', { query: raw }).then(({ data }) => {
          const hit = ((data ?? []) as { stop_id: string; stop_name: string }[]).find((d) => d.stop_id === stopId)
          pickRef.current({ name: hit?.stop_name ?? name, lat, lon })
        }, () => pickRef.current({ name, lat, lon }))
      })
      const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 10 })
      map.on('mouseenter', 'stations', (e) => {
        map.getCanvas().style.cursor = 'pointer'
        const f = e.features?.[0]
        if (f) popup.setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number]).setText(String(f.properties?.name)).addTo(map)
      })
      map.on('mouseleave', 'stations', () => { map.getCanvas().style.cursor = ''; popup.remove() })
    })
    return () => map.remove()
  }, [rows, lang])

  return (
    <div className="relative h-[380px] sm:h-[480px] lg:h-[560px] overflow-hidden rounded-[28px] border border-gray-200 bg-gray-100">
      <div ref={box} className="h-full w-full" role="region" aria-label={t('r3_previewAria')} />
      <p className="pointer-events-none absolute bottom-3 start-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#222D52] shadow">
        {t('r3_previewHint')}
      </p>
    </div>
  )
}

export default StationsPreviewMap
