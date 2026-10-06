import { beforeEach, describe, expect, it, vi } from 'vitest'

const sb = vi.hoisted(() => ({ invoke: vi.fn(), getSession: vi.fn(), signInAnonymously: vi.fn() }))
vi.mock('./supabase', () => ({ supabase: { functions: { invoke: sb.invoke }, auth: { getSession: sb.getSession, signInAnonymously: sb.signInAnonymously } } }))
const chat = await import('./chat')
import type { ChatMsg, ChatResult } from './chat'

// what supabase-js gives back for a non-2xx answer: error.context is the Response
const httpError = (status: number, body: unknown) => ({ data: null, error: { context: new Response(JSON.stringify(body), { status }) } })

describe('chat service', () => {
  beforeEach(() => { sb.invoke.mockReset(); sessionStorage.clear() })

  it('sends only role and content of the newest 8 messages, with the language', async () => {
    sb.invoke.mockResolvedValue({ data: { reply: 'ok', cards: [], guest: false }, error: null })
    const history = Array.from({ length: 11 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}`, cards: [] }) as ChatMsg)
    const r = await chat.sendChat(history, 'zh')
    expect(r).toEqual({ ok: true, reply: 'ok', cards: [], guest: false })
    const body = sb.invoke.mock.calls[0][1].body
    expect(body.lang).toBe('zh')
    expect(body.messages).toHaveLength(8)
    expect(body.messages[0]).toEqual({ role: 'assistant', content: 'm3' }) // no cards sent back; the function trims to a user turn
  })

  it('maps the function errors', async () => {
    const cases: [number, unknown, Partial<ChatResult>][] = [
      [429, { error: 'rate_limited', reason: 'day', guest: true }, { ok: false, error: 'rate_limited', reason: 'day', guest: true }],
      [503, { error: 'busy' }, { ok: false, error: 'busy' }],
      [401, { error: 'sign in first' }, { ok: false, error: 'auth' }],
      [400, { error: 'too_long' }, { ok: false, error: 'too_long' }],
      [502, { error: 'failed' }, { ok: false, error: 'failed' }],
    ]
    for (const [status, body, want] of cases) {
      sb.invoke.mockResolvedValueOnce(httpError(status, body))
      expect(await chat.sendChat([{ role: 'user', content: 'x' }], 'en')).toMatchObject(want)
    }
  })

  it('keeps the conversation in this tab only, and survives bad stored data', () => {
    chat.saveChat([{ role: 'user', content: 'hi' }])
    expect(chat.loadChat()).toEqual([{ role: 'user', content: 'hi' }])
    sessionStorage.setItem('ronda.chat', '{broken')
    expect(chat.loadChat()).toEqual([])
  })

  it('guest sign-in passes the CAPTCHA token to Supabase', async () => {
    sb.signInAnonymously.mockResolvedValue({ error: null })
    expect(await chat.signInGuest('tok')).toBe(true)
    expect(sb.signInAnonymously).toHaveBeenCalledWith({ options: { captchaToken: 'tok' } })
    sb.getSession.mockResolvedValue({ data: { session: null } })
    expect(await chat.hasSession()).toBe(false)
  })
})
