import { beforeEach, describe, expect, it } from 'vitest'
import type { PlaceResult, StopResult } from '../hooks/useSmartSearch'
import { MAX_PLACES, MAX_STOPS, buildItems, dedupeStops, loadRecent, matchRank, recentItems, rememberRecent } from './suggestions'

const stop = (stop_id: string, stop_name: string, category: string, lat = 3.1, lon = 101.7): StopResult =>
  ({ stop_id, stop_name, category, feed_id: category.startsWith('BUS') ? 'rapid-bus-kl' : 'rapid-rail-kl', stop_lat: lat, stop_lon: lon, route_ids: [] })
const place = (name: string, kind = 'mall'): PlaceResult => ({ name, detail: '', lat: 3.15, lon: 101.71, kind, osm: `way/${name}` })
const names = (items: ReturnType<typeof buildItems>) => items.map((i) => i.pick.name)

describe('matchRank', () => {
  it.each([
    ['MRT Maluri', 'maluri', null, 2],
    ['MRT Maluri', 'mrt maluri', null, 2],
    ['ERL KL Sentral', 'kl sentral', null, 2],
    ['LRT Pasar Seni', 'seni', null, 1],
    ['MRT Maluri', 'mrrt mluri', null, 0],
    ['MRT Maluri', 'mrrt mluri', 'mrt maluri', 2],
    ['Pavilion Kuala Lumpur', 'pavilion kl', 'pavilion kuala lumpur', 2],
  ])('%s for "%s" (fixed %s) = %d', (name, q, fixed, want) => expect(matchRank(name, q, fixed)).toBe(want))
})

describe('dedupeStops', () => {
  it('one row for the same bus stop name close together', () => {
    const out = dedupeStops([
      stop('1', 'MRT Maluri Pintu B', 'BUS T352', 3.1239, 101.7281),
      stop('2', 'MRT Maluri Pintu B', 'BUS T400', 3.1241, 101.7283),
      stop('3', 'MRT Maluri Pintu B', 'BUS T400', 3.2, 101.8), // same name far away: kept
    ])
    expect(out.map((s) => s.stop_id)).toEqual(['1', '3'])
  })
  it('never merges train stations', () => {
    expect(dedupeStops([stop('KG22', 'MRT Maluri', 'MRT Kajang Line'), stop('AG14', 'MRT Maluri', 'MRT Kajang Line')])).toHaveLength(2)
  })
})

