import { describe, expect, it, vi } from 'vitest'

vi.mock('../services/supabase', () => ({ supabase: {} }))

const { routeEnds } = await import('./busRoutes')
const { isRailCategory, stopIconKind } = await import('./stopIcon')
const { looksLikeRouteCode, normaliseQuery } = await import('../hooks/useSmartSearch')

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
