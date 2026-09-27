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
}

export type PlaceResult = { name: string; detail: string; lat: number; lon: number; kind: string; osm: string }

const STOP_DELAY = 120 // ms, database search is fast
const PLACE_DELAY = 300 // ms, the geocoder is a shared outside service
const CACHE_MAX = 200

const stopCache = new Map<string, StopResult[]>()
const placeCache = new Map<string, PlaceResult[]>()

function remember<T>(cache: Map<string, T>, key: string, value: T) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!)
  cache.set(key, value)
}

export const normaliseQuery = (q: string) => q.trim().toLowerCase().replace(/\s+/g, ' ')

export function useSmartSearch(query: string) {
  const key = normaliseQuery(query)
  const [stopRes, setStopRes] = useState<StopResult[]>([])
  const [placeRes, setPlaceRes] = useState<PlaceResult[]>([])

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
    loading: (key.length >= 2 && !stopCache.has(key)) || (key.length >= 3 && !placeCache.has(key)),
  }
}