describe('buildItems', () => {
  it('a typo still puts the right station first (fixed search)', () => {
    const items = buildItems([stop('1', 'MRT UPM', 'MRT Kajang Line'), stop('2', 'MRT Maluri', 'MRT Kajang Line')], [], [], 'mrrt mluri', 'mrt maluri')
    expect(names(items)[0]).toBe('MRT Maluri')
  })
  it('the mall comes before a bus stop that only looks alike', () => {
    const items = buildItems([stop('1', 'Pavilion Bukit Jalil', 'BUS T580')], [place('Pavilion Kuala Lumpur')], [], 'pavilion kl', 'pavilion kuala lumpur')
    expect(items.map((i) => i.type)).toEqual(['place', 'stop'])
  })
  it('on a tie a bus stop gives way to the place, a train station does not', () => {
    expect(buildItems([stop('1', 'Pavilion Bukit Jalil', 'BUS T580')], [place('Pavilion Kuala Lumpur')], [], 'pavilion')[0].type).toBe('place')
    expect(buildItems([stop('KJ10', 'LRT KLCC', 'LRT Kelana Jaya Line')], [place('KLCC Park', 'place')], [], 'klcc')[0].type).toBe('stop')
  })
  it('shows up to 10 stations and 8 places', () => {
    const stops = Array.from({ length: 20 }, (_, i) => stop(String(i), `Stop ${i}`, 'BUS 1', 3 + i, 101))
    const places = Array.from({ length: 12 }, (_, i) => place(`Place ${i}`))
    const items = buildItems(stops, places, [], 'xyz')
    expect(items.filter((i) => i.type === 'stop')).toHaveLength(MAX_STOPS)
    expect(items.filter((i) => i.type === 'place')).toHaveLength(MAX_PLACES)
  })
  it('a station code puts that station first, before stops whose names start with it', () => {
    const items = buildItems([
      stop('1', '(M) KJ154 Taman Sri Nanding', 'BUS T406'),
      stop('KJ15', 'LRT KL Sentral', 'LRT Kelana Jaya Line'),
      { ...stop('2', 'Taman Cuepacs (Utara)', 'BUS T411'), stop_code: 'KJ15' },
    ], [], [], 'kj15')
    expect(names(items).slice(0, 2)).toEqual(['LRT KL Sentral', 'Taman Cuepacs (Utara)'])
    expect(names(buildItems([stop('1', 'Kg Cheras', 'BUS T305'), stop('KG22', 'MRT Maluri', 'MRT Kajang Line')], [], [], 'KG 22'))[0]).toBe('MRT Maluri')
  })
  it('a place found by another name ranks on that name ("kl tower" finds Menara Kuala Lumpur)', () => {
    const tower = { ...place('Menara Kuala Lumpur', 'place'), matched: 'kl tower' }
    const items = buildItems([stop('1', 'Menara KL', 'BUS 400')], [place('KL Tower Mini Zoo', 'place'), tower], [], 'kl tower', 'menara kl')
    expect(names(items).slice(0, 2)).toEqual(['KL Tower Mini Zoo', 'Menara Kuala Lumpur'])
    // the database's order (better known first) decides between two equally good names
    const dbOrder = buildItems([stop('1', 'Menara KL', 'BUS 400')], [tower, place('KL Tower Mini Zoo', 'place')], [], 'kl tower', 'menara kl')
    expect(names(dbOrder)[0]).toBe('Menara Kuala Lumpur')
  })
  it('each station, stop and place says which one it is, so a pick can be counted', () => {
    const items = buildItems([stop('KJ15', 'LRT KL Sentral', 'LRT Kelana Jaya Line')],
      [{ ...place('Pavilion Kuala Lumpur'), osm: 'way/28271276' }, { ...place('Jalan Ampang', 'place'), osm: 'W7' }], [], 'x')
    expect(items.map((i) => i.pick.ref)).toEqual(['stop:rapid-rail-kl:KJ15', 'place:way/28271276', 'place:way/7'])
  })
  it('a type of place near you lists the nearest places first, in the database order, before a station named after it', () => {
    const near = (name: string, d: number) => ({ ...place(name, 'mosque'), osm: `node/${d}`, matched: 'masjid', distance_m: d })
    const items = buildItems([stop('KJ13', 'LRT Masjid Jamek', 'LRT Kelana Jaya Line')], [near('Surau Tarbiah', 670), near('Masjid Al-Imam Ash-Shafie', 1100)], [], 'masjid')
    expect(names(items)).toEqual(['Surau Tarbiah', 'Masjid Al-Imam Ash-Shafie', 'LRT Masjid Jamek'])
  })
  it('a route code lists its stops first, in order', () => {
    const r = { ...stop('9', 'Terminal Maluri', 'BUS T352'), route_code: 'T352', stop_sequence: 1 }
    const items = buildItems([stop('2', 'MRT Maluri', 'MRT Kajang Line')], [], [r], 't352')
    expect(items[0].key).toBe('r:rapid-bus-kl:T352:1')
  })
})

describe('recent picks', () => {
  beforeEach(() => localStorage.clear())
  it('newest first, no repeats, at most 6', () => {
    for (let i = 0; i < 8; i++) rememberRecent({ name: `P${i}`, lat: 3 + i, lon: 101 })
    rememberRecent({ name: 'P5', lat: 8, lon: 101 })
    const list = loadRecent()
    expect(list.map((p) => p.name)).toEqual(['P5', 'P7', 'P6', 'P4', 'P3', 'P2'])
    expect(recentItems()[0]).toMatchObject({ type: 'recent', pick: { name: 'P5' } })
  })
  it('bad stored data is ignored', () => {
    localStorage.setItem('ronda.recent', '{not json')
    expect(loadRecent()).toEqual([])
    localStorage.setItem('ronda.recent', JSON.stringify([{ name: 'ok', lat: 1, lon: 2 }, { name: 3 }]))
    expect(loadRecent()).toEqual([{ name: 'ok', lat: 1, lon: 2 }])
  })
})
