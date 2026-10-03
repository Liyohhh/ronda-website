import { supabase } from './supabase'

// Live buses from the `live` Edge Function (Rapid KL + MRT feeder, positions from the operator and data.gov.my),
// and KTMB trains (data.gov.my).
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

// A KTMB train (data.gov.my), tied to its timetable trip
export type LiveTrain = {
  vehicle_id: string
  train_no: string // KTMB train number = GTFS trip_id ("9209")
  unit: string | null // train set ("ETS304")
  feed_id: string
  route_id: string
  line: string | null // "ETS", "Seremban Line", "Shuttle Tebrau"
  network: string | null // "KTM ETS", "KTM Komuter", "KTM Intercity"
  colour: string | null
  headsign: string | null // where it is going (last stop of the trip)
  next_stop: string | null
  delay_secs: number | null // about how late (+) / early (-) against the timetable; null = not known
  lat: number
  lon: number
  bearing: number | null
  gps_at: string
}

export type LiveSource = { source: 'official' | 'kiosk' | 'ktmb'; fetched_at: string; ok: boolean | null; vehicles: number | null }

// Minutes late to show: null = not known, 0 = on time. The delay is estimated from where the train is between two
// stops (a straight line, not the track), so under 3 minutes counts as on time and early is not shown.
export const LATE_FROM_SECS = 180
export const lateMinutes = (delaySecs: number | null) =>
  delaySecs === null ? null : delaySecs >= LATE_FROM_SECS ? Math.round(delaySecs / 60) : 0

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
  call<{ vehicles: LiveBus[]; trains?: LiveTrain[]; sources: LiveSource[] }>({ action: 'vehicles', ...(bbox ? { bbox } : {}) })

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

// dark text on light line colours (KTM ETS yellow), white otherwise
export const textOn = (hex: string) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return '#fff'
  const n = parseInt(m[1], 16), lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.6 ? '#111827' : '#fff'
}

export const kmText = (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m / 10) * 10} m`)
