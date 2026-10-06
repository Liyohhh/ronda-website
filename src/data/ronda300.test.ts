import { describe, expect, it } from 'vitest'
import { distanceM, nearestWithPlaces, placesAt, planToPlace, stationsWithPlaces } from './ronda300'
import type { TrailData } from './trails'

const st = (name: string, stopId: string) => ({ name, search: name, lineIds: [], feedId: 'rapid-rail-kl', stopId })
const DATA: TrailData = {
  trails: [
    { slug: 'food', key: 'food', category: 'food', stops: [{ placeId: 'a' }, { placeId: 'b' }] },
    { slug: 'halal-fine-dining', key: 'halalFine', category: 'halal-fine-dining', stops: [{ placeId: 'h' }] },
  ],
  places: {
    a: { id: 'a', name: 'Alpha', station: st('LRT KLCC', 'KJ10') },
    b: { id: 'b', name: 'Bravo', station: null },
    h: { id: 'h', name: 'Halal place', station: st('MRT Conlay', 'PY22') },
  },
}

describe('RONDA 300 lookup', () => {
  it('groups places by station, skips places without one, hides Arabic-only places in other languages', () => {
    expect(stationsWithPlaces(DATA, 'en').map((s) => s.station.name)).toEqual(['LRT KLCC'])
    expect(stationsWithPlaces(DATA, 'ar').map((s) => s.station.name).sort()).toEqual(['LRT KLCC', 'MRT Conlay'])
    expect(placesAt(stationsWithPlaces(DATA, 'en'), 'LRT KLCC')?.places.map((p) => p.name)).toEqual(['Alpha'])
    expect(placesAt(stationsWithPlaces(DATA, 'en'), 'MRT Conlay')).toBeNull()
  })

  it('nearest stations with places, closest first', () => {
    const all = stationsWithPlaces(DATA, 'ar')
    const coords = new Map([['rapid-rail-kl:KJ10', { lat: 3.158935, lon: 101.713287 }], ['rapid-rail-kl:PY22', { lat: 3.1514, lon: 101.7178 }]])
    const near = nearestWithPlaces(all, coords, { lat: 3.1496976, lon: 101.7169644 })
    expect(near.map((n) => n.station.name)).toEqual(['MRT Conlay', 'LRT KLCC'])
    expect(near[0].distance).toBeLessThan(300)
  })

  it('distance and plan link', () => {
    expect(Math.round(distanceM({ lat: 0, lon: 0 }, { lat: 0, lon: 1 }) / 1000)).toBe(111)
    expect(planToPlace(st('LRT KLCC', 'KJ10'), 'Suria KLCC')).toBe('/?to=LRT%20KLCC&toName=Suria%20KLCC')
  })
})
