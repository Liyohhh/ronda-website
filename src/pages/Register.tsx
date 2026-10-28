import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AuthLayout, { AuthField, AuthNote, PasswordChecklist, PasswordField, SubmitButton, AUTH_LINK } from '../components/AuthLayout'
import { useAuthCaptcha } from '../components/AuthCaptcha'
import { useLanguage } from '../hooks/useLanguage'
import { useAuth } from '../hooks/useSession'
import { authErrorKey, resendConfirmation, signUp } from '../services/auth'
import { PASSWORD_MAX, passwordOk, passwordRules } from '../data/passwordRules'
import type { TranslationKey } from '../i18n/translations'

// /register: name, email, a strong password (checked as it is typed, and again by Supabase), agreement to the
// terms and privacy notice, a bot check when one is set up. The account works once the emailed link is opened.
function Register() {
  const { t, lang } = useLanguage()
  const { session, loading } = useAuth()
  const captcha = useAuthCaptcha()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState<TranslationKey | null>(null)
  const [sentTo, setSentTo] = useState('')
  const [resent, setResent] = useState(false)
  const [busy, setBusy] = useState(false)
  const rules = passwordRules(password, email)
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!passwordOk(password, email)) return setError('pwNotStrong')
    if (password !== confirmPassword) return setError('passwordsMismatch')
    if (!agreed) return setError('authMustAgree')
    if (!captcha.ready) return setError('authCaptchaWait')

    setBusy(true)
    const err = await signUp(name, email, password, lang, captcha.token)
    setBusy(false)
    captcha.reset()
    if (err) return setError(authErrorKey(err))
    setSentTo(email.trim())
    setPassword('')
    setConfirmPassword('')
  }

  const resend = async () => {
    setError(null)
    if (!captcha.ready) return setError('authCaptchaWait')
    setBusy(true)
    const err = await resendConfirmation(sentTo, captcha.token)
    setBusy(false)
    captcha.reset()
    if (err) return setError(authErrorKey(err))
    setResent(true)
  }

  if (!loading && session) return <Navigate to="/dashboard" replace />

  return (
    <AuthLayout
      promoTitle={t('authRegisterPromoTitle')}
      promoText={t('authRegisterPromoText')}
      title={sentTo ? t('authCheckInboxTitle') : t('signUpTitle')}
      social={!sentTo}
      footer={
        <>
          {t('haveAccount')}{' '}
          <Link to="/login" className={AUTH_LINK}>
            {t('login')}
          </Link>
        </>
      }
    >
      {sentTo ? (
        <div>
          <AuthNote kind="ok">{t('authCheckInbox').replace('{email}', sentTo)}</AuthNote>
          <p className="mb-4 text-sm text-gray-600">{t('authCheckInboxHint')}</p>
          {error && <AuthNote kind="error">{t(error)}</AuthNote>}
          {resent && <AuthNote kind="info">{t('authConfirmResent')}</AuthNote>}
          {!resent && captcha.widget}
          <button
            type="button"
            onClick={resend}
            disabled={busy || resent}
            className="w-full h-11 rounded-full border border-gold text-navy font-semibold hover:bg-gold-soft disabled:opacity-60 transition-colors"
          >
            {busy ? t('pleaseWait') : t('authResendConfirm')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <AuthNote kind="error">{t(error)}</AuthNote>}
          <AuthField label={t('fullName')} type="text" autoComplete="name" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} required />
          <AuthField label={t('emailAddress')} type="email" autoComplete="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} required />
          <PasswordField
            id="reg-password"
            label={t('password')}
            autoComplete="new-password"
            minLength={8}
            maxLength={PASSWORD_MAX}
            aria-describedby="reg-password-rules"
            aria-invalid={password.length > 0 && !passwordOk(password, email)}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <PasswordChecklist id="reg-password-rules" rules={rules} />
          <PasswordField
            id="reg-password2"
            label={t('confirmPassword')}
            autoComplete="new-password"
            maxLength={PASSWORD_MAX}
            aria-invalid={mismatch}
            aria-describedby={mismatch ? 'reg-password2-note' : undefined}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {mismatch && <p id="reg-password2-note" className="-mt-2 mb-3 text-xs text-red-700">{t('passwordsMismatch')}</p>}
          <label className="mb-3 flex items-start gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} required className="mt-0.5 h-4 w-4 accent-navy" />
            <span>
              {t('authAgreePrefix')}{' '}
              <Link to="/help/policies" target="_blank" className={AUTH_LINK}>{t('authAgreeLink')}</Link>
            </span>
          </label>
          {captcha.widget}
          {captcha.failed && <AuthNote kind="error">{t('authErrCaptcha')}</AuthNote>}
          <SubmitButton busy={busy}>{t('authCreateAccount')}</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}

export default Register
