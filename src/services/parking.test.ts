import { describe, expect, it } from 'vitest'
import { carParkName, carParksAt, hasFare, parkAndRide, parkingStationKey, pointFromEwkb, rm, type CarPark } from './parking'

const base: CarPark = {
  id: 1, station_key: 'rapid_rail_kl_kj1', carpark_name: 'Gombak Park N Ride', operator: 'Rapid KL', source: 'operator',
  status: 'confirmed', lat: 3.23, lon: 101.72, distance_m: 143, park_ride: true, train_user_rate_rm: 4.3, first_hour_rm: 3,
  next_hour_rm: 1, daily_max_rm: 15, is_free: false, monthly_train_user_rm: null, monthly_other_rm: null, capacity_car: 1260,
  source_url: 'https://myrapid.com.my/park-ride/', checked_date: '2026-10-25',
}
const osm: CarPark = { ...base, id: 2, source: 'osm', carpark_name: 'unnamed car park', park_ride: null, train_user_rate_rm: null,
  first_hour_rm: null, next_hour_rm: null, daily_max_rm: null, capacity_car: null }

describe('parking', () => {
  it('reads a point from hex EWKB (SRID 4326)', () => {
    // st_setsrid(st_makepoint(101.723582, 3.230816), 4326)::geography
    const p = pointFromEwkb('0101000020E61000005A7EE02A4F6E5940F6251B0FB6D80940')
    expect(p![0]).toBeCloseTo(101.723582, 5)
    expect(p![1]).toBeCloseTo(3.230816, 5)
    expect(pointFromEwkb(null)).toBeNull()
  })

  it('maps a rail stop to its parking station', () => {
    expect(parkingStationKey('rapid-rail-kl', 'KJ1')).toBe('rapid_rail_kl_kj1')
    expect(parkingStationKey('erl', 'SALAK_TINGGI')).toBe('erl_salak_tinggi')
    expect(parkingStationKey('rapid-rail-kl', 'NOPE')).toBeUndefined()
    expect(parkingStationKey(undefined, 'KJ1')).toBeUndefined()
  })

  it('never makes up a fare', () => {
    expect(hasFare(base)).toBe(true)
    expect(hasFare(osm)).toBe(false)
    expect(hasFare({ ...osm, is_free: true })).toBe(true)
    expect(parkAndRide([osm, base])).toBe(base)
    expect(parkAndRide([osm])).toBeUndefined()
    expect(carParksAt([base, { ...osm, station_key: 'x' }], 'rapid_rail_kl_kj1')).toEqual([base])
    expect(rm(4.3)).toBe('RM 4.30')
  })
})

describe('carParkName', () => {
  const t = (k: string) => ({ parkUnnamed: 'Car park', parkNearPlace: 'Dekat {place}', parkNearStation: 'Dekat stesen {station}' })[k]!
  it('keeps real names, translates the "near" names', () => {
    expect(carParkName('AEON Car Park', t)).toBe('AEON Car Park')
    expect(carParkName('Car park near Maluri station', t)).toBe('Dekat stesen Maluri')
    expect(carParkName('Car park near Wisma Cheras', t)).toBe('Dekat Wisma Cheras')
    expect(carParkName('unnamed car park', t)).toBe('Car park')
  })
})
