import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import Captcha from './Captcha'
import { useLanguage } from '../hooks/useLanguage'
import type { TranslationKey } from '../i18n/translations'
import { MAX_CHARS, captchaSiteKey, hasSession, loadChat, saveChat, sendChat, signInGuest, type ChatCard, type ChatMsg, type ChatResult } from '../services/chat'

// Floating RONDA assistant (lazy-loaded by SiteLayout when VITE_AI_CHAT=on). Launcher at the bottom end corner
// (bottom-right, bottom-left in Arabic); a 380 x 560 window on larger screens, a full-screen sheet on phones.
// Hidden while a right-side panel is open (Home sets body[data-side-panel]).

const STARTERS: TranslationKey[] = ['chat_s1', 'chat_s2', 'chat_s3', 'chat_s4']
type Status = 'idle' | 'loading' | 'error' | 'captcha' | 'captcha_failed'

function CardView({ c }: { c: ChatCard }) {
  const { t } = useLanguage()
  const internal = c.link?.startsWith('/')
  const icon = c.kind === 'trip' ? 'route' : c.kind === 'hotel' ? 'apartment' : 'restaurant'
  return (
    <li className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 text-[#002472]" aria-hidden="true"><Icon name={icon} size={18} /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-900">{c.name}</p>
          <p className="text-xs text-gray-600">
            {[c.station, c.distance_m != null ? `${c.distance_m} m` : null, c.walk_min != null ? t('chat_walk').replace('{n}', String(c.walk_min)) : null].filter(Boolean).join(' · ')}
          </p>
          {c.price_estimate && (
            <p className="mt-1 text-xs text-gray-800">
              <span className="font-semibold">{t('chat_estimate')}: {c.price_estimate}</span>
              {c.price_source && <span className="text-gray-500"> · {c.price_source}</span>}
            </p>
          )}
          {c.link && (internal ? (
            <Link to={c.link} className="mt-1 inline-block text-xs font-semibold text-[#002472] underline">{c.kind === 'trip' ? t('chat_openPlan') : t('planTripHere')}</Link>
          ) : (
            <a href={c.link} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-block text-xs font-semibold text-[#002472] underline">{t('chat_openSite')}</a>
          ))}
        </div>
      </div>
    </li>
  )
}

function ChatWidget() {
  const { t, lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<ChatMsg[]>(loadChat)
  const [text, setText] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [notice, setNotice] = useState<string | null>(null)
  const [guest, setGuest] = useState(false)
  const pending = useRef<ChatMsg[] | null>(null)
  const launcherRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => { saveChat(msgs) }, [msgs])
  useEffect(() => { if (open) inputRef.current?.focus() }, [open])
  useEffect(() => { listRef.current?.scrollTo?.({ top: listRef.current.scrollHeight }) }, [msgs, status])

  const close = () => setOpen(false)
  // focus goes back to the launcher once the window has closed (the launcher is rendered again then)
  const wasOpen = useRef(false)
  useEffect(() => {
    if (open) wasOpen.current = true
    else if (wasOpen.current) launcherRef.current?.focus()
  }, [open])

  const explain = useCallback((r: Extract<ChatResult, { ok: false }>) => {
    if (r.error === 'rate_limited') return t(r.reason === 'day' ? 'chat_limitDay' : 'chat_limitHour') + (r.guest ? ` ${t('chat_guestMore')}` : '')
    if (r.error === 'busy') return t('chat_busy')
    if (r.error === 'too_long') return t('chat_tooLong').replace('{n}', String(MAX_CHARS))
    return t('chat_error')
  }, [t])

  const deliver = useCallback(async (history: ChatMsg[]) => {
    setStatus('loading')
    setNotice(null)
    const r = await sendChat(history, lang)
    if (r.ok) {
      setGuest(r.guest)
      setMsgs([...history, { role: 'assistant', content: r.reply, cards: r.cards }])
      setStatus('idle')
      return
    }
    if (r.error === 'auth') { pending.current = history; setStatus('captcha'); return }
    setNotice(explain(r))
    setStatus(r.error === 'failed' ? 'error' : 'idle')
  }, [lang, explain])

  const send = async (content: string) => {
    const c = content.trim()
    if (!c || status === 'loading' || c.length > MAX_CHARS) return
    const history: ChatMsg[] = [...msgs, { role: 'user', content: c }]
    setMsgs(history)
    setText('')
    if (!(await hasSession())) {
      // guests: a CAPTCHA, then an anonymous session (Supabase Auth)
      pending.current = history
      setStatus(captchaSiteKey() ? 'captcha' : 'captcha_failed')
      return
    }
    await deliver(history)
  }

  const onToken = useCallback(async (token: string) => {
    if (!(await signInGuest(token))) { setStatus('captcha_failed'); return }
    setGuest(true)
    if (pending.current) await deliver(pending.current)
  }, [deliver])
  const onCaptchaError = useCallback(() => setStatus('captcha_failed'), [])

  const retry = () => {
    const last = msgs[msgs.length - 1]
    if (last?.role === 'user') void deliver(msgs)
  }
  const newChat = () => { setMsgs([]); setNotice(null); setStatus('idle'); pending.current = null; inputRef.current?.focus() }
  const onSubmit = (e: FormEvent) => { e.preventDefault(); void send(text) }
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(text) }
  }

  return (
    <>
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-label={t('chat_open')}
          data-chat-launcher
          className="fixed bottom-4 end-4 z-40 flex items-center gap-2 rounded-full bg-[#002472] px-4 py-3 text-sm font-semibold text-white shadow-xl ring-2 ring-[#C9A45C] hover:bg-[#0a3391] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#002472] [body[data-side-panel]_&]:hidden"
        >
          <Icon name="chat" size={20} />
          <span className="hidden sm:inline">{t('chat_title')}</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby="chat-title"
          onKeyDown={(e) => e.key === 'Escape' && close()}
          className="fixed inset-0 z-50 flex flex-col bg-white sm:inset-auto sm:bottom-4 sm:end-4 sm:h-[560px] sm:max-h-[calc(100vh-2rem)] sm:w-[380px] sm:rounded-2xl sm:shadow-2xl sm:ring-1 sm:ring-black/10"
        >
          <header className="flex items-center gap-2 bg-[#002472] px-4 py-3 text-white sm:rounded-t-2xl">
            <h2 id="chat-title" className="font-semibold">{t('chat_title')}</h2>
            <span className="rounded bg-[#C9A45C] px-1.5 py-0.5 text-[10px] font-bold text-[#001233]">AI</span>
            <button type="button" onClick={newChat} className="ms-auto rounded-full px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/40 hover:bg-white/10">{t('chat_new')}</button>
            <button type="button" onClick={close} aria-label={t('chat_close')} className="rounded-full p-1 hover:bg-white/10"><Icon name="close" size={20} /></button>
          </header>

          <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3" aria-live="polite" aria-busy={status === 'loading'}>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">{t('chat_note')}</p>
            {msgs.length === 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-700">{t('chat_hello')}</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {STARTERS.map((k) => (
                    <li key={k}>
                      <button type="button" onClick={() => void send(t(k))} className="rounded-full border border-[#002472]/30 px-3 py-1.5 text-xs text-[#002472] hover:bg-[#002472]/5">{t(k)}</button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <ol className="mt-3 space-y-3">
              {msgs.map((m, i) => (
                <li key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                  <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-[#002472] text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <span className="sr-only">{m.role === 'user' ? t('chat_you') : t('chat_title')}: </span>
                    {m.content}
                  </div>
                  {m.cards && m.cards.length > 0 && <ul className="mt-2 space-y-2">{m.cards.map((c, j) => <CardView key={j} c={c} />)}</ul>}
                </li>
              ))}
            </ol>
            {status === 'loading' && <p className="mt-3 text-sm text-gray-500" role="status">{t('chat_thinking')}</p>}
            {status === 'captcha' && (
              <div className="mt-3 rounded-xl border border-gray-200 p-3">
                <p className="text-sm text-gray-700">{t('chat_captcha')}</p>
                <Captcha siteKey={captchaSiteKey()} lang={lang} onToken={onToken} onError={onCaptchaError} />
              </div>
            )}
            {status === 'captcha_failed' && (
              <p className="mt-3 text-sm text-red-700" role="alert">
                {t('chat_captchaFailed')} <Link to="/login" className="underline">{t('login')}</Link>
              </p>
            )}
            {notice && <p className="mt-3 text-sm text-red-700" role="alert">{notice}</p>}
            {status === 'error' && (
              <button type="button" onClick={retry} className="mt-2 rounded-full bg-[#002472] px-4 py-1.5 text-xs font-semibold text-white">{t('chat_retry')}</button>
            )}
            {guest && msgs.length > 0 && (
              <p className="mt-3 text-xs text-gray-600">{t('chat_guestHint')} <Link to="/login" className="font-semibold text-[#002472] underline">{t('login')}</Link></p>
            )}
          </div>

          <form onSubmit={onSubmit} className="border-t border-gray-200 p-3">
            <label htmlFor="chat-input" className="sr-only">{t('chat_placeholder')}</label>
            <div className="flex items-end gap-2">
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={2}
                value={text}
                maxLength={MAX_CHARS}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKey}
                placeholder={t('chat_placeholder')}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#002472]"
              />
              <button type="submit" disabled={!text.trim() || status === 'loading'} aria-label={t('chat_send')} className="h-11 w-11 flex-shrink-0 rounded-full bg-[#002472] text-white disabled:opacity-50 flex items-center justify-center">
                <Icon name="chevronRight" size={22} className="rtl:rotate-180" />
              </button>
            </div>
            <p className="mt-1 text-end text-[11px] text-gray-500">{text.length} / {MAX_CHARS}</p>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatWidget
