import { supabase } from './supabase'

// A trail's walking route for its map (public.trail_route): the start and end stations, each stop's position and
// the walking path between them (OpenStreetMap footpaths). Trails without a route yet return no legs.

export type RouteStation = { name: string; lineIds: string[]; lat: number; lon: number }
export type RouteLeg = { seq: number; meters: number; minutes: number; path: [number, number][] }
export type TrailRoute = {
  start: RouteStation | null
  end: RouteStation | null
  stops: { placeId: string; lat: number | null; lon: number | null }[]
  legs: RouteLeg[]
}

const cache = new Map<string, Promise<TrailRoute>>()

export function loadTrailRoute(slug: string): Promise<TrailRoute> {
  let p = cache.get(slug)
  if (!p) {
    p = (async () => {
      const { data, error } = await supabase.rpc('trail_route', { p_slug: slug })
      if (error || !data) throw new Error(error?.message ?? 'no route')
      return data as TrailRoute
    })()
    cache.set(slug, p)
    // a failed load is not cached, so the next visit tries again
    p.catch(() => cache.delete(slug))
  }
  return p
}

// a trail has a map when every stop has a position and the legs join them all up
export const hasMap = (r: TrailRoute) =>
  !!r.start && !!r.end && r.stops.length > 0 && r.stops.every((s) => s.lat != null && s.lon != null) && r.legs.length === r.stops.length + 1

// point halfway along a path, by distance (where the "6 min · 460 m" badge goes)
export function midpoint(path: [number, number][]): [number, number] {
  if (path.length < 2) return path[0]
  const d = (p: [number, number], q: [number, number]) => Math.hypot((q[0] - p[0]) * Math.cos((p[1] * Math.PI) / 180), q[1] - p[1])
  const seg = path.slice(1).map((p, i) => d(path[i], p))
  const half = seg.reduce((a, b) => a + b, 0) / 2
  let acc = 0
  for (let i = 0; i < seg.length; i++) {
    if (acc + seg[i] >= half) {
      const t = seg[i] ? (half - acc) / seg[i] : 0
      return [path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t]
    }
    acc += seg[i]
  }
  return path[0]
}
