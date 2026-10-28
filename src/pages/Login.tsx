import { useState } from 'react'
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom'
import AuthLayout, { AuthField, AuthNote, PasswordField, SubmitButton, AUTH_LINK } from '../components/AuthLayout'
import { useAuthCaptcha } from '../components/AuthCaptcha'
import { useLanguage } from '../hooks/useLanguage'
import { useAuth } from '../hooks/useSession'
import { safeNext } from '../data/safeNext'
import { authErrorKey, linkError, resendConfirmation, signIn } from '../services/auth'
import type { TranslationKey } from '../i18n/translations'

// /login. Also where the sign-up confirmation link lands (?confirmed=1): Supabase signs the person in from the
// link, so they go straight on to ?next; a link that didn't work says so and offers a new email.
function Login() {
  const { t } = useLanguage()
  const { session, loading } = useAuth()
  const captcha = useAuthCaptcha()
  const [params] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<TranslationKey | null>(null)
  const [notice, setNotice] = useState<TranslationKey | null>(null)
  const [busy, setBusy] = useState(false)
  // read once: the link's error is in the address only on arrival
  const [badLink] = useState(() => linkError(window.location.hash, window.location.search))
  const navigate = useNavigate()
  // back to the page that asked for a sign-in (only a path on this site)
  const target = safeNext(params.get('next'))
  const confirmed = params.get('confirmed') === '1'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setNotice(null)
    if (!captcha.ready) return setError('authCaptchaWait')
    setBusy(true)
    const err = await signIn(email, password, captcha.token)
    setBusy(false)
    captcha.reset()
    if (err) return setError(authErrorKey(err))
    navigate(target, { replace: true })
  }

  const resend = async () => {
    setError(null)
    if (!captcha.ready) return setError('authCaptchaWait')
    setBusy(true)
    const err = await resendConfirmation(email, captcha.token)
    setBusy(false)
    captcha.reset()
    if (err) return setError(authErrorKey(err))
    setNotice('authConfirmResent')
  }

  // already signed in (or just signed in by the confirmation link): nothing to do here
  if (!loading && session) return <Navigate to={target} replace />

  return (
    <AuthLayout
      promoTitle={t('authLoginPromoTitle')}
      promoText={t('authLoginPromoText')}
      title={t('signInTitle')}
      footer={
        <>
          {t('noAccount')}{' '}
          <Link to="/register" className={AUTH_LINK}>
            {t('signUp')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {badLink && <AuthNote kind="error">{t(badLink === 'expired' ? 'authLinkExpired' : 'authLinkFailed')}</AuthNote>}
        {confirmed && !badLink && !loading && <AuthNote kind="ok">{t('authConfirmedSignIn')}</AuthNote>}
        {error && <AuthNote kind="error">{t(error)}</AuthNote>}
        {notice && <AuthNote kind="ok">{t(notice)}</AuthNote>}
        <AuthField
          label={t('emailAddress')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <PasswordField
          id="login-password"
          label={t('password')}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="-mt-1 mb-2 text-end text-sm">
          <Link to="/forgot-password" className={AUTH_LINK}>{t('forgotPasswordLink')}</Link>
        </p>
        {captcha.widget}
        {captcha.failed && <AuthNote kind="error">{t('authErrCaptcha')}</AuthNote>}
        <SubmitButton busy={busy}>{t('continueBtn')}</SubmitButton>
        {(error === 'authErrNotConfirmed' || badLink) && (
          <button
            type="button"
            onClick={resend}
            disabled={busy || !email.trim()}
            className="mt-3 w-full h-11 rounded-full border border-gold text-navy font-semibold hover:bg-gold-soft disabled:opacity-60 transition-colors"
          >
            {t('authResendConfirm')}
          </button>
        )}
      </form>
    </AuthLayout>
  )
}

export default Login
