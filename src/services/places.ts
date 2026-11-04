import { supabase } from './supabase'
import type { Lang } from '../i18n/translations'
import type { IconName } from '../data/icons'

// Places from OpenStreetMap within 300 m of a point (public.places_near; © OpenStreetMap contributors, ODbL).
// Loaded monthly into the database; names and tags exactly as mapped.

// Sorted here from the database's kinds: 'bank' out of 'useful' (banks, ATMs, money changers); 'mosque' is the
// database's 'worship' places tagged Muslim (mosques and surau); 'religion' is every other place of worship
export type PlaceKind = 'restaurant' | 'attraction' | 'park' | 'shopping' | 'hotel' | 'mosque' | 'religion' | 'bank' | 'useful'
export const PLACE_KINDS: PlaceKind[] = ['restaurant', 'attraction', 'park', 'shopping', 'hotel', 'mosque', 'religion', 'bank', 'useful']
export const KIND_ICON: Record<PlaceKind, IconName> = {
  restaurant: 'restaurant', attraction: 'star', park: 'parkOutline', shopping: 'shoppingBagOutline',
  hotel: 'apartment', mosque: 'mosqueOutline', religion: 'locationOnOutline', bank: 'accountBalanceOutline', useful: 'infoOutline',
}

// one muted colour per kind, for the map dots and the list labels (each readable as a dot on the light map and as
// small text on cream)
export const KIND_COLOR: Record<PlaceKind, string> = {
  restaurant: '#B4492A', attraction: '#2C6B66', park: '#4D7330', shopping: '#8C2F4E',
  hotel: '#2D5687', mosque: '#99691A', religion: '#6A5A8C', bank: '#3F4A6E', useful: '#5A5F6B',
}

export type NearPlace = {
  osm_id: string; kind: PlaceKind; subkind: string | null; name: string
  name_en: string | null; name_ms: string | null; name_zh: string | null; name_ar: string | null
  lat: number; lon: number; opening_hours: string | null; distance_m: number
}

export async function loadPlacesNear(lat: number, lon: number): Promise<NearPlace[]> {
  const { data, error } = await supabase.rpc('places_near', { p_lat: lat, p_lon: lon, p_radius_m: 300, p_limit: 200 })
  if (error) throw new Error(error.message)
  return ((data ?? []) as (Omit<NearPlace, 'kind'> & { kind: string })[]).map((p) => ({ ...p, kind: placeKind(p.kind, p.subkind) }))
}

// The database's kind (and subkind: the religion for worship, the amenity for useful) to the kind shown
const MONEY = new Set(['bank', 'atm', 'bureau_de_change'])
export function placeKind(kind: string, subkind: string | null): PlaceKind {
  if (kind === 'worship') return subkind === 'muslim' ? 'mosque' : 'religion'
  if (kind === 'useful' && subkind && MONEY.has(subkind)) return 'bank'
  return kind as PlaceKind
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

// Where the hand-picked trail places are (public.trail_places), for the RONDA picks on the RONDA 300 map.
// One request, kept for the visit.
export type PickSpot = { id: string; lat: number; lon: number }
let spots: Promise<PickSpot[]> | null = null
export function loadPickSpots(): Promise<PickSpot[]> {
  if (!spots) {
    spots = (async () => {
      const { data, error } = await supabase.from('trail_places').select('id, lat, lon').not('lat', 'is', null)
      if (error) throw new Error(error.message)
      return (data ?? []) as PickSpot[]
    })()
    spots.catch(() => { spots = null })
  }
  return spots
}
