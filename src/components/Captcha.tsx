import { useEffect, useRef } from 'react'

// Cloudflare Turnstile (the CAPTCHA set in Supabase Auth -> Attack Protection). Loaded only when a guest starts a chat.
type Turnstile = { render: (el: HTMLElement, o: Record<string, unknown>) => string; remove: (id: string) => void }
declare global {
  interface Window { turnstile?: Turnstile }
}
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function loadScript(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('no turnstile')))
    s.onerror = () => reject(new Error('turnstile failed to load'))
    document.head.appendChild(s)
  })
}

function Captcha({ siteKey, lang, onToken, onError }: { siteKey: string; lang: string; onToken: (t: string) => void; onError: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let id: string | null = null
    let live = true
    loadScript()
      .then((ts) => {
        if (!live || !ref.current) return
        id = ts.render(ref.current, { sitekey: siteKey, language: lang, callback: onToken, 'error-callback': onError, 'expired-callback': onError })
      })
      .catch(() => live && onError())
    return () => {
      live = false
      if (id && window.turnstile) window.turnstile.remove(id)
    }
  }, [siteKey, lang, onToken, onError])
  return <div ref={ref} className="min-h-[65px]" />
}

export default Captcha
