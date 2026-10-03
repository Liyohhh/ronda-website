import { supabase } from './supabase'
import type { Place, Trail, TrailData } from '../data/trails'

// Trails come from the database (public.trails_data(): trails, their stops in order, places with the nearest
// station). One request, cached for the visit: every page and card shares it.

let cache: Promise<TrailData> | null = null

export function loadTrails(): Promise<TrailData> {
  if (!cache) {
    cache = (async () => {
      const { data, error } = await supabase.rpc('trails_data')
      if (error || !data) throw new Error(error?.message ?? 'no trails')
      const { trails, places } = data as { trails: Trail[]; places: Place[] }
      return { trails, places: Object.fromEntries(places.map((p) => [p.id, p])) }
    })()
    // a failed load is not cached, so the next page tries again
    cache.catch(() => { cache = null })
  }
  return cache
}

// test hook
export const resetTrailsCache = () => { cache = null }
