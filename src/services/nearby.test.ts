import { describe, expect, it } from 'vitest'
import { splitNearby, type NearStop } from './nearby'

const s = (name: string, is_rail: boolean, d: number, routes: string[] | null = null): NearStop => ({ feed_id: 'f', stop_id: name + d, name, lat: 3, lon: 101,
  is_rail, distance_m: d, route_ids: ['X'], code: null, routes })

describe('near you', () => {
  it('splits trains and buses, nearest first, a few of each', () => {
    const { trains, buses } = splitNearby([s('MRT A', true, 100), s('Stop 1', false, 120, ['400']), s('LRT B', true, 300), s('Stop 2', false, 310, ['420'])], 4)
    expect(trains.map((x) => x.name)).toEqual(['MRT A', 'LRT B'])
    expect(buses.map((x) => x.name)).toEqual(['Stop 1', 'Stop 2'])
  })
  it('shows a bus stop pair across the road once (same name and routes)', () => {
    const { buses } = splitNearby([s('Wisma', false, 50, ['400']), s('Wisma', false, 80, ['400']), s('Wisma', false, 90, ['999'])])
    expect(buses.map((x) => x.distance_m)).toEqual([50, 90])
  })
})
