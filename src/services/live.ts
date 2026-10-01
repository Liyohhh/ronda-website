import { supabase } from './supabase'

// Live buses from the `live` Edge Function (Rapid KL + MRT feeder, positions from the operator and data.gov.my).
// The server refreshes the feeds at most every 25 s for everyone, so polling every 30 s is enough.

export const LIVE_POLL_MS = 30_000

export type BusStatus = 'on_trip' | 'off_trip' | 'contingency' | 'other' | null

export type LiveBus = {
  vehicle_id: string
  feed_id: string
  route_id: string
  label: string | null // route number as riders know it ("190", "T808")
  colour: string | null
  lat: number
  lon: number
  bearing: number | null
  speed_kmh: number | null
  status: BusStatus
  wheelchair: boolean | null
  current_stop_id: string | null
  source: 'official' | 'kiosk' | 'both'
  gps_at: string
}

export type LiveSource = { source: 'official' | 'kiosk'; fetched_at: string; ok: boolean | null; vehicles: number | null }

// A bus on its way to the stop: where it is (stops_away / distance_m) and, for Rapid KL stops, the operator's arrival time
export type ApproachingBus = {
  vehicle_id: string
  stops_away: number | null
  distance_m: number | null
  eta_secs: number | null
  status: BusStatus
  wheelchair: boolean | null
  gps_at: string | null
}

export type Arrival = { feed_id: string; route_id: string; label: string | null; vehicle_id: string; eta_secs: number }

async function call<T>(body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke('live', { body })
  if (error || data?.error) throw new Error(String(error?.message ?? data?.error))
  return data as T
}

export const liveVehicles = (bbox?: [number, number, number, number]) =>
  call<{ vehicles: LiveBus[]; sources: LiveSource[] }>({ action: 'vehicles', ...(bbox ? { bbox } : {}) })

export const approachingBuses = (q: { feed_id: string; route_id: string; stop_id: string; next_stop_id: string }) =>
  call<{ buses: ApproachingBus[] }>({ action: 'approaching', ...q })

export const stopArrivals = (feed_id: string, stop_id: string) =>
  call<{ arrivals: Arrival[]; supported: boolean }>({ action: 'arrivals', feed_id, stop_id })

// "190" / "T 808" / "t0808" -> one key, like route codes in search
export const routeKey = (s: string) => s.toUpperCase().replace(/[\s\-_]/g, '').replace(/([A-Z]+)0+(\d)/, '$1$2')

// "12 s ago" / "3 min ago" from an ISO time
export function ago(iso: string, t: (k: 'liveSecsAgo' | 'liveMinAgo') => string, now = Date.now()) {
  const s = Math.max(0, Math.round((now - Date.parse(iso)) / 1000))
  return s < 60 ? t('liveSecsAgo').replace('{n}', String(s)) : t('liveMinAgo').replace('{n}', String(Math.round(s / 60)))
}

export const kmText = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m / 10) * 10} m`)
