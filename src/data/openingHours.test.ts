import { describe, expect, it } from 'vitest'
import { describeHours, hoursStatus, malaysiaNow, parseHours } from './openingHours'

const at = (day: number, hm: string) => ({ day, minute: Number(hm.slice(0, 2)) * 60 + Number(hm.slice(3)) })

describe('opening hours (OpenStreetMap forms used by trail stops)', () => {
  it('reads the forms in the data', () => {
    expect(parseHours('Mo-Su 10:00-22:00')).toEqual([{ days: [0, 1, 2, 3, 4, 5, 6], open: 600, close: 1320 }])
    expect(parseHours('07:00-22:00')?.[0].days).toHaveLength(7)
    expect(parseHours('PH,Mo-Su 10:00-22:00')?.[0].days).toHaveLength(7)
    expect(parseHours('Mo-Th 19:00-23:00; Fr,Sa 18:30-24:00')).toEqual([
      { days: [0, 1, 2, 3], open: 1140, close: 1380 },
      { days: [4, 5], open: 1110, close: 1440 },
    ])
    expect(parseHours('Mo-Su 16:00-02:00')?.[0].close).toBe(1560)
  })

  it('gives up on forms it does not know (the page shows the text instead)', () => {
    expect(parseHours('sunrise-sunset')).toBeNull()
    expect(parseHours('Mo-Fr 09:00-12:00,14:00-18:00')).toBeNull()
    expect(parseHours('Xx 10:00-12:00')).toBeNull()
  })

  it('open now with closing time, closed with next opening', () => {
    const mall = parseHours('Mo-Su 10:00-22:00')!
    expect(hoursStatus(mall, at(2, '12:00'))).toEqual({ open: true, closes: 1320 })
    expect(hoursStatus(mall, at(2, '08:00'))).toEqual({ open: false, opens: 600 })
    expect(hoursStatus(mall, at(2, '23:00'))).toEqual({ open: false, opens: 600 })
    const gallery = parseHours('Mo-Fr 09:00-19:00')!
    expect(hoursStatus(gallery, at(5, '12:00'))).toEqual({ open: false, opens: 540 }) // Saturday: opens Monday 09:00
  })

  it('late sessions past midnight count as open the next morning', () => {
    const alor = parseHours('Mo-Su 16:00-02:00')!
    expect(hoursStatus(alor, at(3, '01:30'))).toEqual({ open: true, closes: 120 })
    expect(hoursStatus(alor, at(3, '03:00'))).toEqual({ open: false, opens: 960 })
    const bar = parseHours('Mo-Th 19:00-23:00; Fr,Sa 18:30-24:00')!
    expect(hoursStatus(bar, at(5, '23:30'))).toEqual({ open: true, closes: 0 })
  })

  it('describes the hours with weekday names in the page language', () => {
    expect(describeHours(parseHours('Mo-Su 10:00-22:00')!, 'en')).toBe('Mon–Sun 10:00–22:00')
    expect(describeHours(parseHours('Mo-Th 19:00-23:00; Fr,Sa 18:30-24:00')!, 'en')).toBe('Mon–Thu 19:00–23:00; Fri, Sat 18:30–24:00')
  })

  it('reads the clock in Malaysia time', () => {
    // 2026-10-09 04:30 UTC = Friday 12:30 in Kuala Lumpur
    expect(malaysiaNow(new Date('2026-10-09T04:30:00Z'))).toEqual({ day: 4, minute: 750 })
  })
})
