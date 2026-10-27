import { beforeEach, describe, expect, it, vi } from 'vitest'

// a tiny stand-in for supabase.from('service_alerts'): records the calls, answers with `result`
let result: { data: unknown; error: { message: string } | null } = { data: [], error: null }
const calls: { op: string; args: unknown[] }[] = []
const chain = (): Record<string, unknown> => {
  const c: Record<string, unknown> = {}
  for (const op of ['select', 'eq', 'order', 'update', 'insert']) c[op] = (...args: unknown[]) => { calls.push({ op, args }); return c }
  c.then = (ok: (v: unknown) => unknown, bad: (e: unknown) => unknown) => Promise.resolve(result).then(ok, bad)
  return c
}
vi.mock('./supabase', () => ({ supabase: { from: (t: string) => { calls.push({ op: 'from', args: [t] }); return chain() } } }))

const { alertBody, alertTitle, clearAlertCache, loadLiveAlerts, saveAlert, setAlertStatus } = await import('./serviceAlerts')

const ALERT = {
  id: 'a1', source: 'myrapid', source_url: 'https://myrapid.com.my/x', effect: 'modified' as const,
  title_en: 'Ampang Line: change at Chan Sow Lin', title_ms: 'Laluan Ampang: tukar di Chan Sow Lin', title_zh: null, title_ar: null,
  body_en: 'Trains from Ampang turn back at Chan Sow Lin.', body_ms: null, body_zh: null, body_ar: null,
  line_ids: ['lrt-ampang'], station_names: ['Chan Sow Lin'], planner_rule: null,
  starts_at: '2026-10-23T08:00:00Z', ends_at: null, status: 'published' as const, published_at: '2026-10-23T08:45:00Z',
}

describe('service alerts', () => {
  beforeEach(() => { calls.length = 0; clearAlertCache(); result = { data: [], error: null } })

  it('uses the reader language, else English', () => {
    expect(alertTitle(ALERT, 'ms')).toBe('Laluan Ampang: tukar di Chan Sow Lin')
    expect(alertTitle(ALERT, 'zh')).toBe('Ampang Line: change at Chan Sow Lin')
    expect(alertBody(ALERT, 'ms')).toBe('Trains from Ampang turn back at Chan Sow Lin.')
  })

  it('loads published alerts once per minute and drops ones that have ended', async () => {
    result = { data: [ALERT, { ...ALERT, id: 'a2', ends_at: '2020-01-01T00:00:00Z' }], error: null }
    const [a, b] = await Promise.all([loadLiveAlerts(), loadLiveAlerts()])
    expect(a.map((x) => x.id)).toEqual(['a1'])
    expect(b).toBe(a)
    expect(calls.filter((c) => c.op === 'from')).toHaveLength(1)
    expect(calls).toContainEqual({ op: 'eq', args: ['status', 'published'] })
  })

  it('a failed load is not kept, so the next page tries again', async () => {
    result = { data: null, error: { message: 'down' } }
    await expect(loadLiveAlerts()).rejects.toThrow('down')
    result = { data: [ALERT], error: null }
    expect(await loadLiveAlerts()).toHaveLength(1)
  })

  it('saves only the editable columns, and ending an alert stamps its end time', async () => {
    await saveAlert({ ...ALERT, title_en: 'New' } as never, 'a1')
    const update = calls.find((c) => c.op === 'update')!.args[0] as Record<string, unknown>
    expect(update.title_en).toBe('New')
    expect(update).not.toHaveProperty('id')
    expect(update).not.toHaveProperty('published_at')
    calls.length = 0
    await setAlertStatus('a1', 'ended')
    const end = calls.find((c) => c.op === 'update')!.args[0] as Record<string, unknown>
    expect(end.status).toBe('ended')
    expect(typeof end.ends_at).toBe('string')
  })
})
