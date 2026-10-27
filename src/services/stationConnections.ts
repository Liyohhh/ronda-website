import { supabase } from './supabase'
import { LINES, hasFeed, type Line } from '../data/lines'

// Which rail lines meet at a station, for the line panel's "change here" badges (like the MyRapid line maps):
//   - here: the lines that stop at this station (the same stop, e.g. the KTM lines at KL Sentral, or a cross-platform
//     pair such as the Ampang and Sri Petaling lines at Titiwangsa)
//   - change: lines reached inside the paid area (no tap-out), shown with ⇌
//   - walk: lines reached by walking out to another station (tap out), shown with a walking person
// Built once per visit from public.line_stations (every rail line) and public.rail_interchanges.

export type StationConnections = { here: Line[]; change: Line[]; walk: Line[] }
type Interchange = { stop_ids: string[]; paid_area: boolean; cross_platform: boolean }
type Index = { linesAt: Map<string, string[]>; interchanges: Interchange[] }

const RAIL = LINES.filter((l) => l.mode !== 'BUS' && hasFeed(l))
let cached: Promise<Index> | null = null

export const stopKey = (feedId: string, stopId: string) => `${feedId}:${stopId}`

export function loadStationIndex(): Promise<Index> {
  cached ??= (async () => {
    const [lists, ix] = await Promise.all([
      Promise.all(RAIL.map((l) =>
        supabase.rpc('line_stations', { p_feed: l.gtfs.feedId, p_routes: l.gtfs.routeIds })
          .then(({ data }) => ({ l, stops: (data as { stop_id: string }[] | null) ?? [] })))),
      supabase.from('rail_interchanges').select('stop_ids, paid_area, cross_platform').then(({ data }) => (data as Interchange[] | null) ?? []),
    ])
    const linesAt = new Map<string, string[]>()
    for (const { l, stops } of lists) {
      for (const s of stops) {
        const k = stopKey(l.gtfs.feedId, s.stop_id)
        const at = linesAt.get(k) ?? []
        if (!at.includes(l.id)) at.push(l.id)
        linesAt.set(k, at)
      }
    }
    return { linesAt, interchanges: ix }
  })().catch((e) => {
    cached = null // try again next time
    throw e
  })
  return cached
}

// lines kept in the order of LINES, so the badges always read the same way
const ordered = (ids: Set<string>) => RAIL.filter((l) => ids.has(l.id))

export function connectionsAt(index: Index, line: Line, key: string): StationConnections {
  const here = new Set<string>([line.id, ...(index.linesAt.get(key) ?? [])])
  const change = new Set<string>()
  const walk = new Set<string>()
  const linked = index.interchanges.filter((x) => x.stop_ids.includes(key))
  // a cross-platform pair counts as the same station
  for (const x of linked.filter((x) => x.cross_platform)) {
    for (const k of x.stop_ids) for (const id of index.linesAt.get(k) ?? []) here.add(id)
  }
  for (const x of linked.filter((x) => !x.cross_platform)) {
    for (const k of x.stop_ids) {
      if (k === key) continue
      for (const id of index.linesAt.get(k) ?? []) if (!here.has(id)) (x.paid_area ? change : walk).add(id)
    }
  }
  for (const id of change) walk.delete(id) // reachable without tapping out wins
  return { here: ordered(here), change: ordered(change), walk: ordered(walk) }
}

