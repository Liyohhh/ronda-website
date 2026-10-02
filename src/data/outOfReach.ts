// plan-trip's meta.out_of_reach: no stop within walking reach of the start and / or the end.
// Turns it into a sentence per end ("Genting Highlands has no train or bus stop within 3 km. The nearest is
// ..."), or null when the planner sent none.
export type NearestStop = { name: string; stop_id: string; feed_id: string; distance_m: number }
export type OutOfReach = { from: boolean; to: boolean; max_walk_m: number; nearest_from: NearestStop | null; nearest_to: NearestStop | null }

export function outOfReachMessage(r: OutOfReach | null | undefined, fromName: string, toName: string, template: string): string | null {
  if (!r || (!r.from && !r.to)) return null
  const km = (m: number) => (m / 1000).toFixed(m < 10_000 ? 1 : 0)
  const line = (place: string, near: NearestStop | null) =>
    near ? template.replace('{place}', place).replace('{max}', km(r.max_walk_m)).replace('{stop}', near.name).replace('{km}', km(near.distance_m)) : null
  return [r.from ? line(fromName, r.nearest_from) : null, r.to ? line(toName, r.nearest_to) : null].filter(Boolean).join(' ') || null
}
