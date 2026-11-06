import { describe, expect, it, vi } from 'vitest'

vi.mock('../services/supabase', () => ({ supabase: {} }))

const { routeEnds } = await import('./busRoutes')
const { isRailCategory, stopIconKind } = await import('./stopIcon')
const { looksLikeRouteCode, mergePlaces, normaliseQuery } = await import('../hooks/useSmartSearch')

describe('routeEnds', () => {
  it.each([
    ['MRT Cochrane - Taman Shamelin', { from: 'MRT Cochrane', to: 'Taman Shamelin' }],
    ['Terminal Maluri ~ Lebuh Ampang', { from: 'Terminal Maluri', to: 'Lebuh Ampang' }],
    ['Pandan Perdana – KL Sentral', { from: 'Pandan Perdana', to: 'KL Sentral' }],
  ])('%s', (name, want) => expect(routeEnds(name)).toEqual(want))
  it('keeps hyphenated words whole', () => expect(routeEnds('Shah Alam-Klang')).toBeNull())
  it('null for empty input', () => {
    expect(routeEnds(null)).toBeNull()
    expect(routeEnds(undefined)).toBeNull()
  })
})

describe('stopIconKind', () => {
  it('rail stations always get a train', () => expect(stopIconKind('Hospital Kuala Lumpur', 'MRT Kajang Line')).toBe('train'))
  it('feeder buses and BRT are not rail', () => {
    expect(isRailCategory('MRT Feeder Bus')).toBe(false)
    expect(isRailCategory('BRT Sunway Line')).toBe(false)
    expect(isRailCategory('KTM Komuter')).toBe(true)
  })
  it.each([
    ['KL1234 Hospital Kajang', 'hospital'],
    ['SMK Taman Melawati', 'school'],
    ['Masjid Jamek', 'mosque'],
    ['Pavilion KL', 'mall'],
    ['Taman Connaught', 'home'],
    ['Menara KL', 'building'],
    ['KLIA Terminal 1', 'airport'],
    ['Jalan Ampang', 'bus'],
  ])('bus stop %s -> %s', (name, kind) => expect(stopIconKind(name, 'Rapid KL Bus')).toBe(kind))
})

describe('route code detection in search', () => {
  it.each(['T305', 't 305', 'kj 1', '300', 'SA02', 'T789a', 'T-352'])('%s looks like a route code', (q) => expect(looksLikeRouteCode(q)).toBe(true))
  it.each(['klcc', 'pasar seni', 'T30555', 'ab', 'kl sentral 2'])('%s does not', (q) => expect(looksLikeRouteCode(q)).toBe(false))
  it('normalises case and spacing', () => expect(normaliseQuery('  KL   Sentral ')).toBe('kl sentral'))
})

describe('places from our list and the geocoder, each once', () => {
  const p = (name: string, lat: number, lon: number, osm: string) => ({ name, detail: '', lat, lon, kind: 'place', osm })
  it('one building mapped twice, or found by both, is shown once (the first, better known)', () => {
    const out = mergePlaces([p('Sunway Pyramid', 3.0726, 101.6067, 'way/1'), p('Sunway Pyramid', 3.0729, 101.6069, 'node/2')], [p('Sunway Pyramid', 3.0727, 101.6066, 'W1')])
    expect(out.map((x) => x.osm)).toEqual(['way/1'])
  })
  it('branches of a chain further apart are all kept', () => {
    const out = mergePlaces([p('Starbucks', 3.1300, 101.6700, 'node/1'), p('Starbucks', 3.1315, 101.6700, 'node/2')], [p('Starbucks', 3.1700, 101.6500, 'N3')])
    expect(out).toHaveLength(3)
  })
  it('the same OpenStreetMap id is never shown twice', () => {
    expect(mergePlaces([p('KLCC Park', 3.155, 101.714, 'way/9')], [p('Taman KLCC', 3.156, 101.714, 'way/9')])).toHaveLength(1)
  })
})
