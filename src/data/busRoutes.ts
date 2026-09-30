import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { BUS_FALLBACK_COLOR, type Line } from './lines'

// Every bus route in the database (Rapid KL buses and MRT feeder buses), as Lines the Lines tab can
// search and open. Loaded once per visit. public.bus_routes() gives the route number and where it goes;
// until that function exists we read the routes table (feeder routes then show their code only).

type Row = { feed_id: string; route_id: string; code: string | null; name: string | null; colour: string | null }

const toLine = (r: Row): Line => {
  const c = r.colour ? (r.colour.startsWith('#') ? r.colour : `#${r.colour}`).toUpperCase() : BUS_FALLBACK_COLOR
  const code = r.code ?? r.route_id
  return {
    id: `bus-${r.feed_id}-${r.route_id}`,
    name: r.name && r.name !== code ? r.name : code,
    code,
    mode: 'BUS',
    color: c,
    textColor: '#FFFFFF',
    colorSource: r.colour ? 'gtfs' : 'unverified',
    gtfs: { feedId: r.feed_id, routeIds: [r.route_id] },
  }
}

let cache: Promise<Line[]> | null = null

async function fetchBusRoutes(): Promise<Line[]> {
  const rpc = await supabase.rpc('bus_routes')
  if (!rpc.error && Array.isArray(rpc.data)) return (rpc.data as Row[]).map(toLine)
  const { data, error } = await supabase
    .from('routes')
    .select('feed_id, route_id, route_short_name, route_long_name, route_color')
    .eq('route_type', 3)
  if (error) {
    console.error('bus routes', error)
    return []
  }
  return (data ?? []).map((r) =>
    toLine({
      feed_id: r.feed_id,
      route_id: r.route_id,
      code: r.route_short_name || r.route_long_name,
      name: r.route_short_name ? r.route_long_name : null,
      colour: r.route_color,
    }),
  )
}

export function loadBusRoutes() {
  cache ??= fetchBusRoutes().catch(() => {
    cache = null
    return []
  })
  return cache
}

// Bus routes for the Lines search ([] until loaded)
export function useBusRoutes() {
  const [lines, setLines] = useState<Line[]>([])
  useEffect(() => {
    let live = true
    loadBusRoutes().then((l) => live && setLines(l))
    return () => {
      live = false
    }
  }, [])
  return lines
}
