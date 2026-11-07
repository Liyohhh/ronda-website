import { supabase } from './supabase'
import { optedOut } from './analytics'

// Search learns from picks: the station, stop or place chosen from a suggestion list is sent once per page visit
// (record_search_pick). The database keeps only which item and a salted hash of the address, one count per person
// per day, and ranks often-picked items higher from the next day. Nothing is sent when the browser asks not to be
// tracked; errors are ignored.
const sent = new Set<string>()

export function recordPick(ref: string | undefined) {
  if (!ref || sent.has(ref) || optedOut()) return
  sent.add(ref)
  void supabase.rpc('record_search_pick', { p_item: ref }).then(() => undefined, () => undefined)
}

// OpenStreetMap id as the geocoder gives it ("W123") or as our places have it ("way/123") -> 'place:way/123'
const OSM_TYPES: Record<string, string> = { N: 'node', W: 'way', R: 'relation' }
export function placeRef(osm: string | null | undefined): string | undefined {
  if (!osm) return undefined
  if (/^(node|way|relation)\/\d+$/.test(osm)) return `place:${osm}`
  const m = /^([NWR])(\d+)$/.exec(osm)
  return m ? `place:${OSM_TYPES[m[1]]}/${m[2]}` : undefined
}

export const stopRef = (feedId: string, stopId: string) => `stop:${feedId}:${stopId}`
