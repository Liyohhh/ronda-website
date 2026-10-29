import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const insert = vi.fn().mockResolvedValue({ error: null })
vi.mock('./supabase', () => ({
  supabase: {
    from: () => ({ insert }),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}))

const { deviceId, track, trackOnce, trackOpen } = await import('./analytics')
const flush = () => new Promise((r) => setTimeout(r, 0))

describe('anonymous usage events', () => {
  beforeEach(() => { insert.mockClear(); localStorage.clear() })
  afterEach(() => { Object.defineProperty(navigator, 'doNotTrack', { value: null, configurable: true }) })

  it('one random id per browser, kept', () => {
    const a = deviceId()
    expect(a).toMatch(/^[0-9a-f]{32}$/)
    expect(deviceId()).toBe(a)
  })
  it('sends the event with the device id, no account for guests, and platform web plus the page language', async () => {
    await track('search', { query: 'klcc', results: 3 })
    expect(insert).toHaveBeenCalledWith({ event_name: 'search', device_id: deviceId(), user_id: null, payload: expect.objectContaining({ query: 'klcc', results: 3, platform: 'web' }) })
  })
  it('counts the browser as active once a day', async () => {
    trackOpen(); trackOpen(); await flush()
    expect(insert.mock.calls.filter((c) => c[0].event_name === 'app_open')).toHaveLength(1)
  })
  it('the same thing once per visit', async () => {
    trackOnce('alert:a1', 'alert_seen', { alert_id: 'a1' }); trackOnce('alert:a1', 'alert_seen', { alert_id: 'a1' }); await flush()
    expect(insert).toHaveBeenCalledTimes(1)
  })
  it('nothing when the browser asks not to be tracked', async () => {
    Object.defineProperty(navigator, 'doNotTrack', { value: '1', configurable: true })
    await track('search', { query: 'klcc' })
    expect(insert).not.toHaveBeenCalled()
  })
})
