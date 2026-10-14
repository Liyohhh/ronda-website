import { describe, expect, it } from 'vitest'
import { distanceText, walkable } from './nearby'

describe('near you line', () => {
  it('writes distances in m or km', () => {
    expect(distanceText(406)).toBe('406 m')
    expect(distanceText(1642)).toBe('1.6 km')
    expect(distanceText(26120)).toBe('26 km')
  })
  it('gives walking minutes only up to 2 km', () => {
    expect(walkable(1642)).toBe(true)
    expect(walkable(26120)).toBe(false)
  })
})
