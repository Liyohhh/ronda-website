// RONDA 300: the places within a short walk of a station. For now the curated places of the trails (one database,
// public.trails_data); merchant listings will be added to the same lookup later, station by station.

import type { Lang } from '../i18n/translations'
import { isCategoryShown, type Place, type Station, type TrailData } from './trails'

export type StationPlaces = { station: Station; places: Place[] }

// every station that has at least one place, with its places (places of Arabic-only trails only in Arabic)
export function stationsWithPlaces(data: TrailData, lang: Lang): StationPlaces[] {
  const visible = new Set(data.trails.filter((t) => isCategoryShown(t.category, lang)).flatMap((t) => t.stops.map((s) => s.placeId)))
  const byStation = new Map<string, StationPlaces>()
  for (const id of visible) {
    const place = data.places[id]
    if (!place?.station) continue
    const k = place.station.search
    const entry = byStation.get(k) ?? { station: place.station, places: [] }
    entry.places.push(place)
    byStation.set(k, entry)
  }
  for (const e of byStation.values()) e.places.sort((a, b) => a.name.localeCompare(b.name))
  return [...byStation.values()]
}

// the picked stop's name is its exact search_stops() name, the same as Station.search
export const placesAt = (all: StationPlaces[], stopName: string) => all.find((s) => s.station.search === stopName) ?? null

export function distanceM(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const R = 6371000, rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// nearest stations that have places; coords: "<feedId>:<stopId>" -> position (from public.stops)
export function nearestWithPlaces(all: StationPlaces[], coords: Map<string, { lat: number; lon: number }>, from: { lat: number; lon: number }, n = 3) {
  return all
    .map((s) => ({ ...s, pos: coords.get(`${s.station.feedId}:${s.station.stopId}`) }))
    .filter((s): s is StationPlaces & { pos: { lat: number; lon: number } } => !!s.pos)
    .map((s) => ({ station: s.station, places: s.places, distance: distanceM(from, s.pos) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, n)
}

export const planToPlace = (s: Station, placeName: string) => `/?to=${encodeURIComponent(s.search)}&toName=${encodeURIComponent(placeName)}`
