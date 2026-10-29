import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../hooks/useLanguage'
import { mapConfig, softMapStyle } from '../services/mapStyle'
import type { RailStation } from '../hooks/useRailStations'
import { KIND_COLOR, PLACE_KINDS, placeName, walkMinutes, type NearPlace } from '../services/places'
import { PLACE_GLYPH } from '../data/placeIcons'
import { LINES, lineBadgeSvg } from '../data/lines'

maplibregl.setWorkerUrl(workerUrl)
try {
  maplibregl.addProtocol('pmtiles', new Protocol().tile)
} catch {
  // already added by another map on the page
}

// The RONDA 300 map (the left of the RONDA 300 page): the rail stations (small dots in their lines' official
// colours from afar, each line's badge with the station's name closer in), a dashed 300 m ring (about 5 minutes on
// foot) around the station in focus, a label over each other station in view with how many places are around it,
// the places as small dots in their kind's colour (the one picked or pointed at grows into a marker with its kind's
// drawing), and the hand-picked places that have a photo as round photo pins. It reports the area in view after every move (the panel beside it follows).
// Pointing at a place in the list puts a callout over it (name and walk, as Rome2rio labels its stops); pressing a
// place's dot picks it in the list; pressing a station flies in to it. Soft basemap without the map's own shop icons.

