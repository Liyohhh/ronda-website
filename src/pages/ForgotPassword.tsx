import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout, { AuthField, AuthNote, SubmitButton, AUTH_LINK } from '../components/AuthLayout'
import { useAuthCaptcha } from '../components/AuthCaptcha'
import { useLanguage } from '../hooks/useLanguage'
import { authErrorKey, sendResetLink } from '../services/auth'
import type { TranslationKey } from '../i18n/translations'

// /forgot-password: emails a link to /reset-password. The answer is the same whether or not the email has an
// account, so the page can't be used to find out who is registered.
function ForgotPassword() {
  const { t } = useLanguage()
  const captcha = useAuthCaptcha()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<TranslationKey | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!captcha.ready) return setError('authCaptchaWait')
    setBusy(true)
    const err = await sendResetLink(email, captcha.token)
    setBusy(false)
    captcha.reset()
    // only a rate limit / network problem is worth showing; "no such user" is never reported
    const key = authErrorKey(err)
    if (key === 'authErrTooMany' || key === 'authErrNetwork' || key === 'authErrCaptcha') return setError(key)
    setSent(true)
  }

  return (
    <AuthLayout
      promoTitle={t('authLoginPromoTitle')}
      promoText={t('authLoginPromoText')}
      title={t('forgotTitle')}
      social={false}
      footer={
        <Link to="/login" className={AUTH_LINK}>
          {t('backToLogin')}
        </Link>
      }
    >
      {sent ? (
        <AuthNote kind="ok">{t('forgotSent')}</AuthNote>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="mb-4 text-sm text-gray-600">{t('forgotIntro')}</p>
          {error && <AuthNote kind="error">{t(error)}</AuthNote>}
          <AuthField label={t('emailAddress')} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          {captcha.widget}
          <SubmitButton busy={busy}>{t('forgotSend')}</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword
