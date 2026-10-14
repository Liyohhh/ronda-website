import { supabase } from './supabase'
import { walkMinutes } from './places'

// The nearest train station and the nearest bus stop to a point, however far (public.nearest_transit), with the
// route ids for the line badge, the bus stop code and the bus route numbers.

export type NearStop = {
  feed_id: string; stop_id: string; name: string; lat: number; lon: number; is_rail: boolean
  distance_m: number; route_ids: string[] | null; code: string | null; routes: string[] | null
}

export async function loadNearestTransit(lat: number, lon: number): Promise<{ train: NearStop | null; bus: NearStop | null }> {
  const { data, error } = await supabase.rpc('nearest_transit', { p_lat: lat, p_lon: lon })
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as NearStop[]
  return { train: rows.find((r) => r.is_rail) ?? null, bus: rows.find((r) => !r.is_rail) ?? null }
}

// "400 m", "1.6 km", "26 km"
export const distanceText = (m: number) => (m < 1000 ? `${m} m` : `${(m / 1000).toFixed(m < 10_000 ? 1 : 0)} km`)

// up to 2 km away a walk makes sense: say how long; further, only the distance
export const WALK_MAX_M = 2000
export const walkable = (m: number) => m <= WALK_MAX_M
export { walkMinutes }
