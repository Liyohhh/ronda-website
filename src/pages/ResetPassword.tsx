import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import AuthLayout, { AuthField, SubmitButton } from '../components/AuthLayout'
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
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) return setError(t('passwordTooShort'))
    if (password !== confirm) return setError(t('passwordsMismatch'))
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) return setError(error.message)
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
        <Link to="/login" className="text-[#1C2B4A] font-semibold hover:underline">
          {t('backToLogin')}
        </Link>
      }
    >
      {loading ? (
        <p className="text-sm text-gray-500">{t('pleaseWait')}</p>
      ) : done ? (
        <p role="status" className="text-green-800 bg-green-50 text-sm rounded-lg px-3 py-2">{t('resetDone')}</p>
      ) : !session ? (
        <div>
          <p role="alert" className="text-amber-900 bg-amber-50 text-sm rounded-lg px-3 py-2 mb-4">{t('resetNoLink')}</p>
          <Link to="/forgot-password" className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#1C2B4A] font-semibold text-white hover:bg-[#14203A]">
            {t('resetRequestNew')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && (
            <p role="alert" className="text-red-700 bg-red-50 text-sm rounded-lg px-3 py-2 mb-4">{error}</p>
          )}
          <AuthField label={t('newPassword')} type="password" autoComplete="new-password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} required />
          <AuthField label={t('confirmPassword')} type="password" autoComplete="new-password" minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          <SubmitButton busy={busy}>{t('resetSave')}</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}

export default ResetPassword
