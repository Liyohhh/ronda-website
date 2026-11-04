import { useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { LINES_BY_ID, type Line } from '../data/lines'

// rapid-rail-kl stop codes start with the line's letters (KJ10 = Kelana Jaya Line); ERL stops are all ERL
const PREFIX: [string, string][] = [
  ['KJ', 'lrt-kelana-jaya'], ['AG', 'lrt-ampang'], ['SP', 'lrt-sri-petaling'], ['SA', 'lrt-shah-alam'],
  ['KG', 'mrt-kajang'], ['PY', 'mrt-putrajaya'], ['MR', 'monorail'], ['SB', 'brt-sunway'],
]
const MODE_NAME: Record<string, string> = { LRT: 'LRT', MRT: 'MRT', MONORAIL: 'Monorail', BRT: 'BRT', ERL: 'ERL' }

type Row = { feed_id: string; stop_id: string; stop_name?: string | null; stop_lat: number; stop_lon: number }

function lineOf(r: Row) {
  if (r.feed_id === 'erl') return LINES_BY_ID['erl-klia-transit']
  const hit = PREFIX.find(([p]) => r.stop_id.toUpperCase().startsWith(p))
  return hit ? LINES_BY_ID[hit[1]] : undefined
}

// the table has names in capitals ("SENTUL TIMUR"): shown as "Sentul Timur", keeping short forms such as KLCC, USJ
// and codes with numbers (SS15) as they are
const KEEP = new Set(['KL', 'KLCC', 'KLIA', 'KLIA2', 'USJ', 'IOI', 'TRX', 'UPM', 'UKM', 'TTDI', 'PPR', 'KPJ', 'LRT', 'MRT', 'KTM', 'BRT', 'ERL', 'UIA', 'MRR2'])
function nice(raw: string) {
  return raw.split(/(\s+|-)/).map((w) => (KEEP.has(w.toUpperCase()) || /\d/.test(w) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join('')
}

export type RailStation = { id: string; name: string; lat: number; lon: number; line: Line }

// every LRT, MRT, Monorail, BRT and ERL station of the Klang Valley, from public.stops
export function useRailStations() {
  const [stations, setStations] = useState<RailStation[] | null>(null)
  useEffect(() => {
    let live = true
    supabase
      .from('stops')
      .select('feed_id, stop_id, stop_name, stop_lat, stop_lon')
      .in('feed_id', ['rapid-rail-kl', 'erl'])
      .then(({ data }) => {
        if (!live) return
        setStations(((data ?? []) as Row[]).flatMap((r) => {
          const line = lineOf(r)
          if (!line || !Number.isFinite(r.stop_lat)) return []
          return [{ id: `${r.feed_id}:${r.stop_id}`, name: `${MODE_NAME[line.mode] ?? line.mode} ${nice(r.stop_name ?? r.stop_id)}`, lat: r.stop_lat, lon: r.stop_lon, line }]
        }))
      })
    return () => { live = false }
  }, [])
  return stations
}

