import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import AuthLayout, { AuthNote, PasswordChecklist, PasswordField, SubmitButton, AUTH_LINK } from '../components/AuthLayout'
import { PASSWORD_MAX, passwordOk, passwordRules } from '../data/passwordRules'
import { authErrorKey } from '../services/auth'
import type { TranslationKey } from '../i18n/translations'
import { useLanguage } from '../hooks/useLanguage'
import { useAuth } from '../hooks/useSession'

// /reset-password: opened from the reset email. Supabase signs the person in from the link, then they choose a
// new password. Without that sign-in (old or used link) the page offers a new link instead.
function ResetPassword() {
  const { t } = useLanguage()
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<TranslationKey | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!passwordOk(password, session?.user.email)) return setError('pwNotStrong')
    if (password !== confirm) return setError('passwordsMismatch')
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) return setError(authErrorKey(error))
    setDone(true)
    setTimeout(() => navigate('/dashboard', { replace: true }), 1500)
  }

  return (
    <AuthLayout
      promoTitle={t('authLoginPromoTitle')}
      promoText={t('authLoginPromoText')}
      title={t('resetTitle')}
      social={false}
      footer={
        <Link to="/login" className={AUTH_LINK}>
          {t('backToLogin')}
        </Link>
      }
    >
      {loading ? (
        <p className="text-sm text-gray-500">{t('pleaseWait')}</p>
      ) : done ? (
        <AuthNote kind="ok">{t('resetDone')}</AuthNote>
      ) : !session ? (
        <div>
          <AuthNote kind="error">{t('resetNoLink')}</AuthNote>
          <Link to="/forgot-password" className="inline-flex h-11 w-full items-center justify-center rounded-full bg-navy font-semibold text-white hover:bg-navy-deep">
            {t('resetRequestNew')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <AuthNote kind="error">{t(error)}</AuthNote>}
          <PasswordField id="reset-password" label={t('newPassword')} autoComplete="new-password" minLength={8} maxLength={PASSWORD_MAX} aria-describedby="reset-password-rules" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <PasswordChecklist id="reset-password-rules" rules={passwordRules(password, session?.user.email)} />
          <PasswordField id="reset-password2" label={t('confirmPassword')} autoComplete="new-password" maxLength={PASSWORD_MAX} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <SubmitButton busy={busy}>{t('resetSave')}</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}

export default ResetPassword
