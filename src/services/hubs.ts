import { supabase } from './supabase'

// Arrival hubs (KLIA T1 / T2, KL Sentral, TBS) and their popular destinations, planned every night in the database
// by the trip planner for the next day at 10:00 (public.hubs, public.hub_destinations).

export type Hub = { slug: string; name: string; lat: number; lon: number }
export type HubDestination = {
  dest_slug: string; dest_name: string; lat: number; lon: number; sort: number
  duration_min: number | null; transfers: number | null; walk_min: number | null
  fare_amount: number | null; fare_exact: boolean | null; hops: string[] | null; computed_at: string | null
}

export async function loadHub(slug: string): Promise<{ hub: Hub; destinations: HubDestination[] } | null> {
  const [h, d] = await Promise.all([
    supabase.from('hubs').select('slug, name, lat, lon').eq('slug', slug).maybeSingle(),
    supabase.from('hub_destinations')
      .select('dest_slug, dest_name, lat, lon, sort, duration_min, transfers, walk_min, fare_amount, fare_exact, hops, computed_at')
      .eq('hub_slug', slug).order('sort'),
  ])
  if (h.error || d.error) throw new Error((h.error ?? d.error)!.message)
  if (!h.data) return null
  return { hub: h.data as Hub, destinations: (d.data ?? []) as HubDestination[] }
}

// Open Home with this trip filled in (start = the hub, end = the destination)
export const planFromHub = (hub: Hub, d: { lat: number; lon: number; dest_name: string }) =>
  `/?fromLat=${hub.lat}&fromLon=${hub.lon}&fromName=${encodeURIComponent(hub.name)}` +
  `&toLat=${d.lat}&toLon=${d.lon}&toName=${encodeURIComponent(d.dest_name)}`
