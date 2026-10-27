import { supabase } from './supabase'
import { PARKING_STATION } from '../data/parkingStations'

// Car parks at and near rail stations (public.station_parking, database repo docs/STATION_PARKING.md): operator
// Park & Ride sites with fares in RM (MyRapid, KLIA Ekspres) and OpenStreetMap car parks with a location only.
// Fares are never guessed: no published fare shows as "fare not published". OSM rows: (c) OpenStreetMap
// contributors, ODbL.

export type CarPark = {
  id: number
  station_key: string
  carpark_name: string
  operator: string | null
  source: 'operator' | 'osm'
  status: string
  lat: number | null
  lon: number | null
  distance_m: number | null
  park_ride: boolean | null
  train_user_rate_rm: number | null
  first_hour_rm: number | null
  next_hour_rm: number | null
  daily_max_rm: number | null
  is_free: boolean
  monthly_train_user_rm: number | null
  monthly_other_rm: number | null
  capacity_car: number | null
  source_url: string
  checked_date: string
}

type Row = Omit<CarPark, 'lat' | 'lon'> & { geog: string | null }

const COLUMNS = 'id, station_key, carpark_name, operator, source, status, geog, distance_m, park_ride, train_user_rate_rm, first_hour_rm, next_hour_rm, daily_max_rm, is_free, monthly_train_user_rm, monthly_other_rm, capacity_car, source_url, checked_date'

// geography comes back as hex EWKB: byte order, type (with the SRID flag), SRID, then x (lon) and y (lat)
export function pointFromEwkb(hex: string | null): [number, number] | null {
  if (!hex || hex.length < 50) return null
  const bytes = new Uint8Array(hex.match(/../g)!.map((b) => parseInt(b, 16)))
  const view = new DataView(bytes.buffer)
  const little = bytes[0] === 1
  const hasSrid = (view.getUint32(1, little) & 0x20000000) !== 0
  const at = hasSrid ? 9 : 5
  return [view.getFloat64(at, little), view.getFloat64(at + 8, little)]
}

// operator Park & Ride first, then nearest
const order = (a: CarPark, b: CarPark) =>
  Number(b.source === 'operator') - Number(a.source === 'operator') || (a.distance_m ?? 9e9) - (b.distance_m ?? 9e9)

// the whole table is small (under 700 rows): loaded once per visit
let cache: Promise<CarPark[]> | null = null

export function loadCarParks(): Promise<CarPark[]> {
  if (cache) return cache
  cache = Promise.resolve(supabase.from('station_parking').select(COLUMNS).limit(2000)).then(({ data, error }) => {
    if (error) throw new Error(error.message)
    return ((data ?? []) as Row[]).map(({ geog, ...r }) => {
      const p = pointFromEwkb(geog)
      return { ...r, lon: p ? p[0] : null, lat: p ? p[1] : null }
    }).sort(order)
  })
  cache.catch(() => { cache = null })
  return cache
}

// station_key for a rail stop, or undefined when the station has no car park on record
export const parkingStationKey = (feedId: string | undefined, stopId: string | undefined) =>
  feedId && stopId ? PARKING_STATION[`${feedId}:${stopId}`] : undefined

export const carParksAt = (all: CarPark[], stationKey: string) => all.filter((c) => c.station_key === stationKey)

// the operator's Park & Ride with a published train-user rate, if there is one
export const parkAndRide = (list: CarPark[]) => list.find((c) => c.source === 'operator' && c.park_ride && c.train_user_rate_rm !== null)

export const hasFare = (c: CarPark) =>
  c.is_free || c.train_user_rate_rm !== null || c.first_hour_rm !== null || c.daily_max_rm !== null || c.monthly_other_rm !== null

export const rm = (n: number) => `RM ${n.toFixed(2)}`

// A car park's name for people: OpenStreetMap gives most none, so the database names them after what they belong
// to ("AEON Car Park") or what is near ("Car park near Wisma X", "Car park near Maluri station"); those two are
// put into the site language here
export function carParkName(name: string, t: (k: 'parkUnnamed' | 'parkNearPlace' | 'parkNearStation') => string) {
  if (name === 'unnamed car park') return t('parkUnnamed')
  const station = /^Car park near (.+) station$/.exec(name)
  if (station) return t('parkNearStation').replace('{station}', station[1])
  const place = /^Car park near (.+)$/.exec(name)
  return place ? t('parkNearPlace').replace('{place}', place[1]) : name
}
