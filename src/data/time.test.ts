import { afterEach, describe, expect, it, vi } from 'vitest'
import { format12h, from12h, malaysiaNow, to12h } from './time'

describe('malaysiaNow', () => {
  afterEach(() => vi.useRealTimers())

  it('is UTC+8 with no daylight saving', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-02T15:30:00Z'))
    expect(malaysiaNow()).toEqual({ date: '2026-10-02', time: '23:30' })
  })

  it('rolls over to the next day after 16:00 UTC', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-31T16:05:00Z'))
    expect(malaysiaNow()).toEqual({ date: '2027-01-01', time: '00:05' })
  })
})

describe('12-hour clock', () => {
  it.each([
    ['00:00', { h: '12', m: '00', ap: 'AM' }],
    ['00:30', { h: '12', m: '30', ap: 'AM' }],
    ['09:05', { h: '9', m: '05', ap: 'AM' }],
    ['12:00', { h: '12', m: '00', ap: 'PM' }],
    ['14:05', { h: '2', m: '05', ap: 'PM' }],
    ['23:59', { h: '11', m: '59', ap: 'PM' }],
  ])('to12h(%s)', (t, want) => expect(to12h(t)).toEqual(want))

  it('round-trips every minute of the day', () => {
    for (let min = 0; min < 24 * 60; min++) {
      const t = `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
      const { h, m, ap } = to12h(t)
      expect(from12h(h, m, ap)).toBe(t)
    }
  })

  it('formats for display', () => {
    expect(format12h('14:05')).toBe('2:05 PM')
    expect(format12h('00:15')).toBe('12:15 AM')
  })
})
