import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

// Autocomplete data for the Start / End boxes: transit stops (search_stops RPC) and any place
// (geocode Edge Function, OpenStreetMap). Debounced, cached per query for the session, and the
// previous results stay on screen while new ones load so the list doesn't flicker.

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

export type PlaceResult = { name: string; detail: string; lat: number; lon: number; kind: string; osm: string }

const STOP_DELAY = 120 // ms, database search is fast
const PLACE_DELAY = 300 // ms, the geocoder is a shared outside service
const CACHE_MAX = 200

const stopCache = new Map<string, StopResult[]>()
const placeCache = new Map<string, PlaceResult[]>()
const routeCache = new Map<string, StopResult[]>()

function remember<T>(cache: Map<string, T>, key: string, value: T) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!)
  cache.set(key, value)
}

export const normaliseQuery = (q: string) => q.trim().toLowerCase().replace(/\s+/g, ' ')

export function useSmartSearch(query: string) {
  const key = normaliseQuery(query)
  const [stopRes, setStopRes] = useState<StopResult[]>([])
  const [placeRes, setPlaceRes] = useState<PlaceResult[]>([])
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

  useEffect(() => {
    if (key.length < 3 || placeCache.has(key)) return
    let cancelled = false
    const timer = setTimeout(async () => {
      const { data, error } = await supabase.functions.invoke('geocode', { body: { q: key } })
      if (error || data?.error) {
        console.error('Place search error:', error || data?.error)
        if (!cancelled) setPlaceRes([])
        return
      }
      remember(placeCache, key, (data?.results ?? []) as PlaceResult[])
      if (!cancelled) setPlaceRes((data?.results ?? []) as PlaceResult[])
    }, PLACE_DELAY)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [key])

  return {
    stops: key.length < 2 ? [] : (stopCache.get(key) ?? stopRes),
    places: key.length < 3 ? [] : (placeCache.get(key) ?? placeRes),
    routeStops: !isCode ? [] : (routeCache.get(key) ?? routeRes),
    loading: (key.length >= 2 && !stopCache.has(key)) || (key.length >= 3 && !placeCache.has(key)) || (isCode && !routeCache.has(key)),
  }
}
