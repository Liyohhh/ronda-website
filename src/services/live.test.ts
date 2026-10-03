import { beforeEach, describe, expect, it, vi } from 'vitest'

const invoke = vi.fn()
vi.mock('./supabase', () => ({ supabase: { functions: { invoke: (...a: unknown[]) => invoke(...a) } } }))

const { ago, approachingBuses, kmText, lateMinutes, textOn, liveVehicles, routeKey, stopArrivals } = await import('./live')

describe('routeKey (same rule as the database route_code_key)', () => {
  it.each([
    ['190', '190'],
    ['T 808', 'T808'],
    ['t0808', 'T808'],
    ['T-352', 'T352'],
    ['SA02', 'SA2'],
  ])('%s -> %s', (input, want) => expect(routeKey(input)).toBe(want))
})

describe('ago', () => {
  const t = (k: 'liveSecsAgo' | 'liveMinAgo') => (k === 'liveSecsAgo' ? '{n} s ago' : '{n} min ago')
  const now = Date.parse('2026-10-02T10:00:00Z')
  it('seconds under a minute', () => expect(ago('2026-10-02T09:59:48Z', t, now)).toBe('12 s ago'))
  it('minutes from 60 s', () => expect(ago('2026-10-02T09:57:00Z', t, now)).toBe('3 min ago'))
  it('never negative (clock skew)', () => expect(ago('2026-10-02T10:00:05Z', t, now)).toBe('0 s ago'))
})

describe('lateMinutes (KTMB trains)', () => {
  it.each([
    [null, null],
    [-300, 0],
    [0, 0],
    [179, 0],
    [180, 3],
    [460, 8],
  ])('%s s -> %s', (secs, want) => expect(lateMinutes(secs)).toBe(want))
})

describe('textOn (marker text colour)', () => {
  it('dark on KTM ETS yellow', () => expect(textOn('#FFC72C')).toBe('#111827'))
  it('white on KTM Komuter red and navy', () => { expect(textOn('#DC2420')).toBe('#fff'); expect(textOn('#002472')).toBe('#fff') })
  it('white when not a colour', () => expect(textOn('nope')).toBe('#fff'))
})

describe('kmText', () => {
  it.each([
    [0, '0 m'],
    [44, '40 m'],
    [995, '1000 m'],
    [1000, '1.0 km'],
    [2345, '2.3 km'],
  ])('%s m -> %s', (m, want) => expect(kmText(m)).toBe(want))
})

describe('live Edge Function calls', () => {
  beforeEach(() => invoke.mockReset())

  it('vehicles sends the bbox only when given', async () => {
    invoke.mockResolvedValue({ data: { vehicles: [], sources: [] }, error: null })
    await liveVehicles()
    expect(invoke).toHaveBeenLastCalledWith('live', { body: { action: 'vehicles' } })
    await liveVehicles([3, 101, 3.2, 101.8])
    expect(invoke).toHaveBeenLastCalledWith('live', { body: { action: 'vehicles', bbox: [3, 101, 3.2, 101.8] } })
  })

  it('approaching and arrivals pass the ids through', async () => {
    invoke.mockResolvedValue({ data: { buses: [], arrivals: [], supported: true }, error: null })
    await approachingBuses({ feed_id: 'rapid-bus-kl', route_id: 'T352', stop_id: '1', next_stop_id: '2' })
    expect(invoke).toHaveBeenLastCalledWith('live', { body: { action: 'approaching', feed_id: 'rapid-bus-kl', route_id: 'T352', stop_id: '1', next_stop_id: '2' } })
    await stopArrivals('rapid-bus-kl', '1')
    expect(invoke).toHaveBeenLastCalledWith('live', { body: { action: 'arrivals', feed_id: 'rapid-bus-kl', stop_id: '1' } })
  })

  it('throws on a transport error or an error body', async () => {
    invoke.mockResolvedValueOnce({ data: null, error: { message: 'network down' } })
    await expect(liveVehicles()).rejects.toThrow('network down')
    invoke.mockResolvedValueOnce({ data: { error: 'too many requests' }, error: null })
    await expect(liveVehicles()).rejects.toThrow('too many requests')
  })
})
