// RONDA assistant: talks to the ai-chat Edge Function. Guests get a Supabase anonymous session (with a CAPTCHA);
// signed-in users use their own session. The conversation stays in this browser tab (sessionStorage).
import type { Lang } from '../i18n/translations'
import { supabase } from './supabase'

export type ChatMsg = { role: 'user' | 'assistant'; content: string; cards?: ChatCard[] }
export type ChatCard = {
  kind: 'hotel' | 'restaurant' | 'trip'
  name: string
  distance_m: number | null
  walk_min: number | null
  station: string | null
  price_estimate?: string
  price_source?: string
  link?: string
}
export type ChatResult =
  | { ok: true; reply: string; cards: ChatCard[]; guest: boolean }
  | { ok: false; error: 'rate_limited' | 'busy' | 'too_long' | 'auth' | 'failed'; reason?: string; guest?: boolean }

export const CHAT_ENABLED = import.meta.env.VITE_AI_CHAT === 'on'
// Cloudflare Turnstile site key (the same CAPTCHA as in Supabase Auth); empty = guest chat not set up
export const captchaSiteKey = () => (import.meta.env.VITE_CAPTCHA_SITE_KEY as string | undefined) ?? ''
export const MAX_CHARS = 1000
const KEY = 'ronda.chat'

export function loadChat(): ChatMsg[] {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? '[]')
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}
export function saveChat(msgs: ChatMsg[]) {
  try { sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-20))) } catch { /* private mode: keep in memory only */ }
}

export async function hasSession() {
  const { data } = await supabase.auth.getSession()
  return !!data.session
}

// guest: anonymous sign-in, CAPTCHA token from the widget
export async function signInGuest(captchaToken: string) {
  const { error } = await supabase.auth.signInAnonymously({ options: { captchaToken } })
  return !error
}

export async function sendChat(history: ChatMsg[], lang: Lang): Promise<ChatResult> {
  const messages = history.slice(-8).map(({ role, content }) => ({ role, content }))
  const { data, error } = await supabase.functions.invoke('ai-chat', { body: { messages, lang } })
  if (!error && data && typeof data.reply === 'string') return { ok: true, reply: data.reply, cards: Array.isArray(data.cards) ? data.cards : [], guest: !!data.guest }
  const res = (error as { context?: Response } | null)?.context
  const status = res?.status ?? 0
  let body: { error?: string; reason?: string; guest?: boolean } = {}
  try { body = res ? await res.clone().json() : {} } catch { /* not json */ }
  if (status === 429) return { ok: false, error: 'rate_limited', reason: body.reason, guest: body.guest }
  if (status === 503) return { ok: false, error: 'busy' }
  if (status === 401) return { ok: false, error: 'auth' }
  if (status === 400 && body.error === 'too_long') return { ok: false, error: 'too_long' }
  return { ok: false, error: 'failed' }
}
