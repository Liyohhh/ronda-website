import { useCallback, useState } from 'react'
import Captcha from './Captcha'
import { captchaSiteKey } from '../services/chat'
import { useLanguage } from '../hooks/useLanguage'

// Bot check for the sign-up / sign-in / reset forms. Only when a Turnstile site key is set; without one the
// forms work as before. A token works once, so call reset() after every request that used it.
export function useAuthCaptcha() {
  const { lang } = useLanguage()
  const siteKey = captchaSiteKey()
  const [token, setToken] = useState('')
  const [failed, setFailed] = useState(false)
  const [round, setRound] = useState(0)
  const onToken = useCallback((t: string) => {
    setToken(t)
    setFailed(false)
  }, [])
  const onError = useCallback(() => {
    setToken('')
    setFailed(true)
  }, [])
  const reset = useCallback(() => {
    setToken('')
    setRound((r) => r + 1)
  }, [])
  const widget = siteKey ? (
    <div className="mb-3">
      <Captcha key={round} siteKey={siteKey} lang={lang} onToken={onToken} onError={onError} />
    </div>
  ) : null
  return { token: token || undefined, ready: !siteKey || !!token, failed, reset, widget }
}
