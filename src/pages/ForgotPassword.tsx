import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import AuthLayout, { AuthField, SubmitButton } from '../components/AuthLayout'
import { useLanguage } from '../hooks/useLanguage'

// /forgot-password: emails a link to /reset-password. The answer is the same whether or not the email has an
// account, so the page can't be used to find out who is registered.
function ForgotPassword() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setBusy(false)
    // only a rate limit / network problem is worth showing; "no such user" is never reported
    if (error && error.status === 429) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  return (
    <AuthLayout
      promoTitle={t('authLoginPromoTitle')}
      promoText={t('authLoginPromoText')}
      title={t('forgotTitle')}
      social={false}
      footer={
        <Link to="/login" className="text-blue-batik font-semibold hover:underline">
          {t('backToLogin')}
        </Link>
      }
    >
      {sent ? (
        <p role="status" className="text-green-800 bg-green-50 text-sm rounded-lg px-3 py-2">
          {t('forgotSent')}
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
          <p className="mb-4 text-sm text-gray-600">{t('forgotIntro')}</p>
          {error && (
            <p role="alert" className="text-red-700 bg-red-50 text-sm rounded-lg px-3 py-2 mb-4">
              {error}
            </p>
          )}
          <AuthField label={t('emailAddress')} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <SubmitButton busy={busy}>{t('forgotSend')}</SubmitButton>
        </form>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword
