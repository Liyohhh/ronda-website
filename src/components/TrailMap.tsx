import { useEffect, useRef, useState } from 'react'
import * as maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLanguage } from '../hooks/useLanguage'
import { mapConfig, softMapStyle } from '../services/mapStyle'
import { loadTrailRoute, hasMap, midpoint, type TrailRoute } from '../services/trailRoute'
import { LINES_BY_ID } from '../data/lines'
import { placeBlurbKey, trailNameKey, type Place, type Trail } from '../data/trails'

maplibregl.setWorkerUrl(workerUrl)
try {
  maplibregl.addProtocol('pmtiles', new Protocol().tile)
} catch {
  // already added by another map on the page
}

// Trail map, like the printed RONDA trail maps: soft basemap, dotted walking route, numbered stops with name cards,
// "6 min · 460 m" on each walk, START / END stations with their line colours, and a summary card.
// Name cards and the station pills show from tablet width up; on a phone the numbers match the stop list below,
// and the summary card sits under the map.

const NAVY = '#1F2F5C'

type Rect = { x: number; y: number; w: number; h: number }
type Side = 'right' | 'left' | 'top' | 'bottom' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left' | 'center'

function el(tag: string, cls: string, text?: string) {
  const e = document.createElement(tag)
  e.className = cls
  if (text != null) e.textContent = text
  return e
}

const hit = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
const area = (a: Rect, b: Rect) => (hit(a, b) ? (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * (Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y)) : 0)

function TrailMap({ trail, places }: { trail: Trail; places: Record<string, Place> }) {
  const { t, lang } = useLanguage()
  const box = useRef<HTMLDivElement>(null)
  const summary = useRef<HTMLDivElement>(null)
  const [route, setRoute] = useState<TrailRoute | null>(null)

  useEffect(() => {
    let live = true
    loadTrailRoute(trail.slug).then((r) => live && setRoute(r)).catch(() => {})
    return () => { live = false }
  }, [trail.slug])

  const ready = !!route && hasMap(route)

  useEffect(() => {
    if (!ready || !box.current || !route) return
    const container = box.current
    const wide = container.clientWidth >= 640
    const { pmtilesUrl, assetsUrl } = mapConfig()
    const style = softMapStyle(lang, pmtilesUrl, assetsUrl)
    // no shop / post-office icons: only the trail's own stops on this map
    style.layers = style.layers.filter((l) => !l.id.startsWith('pois'))
    const map = new maplibregl.Map({
      container,
      style,
      attributionControl: { compact: true },
      cooperativeGestures: true, // the page scrolls past the map; two fingers / ctrl + scroll to zoom
    })
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    const stops = route.stops.map((s) => [s.lon!, s.lat!] as [number, number])
    const start: [number, number] = [route.start!.lon, route.start!.lat]
    const end: [number, number] = [route.end!.lon, route.end!.lat]
    const all = [start, ...stops, end, ...route.legs.flatMap((l) => l.path)]
    const bounds = all.reduce((b, p) => b.extend(p), new maplibregl.LngLatBounds(all[0], all[0]))
    // room for the name cards around the trail and for the summary card in the bottom corner
    map.fitBounds(bounds, { padding: wide ? { top: 80, bottom: 200, left: 240, right: 240 } : { top: 50, bottom: 60, left: 36, right: 36 }, duration: 0, maxZoom: 17 })

    const markers: maplibregl.Marker[] = []
    const add = (node: HTMLElement, at: [number, number], anchor: maplibregl.PositionAnchor = 'center') => {
      const m = new maplibregl.Marker({ element: node, anchor }).setLngLat(at).addTo(map)
      markers.push(m)
      return m
    }

    // labels: each tries the sides of its point in order and takes the first spot inside the map that is free
    const taken: Rect[] = []
    const place = (node: HTMLElement, at: [number, number], gap: number, sides: Side[]) => {
      const m = add(node, at, 'top-left')
      const w = node.offsetWidth, h = node.offsetHeight
      if (!w) return // hidden at this width
      const p = map.project(at)
      const W = container.clientWidth, H = container.clientHeight
      const d = gap * 0.7
      const spot: Record<Side, Rect> = {
        right: { x: p.x + gap, y: p.y - h / 2, w, h },
        left: { x: p.x - gap - w, y: p.y - h / 2, w, h },
        top: { x: p.x - w / 2, y: p.y - gap - h, w, h },
        bottom: { x: p.x - w / 2, y: p.y + gap, w, h },
        'top-right': { x: p.x + d, y: p.y - d - h, w, h },
        'bottom-right': { x: p.x + d, y: p.y + d, w, h },
        'top-left': { x: p.x - d - w, y: p.y - d - h, w, h },
        'bottom-left': { x: p.x - d - w, y: p.y + d, w, h },
        center: { x: p.x - w / 2, y: p.y - h / 2, w, h },
      }
      const inside = (r: Rect) => r.x >= 4 && r.y >= 4 && r.x + r.w <= W - 4 && r.y + r.h <= H - 4
      const cost = (r: Rect) => taken.reduce((s, b) => s + area(r, b), 0) + (inside(r) ? 0 : 1e7)
      const cands = sides.map((k) => spot[k])
      const best = cands.find((r) => cost(r) === 0) ?? cands.reduce((a, b) => (cost(b) < cost(a) ? b : a))
      m.setOffset([best.x - p.x, best.y - p.y])
      taken.push(best)
    }

    map.on('load', () => {
      map.addSource('walk', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: route.legs.map((l) => ({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: l.path } })) },
      })
      map.addLayer({ id: 'walk-casing', type: 'line', source: 'walk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': '#FFFFFF', 'line-width': 7, 'line-opacity': 0.9 } })
      map.addLayer({ id: 'walk', type: 'line', source: 'walk', layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': NAVY, 'line-width': 3.5, 'line-dasharray': [0.4, 1.6] } })

      // what labels must not cover: the summary card, the zoom buttons, every stop number and station ring
      if (wide) {
        const card = summary.current
        if (card) taken.push({ x: 0, y: container.clientHeight - card.offsetHeight - 24, w: card.offsetWidth + 24, h: card.offsetHeight + 24 })
        taken.push({ x: container.clientWidth - 56, y: 0, w: 56, h: 86 })
      }
      for (const at of [start, end, ...stops]) {
        const p = map.project(at)
        taken.push({ x: p.x - 18, y: p.y - 18, w: 36, h: 36 })
      }
      // the walking route (sampled every few pixels) so cards do not hide it
      for (const l of route.legs) {
        let last: maplibregl.Point | null = null
        for (const c of l.path) {
          const p = map.project(c)
          if (last && Math.hypot(p.x - last.x, p.y - last.y) < 10) continue
          taken.push({ x: p.x - 4, y: p.y - 4, w: 8, h: 8 })
          last = p
        }
      }

      // START / END stations: ring marker plus a pill with the station and its line colours
      const station = (s: NonNullable<TrailRoute['start']>, label: string, at: [number, number], dark: boolean) => {
        add(el('div', 'h-4 w-4 rounded-full border-[3px] border-[#1F2F5C] bg-white shadow'), at)
        const pill = el('div', 'hidden sm:flex items-center gap-2 whitespace-nowrap rounded-full border-2 border-[#1F2F5C] bg-white py-1 ps-1 pe-3 shadow-md')
        pill.append(el('span', `rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white ${dark ? 'bg-[#1F2F5C]' : 'bg-[#2563EB]'}`, label))
        pill.append(el('span', 'text-[13px] font-semibold text-[#1F2F5C]', s.name))
        const dots = el('span', 'flex gap-0.5')
        for (const id of s.lineIds ?? []) {
          const dot = el('span', 'h-2.5 w-2.5 rounded-full')
          dot.style.backgroundColor = LINES_BY_ID[id]?.color ?? '#94A3B8'
          dots.append(dot)
        }
        pill.append(dots)
        place(pill, at, 16, ['right', 'left', 'top', 'bottom', 'top-right', 'bottom-right', 'top-left', 'bottom-left'])
      }
      station(route.start!, t('trailMapStart'), start, true)
      station(route.end!, t('trailMapEnd'), end, false)

      // name card for each stop (the numbers are drawn last, on top)
      route.stops.forEach((s, i) => {
        const pl = places[s.placeId]
        if (!pl) return
        const card = el('div', 'hidden sm:block w-max max-w-[200px] rounded-lg bg-white/95 px-3 py-1.5 shadow-md')
        card.append(el('div', 'text-[13px] font-bold leading-tight text-[#1F2F5C]', pl.name))
        card.append(el('div', 'mt-0.5 text-[11px] leading-snug text-gray-600 line-clamp-2', t(placeBlurbKey(pl.id))))
        place(card, stops[i], 24, ['right', 'left', 'bottom', 'top', 'bottom-right', 'top-right', 'bottom-left', 'top-left'])
      })

      // walk badges, halfway along each leg, nudged off anything already there
      for (const l of route.legs) {
        const badge = el('div', 'whitespace-nowrap rounded-full bg-[#2563EB] px-2 py-0.5 text-[11px] font-semibold text-white shadow', `${l.minutes} min · ${l.meters} m`)
        place(badge, midpoint(l.path), 16, ['center', 'right', 'left', 'top', 'bottom', 'top-right', 'bottom-right', 'top-left', 'bottom-left'])
      }
      route.stops.forEach((_, i) => {
        add(el('div', 'flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-[#1F2F5C] text-sm font-bold text-white shadow-md ring-2 ring-[#2563EB]', String(i + 1)), stops[i])
      })
    })

    return () => {
      markers.forEach((m) => m.remove())
      map.remove()
    }
  }, [ready, route, lang, places, t])

  if (!ready || !route) return null
  const km = route.legs.reduce((a, l) => a + l.meters, 0) / 1000
  const min = route.legs.reduce((a, l) => a + l.minutes, 0)

  return (
    <section aria-label={t('trailMapTitle')} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm">
      <div ref={box} className="h-[420px] md:h-[640px] w-full" />

      {/* summary card, like the printed maps (under the map on a phone) */}
      <div
        ref={summary}
        className="pointer-events-none bg-[#1F2F5C] p-4 text-white sm:absolute sm:bottom-3 sm:start-3 sm:max-w-sm sm:rounded-xl sm:bg-[#1F2F5C]/95 sm:shadow-lg"
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent-light">{t('trailMapKicker')}</p>
        <p className="mt-1 text-xl sm:text-2xl font-bold leading-tight">{t(trailNameKey(trail))}</p>
        <div className="mt-2 h-1 w-16 rounded-full bg-[#2563EB]" />
        <dl className="mt-3 grid grid-cols-3 gap-3">
          <div><dt className="sr-only">{t('trailMapStops')}</dt><dd className="text-lg font-bold">{route.stops.length}</dd><dd className="text-xs text-white/75">{t('trailMapStops')}</dd></div>
          <div><dt className="sr-only">{t('trailMapWalk')}</dt><dd className="text-lg font-bold">{km.toFixed(1)} km</dd><dd className="text-xs text-white/75">{t('trailMapWalk')}</dd></div>
          <div><dt className="sr-only">{t('trailMapWalking')}</dt><dd className="text-lg font-bold">~{min} min</dd><dd className="text-xs text-white/75">{t('trailMapWalking')}</dd></div>
        </dl>
        <p className="mt-3 border-t border-white/15 pt-2 text-xs text-white/80">
          {t('trailMapStartsEnds').replace('{start}', route.start!.name).replace('{end}', route.end!.name)}
        </p>
      </div>

      {/* legend */}
      <div className="pointer-events-none absolute bottom-8 end-3 hidden md:block rounded-xl bg-white/95 px-3 py-2 text-xs text-gray-700 shadow">
        <p className="flex items-center gap-2"><span className="w-8 border-t-[3px] border-dotted border-[#1F2F5C]" />{t('trailMapLegendRoute')}</p>
        <p className="mt-1.5 flex items-center gap-2"><span className="rounded-full bg-[#2563EB] px-1.5 py-0.5 text-[10px] font-semibold text-white">6 min · 460 m</span>{t('trailMapLegendLeg')}</p>
      </div>
    </section>
  )
}

export default TrailMap
