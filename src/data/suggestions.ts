import type { PlaceResult, StopResult } from '../hooks/useSmartSearch'
import { matchScore } from './smartMatch'

// What the user can pick as Start / End
export type Pick = { name: string; lat: number; lon: number }

export type SuggestionItem =
  | { type: 'stop'; key: string; pick: Pick; stop: StopResult }
  | { type: 'place'; key: string; pick: Pick; place: PlaceResult }
  | { type: 'recent'; key: string; pick: Pick }

export const MAX_STOPS = 10
export const MAX_PLACES = 8

// "MRT Maluri" is scored as "Maluri" too, so "maluri" counts as the start of the name
const MODE = /^(lrt|mrt|ktm\/ets|ktm|erl|brt|monorail|ets)\s+/i

// how well a name matches: 2 = starts with the search, 1 = every word found, 0 = only a fuzzy match from the
// database. Scored against what was typed and against the database's fixed search ("mrrt mluri" -> "mrt maluri").
export function matchRank(name: string, query: string, fixed: string | null = null): number {
  const texts = [name, name.replace(MODE, '')]
  const s = Math.max(matchScore(query, texts), fixed ? matchScore(fixed, texts) : 0)
  return s >= 100 ? 2 : s > 0 ? 1 : 0
}

// A station or stop code typed on its own ("kj15", "KG 22", "KL1483") puts that station or stop above everything,
// ahead of stops whose names only start with it ("(M) KJ154 Taman Sri Nanding")
const CODE = /^[a-z]{1,4}\d{1,5}[a-z]?$/
export function stopRank(s: StopResult, query: string, fixed: string | null = null): number {
  const code = query.toLowerCase().replace(/[\s-]/g, '')
  if (CODE.test(code) && (s.stop_code?.toLowerCase() === code || s.stop_id.toLowerCase() === code)) return 3
  return matchRank(s.stop_name, query, fixed)
}

// a place found by another name (English, Chinese, a landmark name: "kl tower" finds Menara Kuala Lumpur) is scored
// on that name too
export const placeRank = (p: PlaceResult, query: string, fixed: string | null = null) =>
  Math.max(matchRank(p.name, query, fixed), p.matched ? matchRank(p.matched, query, fixed) : 0)

// the same bus stop listed more than once (both sides of the road, or once per route group): keep the first
const near = (a: StopResult, b: StopResult) => Math.abs(a.stop_lat - b.stop_lat) < 0.003 && Math.abs(a.stop_lon - b.stop_lon) < 0.003
const isBus = (s: StopResult) => /^BUS\b/.test(s.category)
export function dedupeStops(stops: StopResult[]): StopResult[] {
  const kept: StopResult[] = []
  for (const s of stops) {
    const name = s.stop_name.toLowerCase()
    if (isBus(s) && kept.some((k) => isBus(k) && k.stop_name.toLowerCase() === name && near(k, s))) continue
    kept.push(s)
  }
  return kept
}

// stable sort, best rank first (the database's order is kept within a rank)
function byRank<T>(list: T[], rank: (x: T) => number): T[] {
  return list.map((x, i) => ({ x, i, r: rank(x) })).sort((a, b) => b.r - a.r || a.i - b.i).map((e) => e.x)
}

// routeStops: a typed bus route code's stops in running order; shown first, all of them (the list scrolls).
// Then stations and places, each best match first; places come first when one of them matches better than any
// station ("pavilion kl" -> the mall before bus stops that only look alike).
export function buildItems(stops: StopResult[], places: PlaceResult[], routeStops: StopResult[] = [], query = '', fixed: string | null = null): SuggestionItem[] {
  const rankedStops = byRank(dedupeStops(stops), (s) => stopRank(s, query, fixed)).slice(0, MAX_STOPS)
  const rankedPlaces = byRank(places, (p) => placeRank(p, query, fixed)).slice(0, MAX_PLACES)
  const placeBest = rankedPlaces.length ? placeRank(rankedPlaces[0], query, fixed) : -1
  const stopBest = rankedStops.length ? stopRank(rankedStops[0], query, fixed) : -1
  // on a tie a train station stays first ("klcc"), a bus stop named after the place does not ("pavilion")
  const placesFirst = placeBest > stopBest || (placeBest === stopBest && placeBest > 0 && isBus(rankedStops[0]))

  const stopItems: SuggestionItem[] = rankedStops.map((s) => ({
    type: 'stop',
    key: `s:${s.feed_id}:${s.stop_id}`,
    pick: { name: s.stop_name, lat: s.stop_lat, lon: s.stop_lon },
    stop: s,
  }))
  const placeItems: SuggestionItem[] = rankedPlaces.map((p) => ({
    type: 'place',
    key: `p:${p.osm || `${p.name}:${p.lat}:${p.lon}`}`,
    pick: { name: p.name, lat: p.lat, lon: p.lon },
    place: p,
  }))
  return [
    ...routeStops.map((s) => ({
      type: 'stop' as const,
      key: `r:${s.feed_id}:${s.route_code}:${s.stop_sequence}`,
      pick: { name: s.stop_name, lat: s.stop_lat, lon: s.stop_lon },
      stop: s,
    })),
    ...(placesFirst ? [...placeItems, ...stopItems] : [...stopItems, ...placeItems]),
  ]
}

// Recent picks, shown when the box is empty. Kept in this browser only (localStorage), never sent anywhere.
const RECENT_KEY = 'ronda.recent'
const RECENT_MAX = 6

export function loadRecent(): Pick[] {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    return Array.isArray(list)
      ? list.filter((p) => p && typeof p.name === 'string' && Number.isFinite(p.lat) && Number.isFinite(p.lon)).slice(0, RECENT_MAX)
      : []
  } catch {
    return []
  }
}

export function rememberRecent(pick: Pick) {
  try {
    const same = (p: Pick) => p.name === pick.name && Math.abs(p.lat - pick.lat) < 0.0005 && Math.abs(p.lon - pick.lon) < 0.0005
    const list = [{ name: pick.name, lat: pick.lat, lon: pick.lon }, ...loadRecent().filter((p) => !same(p))].slice(0, RECENT_MAX)
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {
    // storage blocked: nothing remembered
  }
}

export const recentItems = (): SuggestionItem[] =>
  loadRecent().map((p, i) => ({ type: 'recent', key: `h:${i}:${p.name}`, pick: p }))
