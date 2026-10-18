import { describe, expect, it } from 'vitest'
import { hasMap, midpoint, type TrailRoute } from './trailRoute'

const st = { name: 'LRT X', lineIds: [], lat: 3.1, lon: 101.7 }

describe('trail route helpers', () => {
  it('a map needs both stations, every stop placed, and one leg more than the stops', () => {
    const r: TrailRoute = { start: st, end: st, stops: [{ placeId: 'a', lat: 3.1, lon: 101.7 }], legs: [
      { seq: 0, meters: 100, minutes: 1, path: [[101.7, 3.1], [101.71, 3.1]] },
      { seq: 1, meters: 100, minutes: 1, path: [[101.71, 3.1], [101.72, 3.1]] },
    ] }
    expect(hasMap(r)).toBe(true)
    expect(hasMap({ ...r, legs: r.legs.slice(0, 1) })).toBe(false)
    expect(hasMap({ ...r, stops: [{ placeId: 'a', lat: null, lon: null }] })).toBe(false)
    expect(hasMap({ ...r, start: null })).toBe(false)
  })

  it('the badge goes halfway along the walk, by distance', () => {
    const [x, y] = midpoint([[0, 0], [1, 0], [3, 0]])
    expect(x).toBeCloseTo(1.5)
    expect(y).toBe(0)
    expect(midpoint([[5, 5]])).toEqual([5, 5])
  })
})
