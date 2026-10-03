import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn()
vi.mock('./supabase', () => ({ supabase: { rpc: (...a: unknown[]) => rpc(...a) } }))

const { loadTrails, resetTrailsCache } = await import('./trails')
const { findTrail, firstStation } = await import('../data/trails')

const ROW = {
  trails: [{ slug: 'nature', key: 'nature', category: 'nature', stops: [{ placeId: 'frim' }, { placeId: 'batuCaves' }] }],
  places: [
    { id: 'frim', name: 'FRIM', todo: 'Nearest station not confirmed' },
    { id: 'batuCaves', name: 'Batu Caves', station: { name: 'KTM Batu Caves', search: 'KTM Batu Caves', lineIds: ['ktm-seremban'], feedId: 'ktmb', stopId: '50600' } },
  ],
}

describe('loadTrails (public.trails_data)', () => {
  beforeEach(() => { rpc.mockReset(); resetTrailsCache() })

  it('turns the places list into a lookup and keeps trail order', async () => {
    rpc.mockResolvedValue({ data: ROW, error: null })
    const d = await loadTrails()
    expect(rpc).toHaveBeenCalledWith('trails_data')
    expect(d.trails.map((t) => t.slug)).toEqual(['nature'])
    expect(d.places.batuCaves.station?.stopId).toBe('50600')
    expect(findTrail(d, 'nature')?.key).toBe('nature')
    expect(findTrail(d, 'nope')).toBeUndefined()
  })

  it('first known station skips places without one', async () => {
    rpc.mockResolvedValue({ data: ROW, error: null })
    const d = await loadTrails()
    expect(firstStation(d.trails[0], d.places)?.name).toBe('KTM Batu Caves')
  })

  it('one request per visit', async () => {
    rpc.mockResolvedValue({ data: ROW, error: null })
    await Promise.all([loadTrails(), loadTrails()])
    expect(rpc).toHaveBeenCalledTimes(1)
  })

  it('a failed load is retried next time', async () => {
    rpc.mockResolvedValueOnce({ data: null, error: { message: 'down' } })
    await expect(loadTrails()).rejects.toThrow('down')
    rpc.mockResolvedValueOnce({ data: ROW, error: null })
    await expect(loadTrails()).resolves.toBeTruthy()
  })
})
