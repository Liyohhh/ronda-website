import { describe, expect, it } from 'vitest'
import { translations } from '../i18n/translations'
import { outOfReachMessage, type OutOfReach } from './outOfReach'

const tpl = translations.en.outOfReach
const near = (name: string, distance_m: number) => ({ name, stop_id: 'x', feed_id: 'f', distance_m })

describe('outOfReachMessage', () => {
  it('nothing to say without out_of_reach', () => {
    expect(outOfReachMessage(null, 'A', 'B', tpl)).toBeNull()
    expect(outOfReachMessage({ from: false, to: false, max_walk_m: 3000, nearest_from: null, nearest_to: null }, 'A', 'B', tpl)).toBeNull()
  })

  it('start out of reach', () => {
    const r: OutOfReach = { from: true, to: false, max_walk_m: 3000, nearest_from: near('MRT Kajang', 31600), nearest_to: null }
    expect(outOfReachMessage(r, 'Genting Highlands', 'KLCC', tpl))
      .toBe('Genting Highlands has no train or bus stop within 3.0 km. The nearest is MRT Kajang, 32 km away.')
  })

  it('both ends, short distances keep one decimal', () => {
    const r: OutOfReach = { from: true, to: true, max_walk_m: 3000, nearest_from: near('Stop A', 3400), nearest_to: near('Stop B', 52000) }
    const msg = outOfReachMessage(r, 'Here', 'There', tpl)!
    expect(msg).toContain('Here has no train or bus stop within 3.0 km. The nearest is Stop A, 3.4 km away.')
    expect(msg).toContain('There has no train or bus stop within 3.0 km. The nearest is Stop B, 52 km away.')
  })

  it('every language fills every placeholder', () => {
    const r: OutOfReach = { from: true, to: false, max_walk_m: 3000, nearest_from: near('S', 5000), nearest_to: null }
    for (const lang of Object.keys(translations) as (keyof typeof translations)[])
      expect(outOfReachMessage(r, 'P', 'Q', translations[lang].outOfReach)).not.toMatch(/\{\w+\}/)
  })
})
