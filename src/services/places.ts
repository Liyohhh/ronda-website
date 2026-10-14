import { supabase } from './supabase'
import type { Lang } from '../i18n/translations'
import type { IconName } from '../data/icons'

// Places from OpenStreetMap within 300 m of a point (public.places_near; © OpenStreetMap contributors, ODbL).
// Loaded monthly into the database; names and tags exactly as mapped.

export type PlaceKind = 'restaurant' | 'attraction' | 'park' | 'shopping' | 'hotel' | 'worship' | 'useful'
export const PLACE_KINDS: PlaceKind[] = ['restaurant', 'attraction', 'park', 'shopping', 'hotel', 'worship', 'useful']
export const KIND_ICON: Record<PlaceKind, IconName> = {
  restaurant: 'restaurant', attraction: 'star', park: 'parkOutline', shopping: 'shoppingBagOutline',
  hotel: 'apartment', worship: 'mosqueOutline', useful: 'infoOutline',
}

export type NearPlace = {
  osm_id: string; kind: PlaceKind; subkind: string | null; name: string
  name_en: string | null; name_ms: string | null; name_zh: string | null; name_ar: string | null
  lat: number; lon: number; opening_hours: string | null; distance_m: number
}

export async function loadPlacesNear(lat: number, lon: number): Promise<NearPlace[]> {
  const { data, error } = await supabase.rpc('places_near', { p_lat: lat, p_lon: lon, p_radius_m: 300, p_limit: 200 })
  if (error) throw new Error(error.message)
  return (data ?? []) as NearPlace[]
}

// The mapped name in the reader's language when OSM has one, otherwise the place's own name
export function placeName(p: NearPlace, lang: Lang) {
  const own = { en: p.name_en, ms: p.name_ms, zh: p.name_zh, ar: p.name_ar }[lang]
  return own || p.name
}

// Straight-line metres to minutes on foot (1.2 m/s on a 1.3x detour, as the trip planner walks), at least 1
export const walkMinutes = (m: number) => Math.max(1, Math.round((m * 1.3) / 1.2 / 60))

// Plan a trip to the place itself (Home reads toLat / toLon / toName)
export const planToPoint = (p: { lat: number; lon: number }, name: string) =>
  `/?toLat=${p.lat}&toLon=${p.lon}&toName=${encodeURIComponent(name)}`