export type AreaPlace = NearPlace & { station: string } // distance_m is from that station
export type MapView = { bounds: maplibregl.LngLatBounds; zoom: number }
export type FlyTarget = { lat: number; lon: number; zoom: number; n: number } // n: a new number for every fly
export type StationBubble = { station: RailStation; count: number } // places within 300 m
export type PhotoPin = { id: string; lat: number; lon: number; src: string; name: string }
// the short description shown on the map when a pick is pressed
export type PinCard = { id: string; lat: number; lon: number; name: string; text: string; walk: string; href: string }

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
// the place picked or pointed at: a white disc ringed in the kind's colour, its drawing inside in the same colour
const kindMarker = (color: string, glyph: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="#FFFFFF" stroke="${color}" stroke-width="3"/>` +
  `<g transform="translate(18 18) scale(1.1667)" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${glyph}</g></svg>`
async function addImages(map: maplibregl.Map) {
  const add = async (id: string, svg: string) => { if (!map.hasImage(id)) map.addImage(id, await svgImage(svg), { pixelRatio: 2 }) }
  await Promise.all([
    ...PLACE_KINDS.map((k) => add(`kind-${k}`, kindMarker(KIND_COLOR[k], PLACE_GLYPH[k]))),
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
  bubbles,
  pins,
  activePin,
  places,
  active,
  fly,
  onPickPlace,
  onPickPin,
  onView,
  pinCard = null,
  onGo,
  onClosePin,
}: {
  stations: RailStation[]
  rings: RailStation[] // the station in focus (its 300 m)
  bubbles: StationBubble[]
  pins: PhotoPin[]
  activePin: string | null
  places: AreaPlace[]
  active: string | null
  fly: FlyTarget
  onPickPlace: (osmId: string) => void
  onPickPin: (id: string) => void
  onView: (v: MapView) => void
  pinCard?: PinCard | null
  onGo?: (href: string) => void // to the trip planner, without reloading the page
  onClosePin?: () => void
}) {
  const { t, lang } = useLanguage()
  const box = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const calloutRef = useRef<maplibregl.Popup | null>(null)
  const pinCardRef = useRef<maplibregl.Popup | null>(null)
  const goRef = useRef(onGo)
  const closePinRef = useRef(onClosePin)
  useEffect(() => { goRef.current = onGo; closePinRef.current = onClosePin })
  const [loaded, setLoaded] = useState(false)
  const placeRef = useRef(onPickPlace)
  const pinRef = useRef(onPickPin)
  const viewRef = useRef(onView)
  const flyRef = useRef(fly)
  const tRef = useRef(t)
  useEffect(() => { placeRef.current = onPickPlace; pinRef.current = onPickPin; viewRef.current = onView; flyRef.current = fly; tRef.current = t })

  // the map, once (rebuilt when the language changes, for the labels)
  useEffect(() => {
    if (!box.current) return
    const { pmtilesUrl, assetsUrl } = mapConfig()
    const style = softMapStyle(lang, pmtilesUrl, assetsUrl)
    style.layers = style.layers.filter((l) => !l.id.startsWith('pois'))
    const f = flyRef.current, tr = tRef.current
    const map = new maplibregl.Map({
      container: box.current,
      style,
      center: [f.lon, f.lat],
      zoom: f.zoom,
      attributionControl: { compact: true },
      // the page scrolls over the map; Ctrl / ⌘ + scroll or two fingers move it (the hint in the reader's language)
      cooperativeGestures: true,
      locale: { 'CooperativeGesturesHandler.WindowsHelpText': tr('r3_mapCtrl'), 'CooperativeGesturesHandler.MacHelpText': tr('r3_mapCmd'), 'CooperativeGesturesHandler.MobileHelpText': tr('r3_mapTwo') },
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
        paint: { 'circle-radius': 20, 'circle-color': ['get', 'color'], 'circle-opacity': 0.18, 'circle-blur': 0.2 },
      })
      // places: small dots in the kind's colour with a white edge, a little bigger the closer in
      map.addLayer({
        id: 'places', type: 'circle', source: 'places',
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 14, 3, 17, 6],
          'circle-color': ['get', 'color'],
          'circle-stroke-color': '#FFFFFF',
          'circle-stroke-width': ['interpolate', ['linear'], ['zoom'], 14, 1, 17, 1.6],
        },
        layout: { 'circle-sort-key': ['get', 'rank'] },
      })
      map.addLayer({
        id: 'places-on', type: 'symbol', source: 'places', filter: ['==', ['get', 'id'], ''],
        layout: { 'icon-image': ['concat', 'kind-', ['get', 'kind']], 'icon-size': 0.75, 'icon-allow-overlap': true },
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

  // a label over each other station in view: its name and how many places are around it (pressing it flies there)
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    const markers = bubbles.map(({ station, count }) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'r3-bubble'
      const name = document.createElement('span')
      name.textContent = station.name
      const n = document.createElement('span')
      n.className = 'r3-bubble-n'
      n.textContent = String(count)
      el.append(name, n)
      el.addEventListener('click', (e) => {
        e.stopPropagation()
        map.flyTo({ center: [station.lon, station.lat], zoom: Math.max(map.getZoom(), 16), duration: 800 })
      })
      return new maplibregl.Marker({ element: el, anchor: 'bottom', offset: [0, -14] }).setLngLat([station.lon, station.lat]).addTo(map)
    })
    return () => markers.forEach((m) => m.remove())
  }, [loaded, bubbles])

  // the hand-picked places with a photo: round photo pins (pressing one picks it in the panel)
  const pinEls = useRef(new Map<string, HTMLElement>())
  useEffect(() => {
    const map = mapRef.current
    if (!loaded || !map) return
    const els = pinEls.current
    const markers = pins.map((p) => {
      const el = document.createElement('button')
      el.type = 'button'
      el.className = 'r3-photo'
      el.setAttribute('aria-label', p.name)
      const img = document.createElement('img')
      img.src = p.src
      img.alt = ''
      // a gold star badge marks it as a RONDA pick
      const star = document.createElement('span')
      star.className = 'r3-star'
      star.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>'
      el.append(img, star)
      el.addEventListener('click', (e) => { e.stopPropagation(); pinRef.current(p.id) })
      els.set(p.id, el)
      return new maplibregl.Marker({ element: el }).setLngLat([p.lon, p.lat]).addTo(map)
    })
    return () => { markers.forEach((m) => m.remove()); els.clear() }
  }, [loaded, pins])
  useEffect(() => {
    for (const [id, el] of pinEls.current) el.classList.toggle('on', id === activePin)
  }, [activePin, pins])

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
    // the walk from the station, after its lines' badges (an interchange has one per line)
    const walk = document.createElement('span')
    walk.className = 'mt-0.5 flex items-start gap-1.5 text-xs text-gray-600'
    const badges = document.createElement('span')
    badges.className = 'flex flex-shrink-0 gap-0.5 pt-px'
    const seen = new Set<string>()
    for (const s of stations) {
      if (s.name !== p.station || seen.has(s.line.id)) continue
      seen.add(s.line.id)
      const b = document.createElement('span')
      b.className = 'block h-4 w-4 [&>svg]:h-full [&>svg]:w-full'
      b.innerHTML = lineBadgeSvg(s.line, { title: true }) // our own static line data, not user input
      badges.append(b)
    }
    const text = document.createElement('span')
    text.textContent = t('r3_walkFrom').replace('{station}', p.station).replace('{min}', String(walkMinutes(p.distance_m)))
    walk.append(badges, text)
    content.append(name, walk)
    calloutRef.current = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 22, className: 'r3-callout', maxWidth: '240px' })
      .setLngLat([p.lon, p.lat]).setDOMContent(content).addTo(map)
  }, [loaded, active, places, stations, lang, t])

  // a pressed pick: its name, what it is, the walk, and Go (closing it, by its button or the map, tells the page)
  useEffect(() => {
    const map = mapRef.current
    const old = pinCardRef.current
    pinCardRef.current = null // first, so removing it here is not taken as the reader closing it
    old?.remove()
    if (!loaded || !map || !pinCard) return
    const content = document.createElement('div')
    const name = document.createElement('strong')
    name.className = 'block pe-5 font-display text-[16px] font-normal leading-snug text-[#222D52]'
    name.textContent = pinCard.name
    const text = document.createElement('p')
    text.className = 'mt-1 text-[12.5px] leading-relaxed text-[#434C5C]'
    text.textContent = pinCard.text
    const row = document.createElement('div')
    row.className = 'mt-2 flex items-center justify-between gap-3'
    const walk = document.createElement('span')
    walk.className = 'text-[11.5px] text-[#5B6576]'
    walk.textContent = pinCard.walk
    const go = document.createElement('a')
    go.href = pinCard.href
    go.className = 'inline-flex h-8 flex-shrink-0 items-center rounded-full bg-[#222D52] px-3.5 text-[12.5px] font-semibold text-white hover:bg-[#2f3d6e]'
    go.textContent = t('r3_go')
    go.setAttribute('aria-label', `${t('r3_go')}, ${t('r3_goTo').replace('{name}', pinCard.name)}`)
    go.addEventListener('click', (e) => { if (goRef.current) { e.preventDefault(); goRef.current(pinCard.href) } })
    row.append(walk, go)
    content.append(name, text, row)
    const popup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 34, className: 'r3-callout r3-pincard', maxWidth: '260px' })
      .setLngLat([pinCard.lon, pinCard.lat]).setDOMContent(content).addTo(map)
    popup.on('close', () => { if (pinCardRef.current === popup) { pinCardRef.current = null; closePinRef.current?.() } })
    pinCardRef.current = popup
  }, [loaded, pinCard, t])

  return (
    <div className="r3-map relative h-full w-full overflow-hidden bg-gray-100">
      <div ref={box} className="h-full w-full" role="region" aria-label={t('r3_previewAria')} />
      <p className="pointer-events-none absolute top-3 start-3 max-w-[calc(100%-4.5rem)] rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-[#222D52] shadow">
        {t('r3_mapRing')}
      </p>
    </div>
  )
}

export default Ronda300Map
