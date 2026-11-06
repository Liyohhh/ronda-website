import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabase'
import { matchFeatured } from '../data/featuredPlaces'
import { track } from '../services/analytics'

// Autocomplete data for the Start / End boxes: transit stops (search_stops RPC), our own OpenStreetMap places
// (search_pois RPC: hotels, sights, malls) and any other place
// (geocode Edge Function, OpenStreetMap), with the featured places (data/featuredPlaces.ts) first. Debounced, cached per query for the session, and the
// previous results stay on screen while new ones load so the list doesn't flicker.
// The database writes out short forms and fixes typos ("mrrt mluri" -> "mrt maluri"); search_fix returns that
// fixed search for "Showing results for ...". near (the map or the user's position) puts nearer places first.

export type StopResult = {
  stop_id: string
  stop_name: string
  category: string
  feed_id: string
  stop_lat: number
  stop_lon: number
  route_ids: string[] | null
  stop_code?: string | null // bus stop code ("KL1483"); null for rail and stops the operator gives no code
  // set when the stop comes from a bus route code search ("T305"): its place on the route's main run
  route_code?: string
  stop_sequence?: number
  stop_count?: number
  towards?: string | null // null = loop
}

// Looks like a bus route code: letters + digits, short ("T305", "kj 1", "300", "SA02")
export const looksLikeRouteCode = (q: string) => /^[a-z]{0,5}[\s-]?\d{1,4}[a-z]?$/i.test(q.trim())

// matched: the other name the place was found by, when not its own name (search_pois: "Kuala Lumpur Tower", "kl tower")
export type PlaceResult = { name: string; detail: string; lat: number; lon: number; kind: string; osm: string; matched?: string | null }

const STOP_DELAY = 120 // ms, database search is fast
const PLACE_DELAY = 300 // ms, the geocoder is a shared outside service
const CACHE_MAX = 200

const stopCache = new Map<string, StopResult[]>()
const placeCache = new Map<string, PlaceResult[]>()
const routeCache = new Map<string, StopResult[]>()
const fixCache = new Map<string, string | null>()
const NO_PLACES: PlaceResult[] = []

function remember<T>(cache: Map<string, T>, key: string, value: T) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!)
  cache.set(key, value)
}

export const normaliseQuery = (q: string) => q.trim().toLowerCase().replace(/\s+/g, ' ')

export type Near = { lat: number; lon: number } | null

export function useSmartSearch(query: string, near: Near = null) {
  const key = normaliseQuery(query)
  // places are cached per query and area (about 10 km), so a search near Penang isn't served KL's places
  const nearKey = near ? `${near.lat.toFixed(1)},${near.lon.toFixed(1)}` : ''
  const placeKey = nearKey ? `${key}@${nearKey}` : key
  const [stopRes, setStopRes] = useState<StopResult[]>([])
  const [placeRes, setPlaceRes] = useState<PlaceResult[]>([])
  const [fixRes, setFixRes] = useState<string | null>(null)
  const [routeRes, setRouteRes] = useState<StopResult[]>([])
  const isCode = looksLikeRouteCode(key)

  // a bus route code: that route's stops, in running order
  useEffect(() => {
    if (!isCode || routeCache.has(key)) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_route_stops', { query: key })
      if (error) {
        console.error('Route search error:', error)
        return
      }
      remember(routeCache, key, (data ?? []) as StopResult[])
      if (!cancelled) setRouteRes((data ?? []) as StopResult[])
    }, STOP_DELAY)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [key, isCode])

  useEffect(() => {
    if (key.length < 2 || stopCache.has(key)) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_stops', { query: key })
      if (error) {
        console.error('Stop search error:', error)
        return
      }
      remember(stopCache, key, (data ?? []) as StopResult[])
      if (!cancelled) setStopRes((data ?? []) as StopResult[])
    }, STOP_DELAY)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [key])

  // the search as the database understood it, when that differs from what was typed
  useEffect(() => {
    if (key.length < 3 || fixCache.has(key)) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.rpc('search_fix', { query: key })
      if (error) {
        console.error('Search fix error:', error)
        return
      }
      const fixed = typeof data === 'string' && data ? data : null
      remember(fixCache, key, fixed)
      if (!cancelled) setFixRes(fixed)
    }, STOP_DELAY)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [key])

  useEffect(() => {
    if (key.length < 2 || placeCache.has(placeKey)) return
    let cancelled = false
    const [lat, lon] = nearKey ? nearKey.split(',').map(Number) : [null, null]
    const timer = setTimeout(async () => {
      // our own OpenStreetMap places first (hotels, sights, malls: search_pois), then the geocoder's. The geocoder
      // from 3 letters (a shared outside service); 2 letters are often short forms the database writes out ("um")
      const [own, geo] = await Promise.all([
        supabase.rpc('search_pois', { query: key, max_rows: 6, p_lat: lat, p_lon: lon }),
        key.length >= 3
          ? supabase.functions.invoke('geocode', { body: lat === null ? { q: key } : { q: key, lat, lon } })
          : Promise.resolve({ data: { results: [] as PlaceResult[] }, error: null }),
      ])
      if (own.error) console.error('Own place search error:', own.error)
      if (geo.error || geo.data?.error) console.error('Place search error:', geo.error || geo.data?.error)
      if (own.error && (geo.error || geo.data?.error)) {
        if (!cancelled) setPlaceRes([])
        return
      }
      const seen = new Set<string>()
      const merged = [...((own.data ?? []) as PlaceResult[]), ...((geo.data?.results ?? []) as PlaceResult[])].filter((p) => {
        const k = p.osm || p.name.toLowerCase()
        if (seen.has(k) || seen.has(p.name.toLowerCase())) return false
        seen.add(k); seen.add(p.name.toLowerCase())
        return true
      })
      remember(placeCache, placeKey, merged)
      // what people look for, and whether we had anything (results 0 = found nothing) for the admin dashboard
      void track('search', { query: key, results: merged.length + (stopCache.get(key)?.length ?? 0) })
      if (!cancelled) setPlaceRes(merged)
    }, PLACE_DELAY)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [key, placeKey, nearKey])

  const found = key.length < 2 ? NO_PLACES : (placeCache.get(placeKey) ?? placeRes)
  const places = useMemo(() => {
    const featured: PlaceResult[] = matchFeatured(key).map((f) => ({ name: f.name, detail: f.detail, lat: f.lat, lon: f.lon, kind: f.kind === 'shopping' ? 'mall' : 'place', osm: f.osm }))
    // the same building under another OpenStreetMap id (a shop node inside the mall) goes too: within about 80 m, same name
    const same = (p: PlaceResult) => featured.some((f) => f.osm === p.osm ||
      (Math.abs(f.lat - p.lat) < 0.0008 && Math.abs(f.lon - p.lon) < 0.0008 && p.name.toLowerCase().includes(f.name.toLowerCase().split(' ')[0])))
    return [...featured, ...found.filter((p) => !same(p))]
  }, [key, found])
  return {
    stops: key.length < 2 ? [] : (stopCache.get(key) ?? stopRes),
    places,
    routeStops: !isCode ? [] : (routeCache.get(key) ?? routeRes),
    fixed: key.length < 3 ? null : fixCache.has(key) ? (fixCache.get(key) ?? null) : fixRes,
    loading: (key.length >= 2 && !stopCache.has(key)) || (key.length >= 2 && !placeCache.has(placeKey)) || (isCode && !routeCache.has(key)),
  }
}
