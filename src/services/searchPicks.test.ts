import { beforeEach, describe, expect, it, vi } from 'vitest'

const rpc = vi.fn(() => Promise.resolve({ data: null, error: null }))
vi.mock('./supabase', () => ({ supabase: { rpc: (...a: unknown[]) => rpc(...(a as [])) } }))

describe('search picks', () => {
  beforeEach(() => {
    vi.resetModules()
    rpc.mockClear()
    Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true })
  })

  it('turns OpenStreetMap ids into place refs', async () => {
    const { placeRef } = await import('./searchPicks')
    expect(placeRef('way/28271276')).toBe('place:way/28271276')
    expect(placeRef('W28271276')).toBe('place:way/28271276')
    expect(placeRef('N5')).toBe('place:node/5')
    expect(placeRef('R12')).toBe('place:relation/12')
    expect(placeRef('Pavilion:3.1:101.7')).toBeUndefined()
    expect(placeRef(undefined)).toBeUndefined()
  })

  it('sends a pick once per page visit, and nothing without a ref', async () => {
    const { recordPick } = await import('./searchPicks')
    recordPick('stop:rapid-rail-kl:KJ15')
    recordPick('stop:rapid-rail-kl:KJ15')
    recordPick(undefined)
    expect(rpc).toHaveBeenCalledTimes(1)
    expect(rpc).toHaveBeenCalledWith('record_search_pick', { p_item: 'stop:rapid-rail-kl:KJ15' })
  })

  it('sends nothing when the browser asks not to be tracked', async () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true })
    const { recordPick } = await import('./searchPicks')
    recordPick('place:way/28271276')
    expect(rpc).not.toHaveBeenCalled()
  })
})
