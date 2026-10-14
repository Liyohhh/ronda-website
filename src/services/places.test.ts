import { describe, expect, it } from 'vitest'
import { placeName, planToPoint, walkMinutes, type NearPlace } from './places'

const p = (over: Partial<NearPlace> = {}): NearPlace => ({ osm_id: 'node/1', kind: 'restaurant', subkind: 'cafe', name: 'Kedai Kopi', name_en: null,
  name_ms: null, name_zh: null, name_ar: null, lat: 3.1, lon: 101.7, opening_hours: null, distance_m: 100, ...over })

describe('places near a station', () => {
  it('uses the name mapped in the reader language, else the own name', () => {
    expect(placeName(p({ name_zh: '咖啡店' }), 'zh')).toBe('咖啡店')
    expect(placeName(p({ name_zh: '咖啡店' }), 'ar')).toBe('Kedai Kopi')
  })
  it('turns straight-line metres into walking minutes like the planner (at least 1)', () => {
    expect(walkMinutes(10)).toBe(1)
    expect(walkMinutes(300)).toBe(5)
  })
  it('plans to the place itself', () => {
    expect(planToPoint({ lat: 3.1, lon: 101.7 }, 'Kedai & Co')).toBe('/?toLat=3.1&toLon=101.7&toName=Kedai%20%26%20Co')
  })
})
