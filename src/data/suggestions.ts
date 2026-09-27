import type { PlaceResult, StopResult } from '../hooks/useSmartSearch'

// What the user can pick as Start / End
export type Pick = { name: string; lat: number; lon: number }

export type SuggestionItem =
  | { type: 'stop'; key: string; pick: Pick; stop: StopResult }
  | { type: 'place'; key: string; pick: Pick; place: PlaceResult }

export const MAX_STOPS = 8

export function buildItems(stops: StopResult[], places: PlaceResult[]): SuggestionItem[] {
  return [
    ...stops.slice(0, MAX_STOPS).map((s) => ({
      type: 'stop' as const,
      key: `s:${s.feed_id}:${s.stop_id}`,
      pick: { name: s.stop_name, lat: s.stop_lat, lon: s.stop_lon },
      stop: s,
    })),
    ...places.map((p) => ({
      type: 'place' as const,
      key: `p:${p.osm || `${p.name}:${p.lat}:${p.lon}`}`,
      pick: { name: p.name, lat: p.lat, lon: p.lon },
      place: p,
    })),
  ]
}
