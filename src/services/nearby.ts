import { supabase } from './supabase'

// The nearest train stations and bus stops to a point (public.nearby_transit: within 1 km, nearest first, with the
// route ids for line badges, the bus stop code and the bus route numbers).

export type NearStop = {
  feed_id: string; stop_id: string; name: string; lat: number; lon: number; is_rail: boolean
  distance_m: number; route_ids: string[] | null; code: string | null; routes: string[] | null
}

export const NEAR_RADIUS_M = 1000
export const NEAR_PER_GROUP = 4

export async function loadNearbyTransit(lat: number, lon: number): Promise<NearStop[]> {
  const { data, error } = await supabase.rpc('nearby_transit', { p_lat: lat, p_lon: lon, p_radius_m: NEAR_RADIUS_M, p_limit: 60 })
  if (error) throw new Error(error.message)
  return (data ?? []) as NearStop[]
}

// Trains and buses, nearest first, a few of each. Bus stops with the same name and routes (the two sides of a road)
// show once, the nearer one.
export function splitNearby(stops: NearStop[], perGroup = NEAR_PER_GROUP) {
  const trains = stops.filter((s) => s.is_rail).slice(0, perGroup)
  const seen = new Set<string>()
  const buses = stops.filter((s) => {
    if (s.is_rail) return false
    const k = `${s.name.toLowerCase()}|${(s.routes ?? []).join(',')}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  }).slice(0, perGroup)
  return { trains, buses }
}
